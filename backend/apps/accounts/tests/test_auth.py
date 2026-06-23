from __future__ import annotations

from django.contrib.auth import get_user_model
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase, APIRequestFactory
from rest_framework_simplejwt.exceptions import TokenError
from unittest.mock import patch

from apps.accounts.views import MeAPIView
from core.permissions import IsSeller

User = get_user_model()


class AuthenticationTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()

    def test_register_creates_user_and_returns_tokens(self) -> None:
        response = self.client.post(
            reverse("register"),
            {
                "email": "seller@example.com",
                "password": "StrongPass123!",
                "password_confirmation": "StrongPass123!",
                "role": "SELLER",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["user"]["email"], "seller@example.com")
        self.assertEqual(response.data["data"]["user"]["role"], "SELLER")
        self.assertIn("access", response.data["data"]["tokens"])
        self.assertNotIn("refresh", response.data["data"]["tokens"])
        self.assertIn(settings.REFRESH_TOKEN_COOKIE_NAME, response.cookies)
        self.assertTrue(User.objects.filter(email="seller@example.com").exists())

    def test_register_returns_validation_error_message(self) -> None:
        response = self.client.post(
            reverse("register"),
            {
                "email": "seller@example.com",
                "password": "StrongPass123!",
                "password_confirmation": "StrongPass123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["status"], "error")
        self.assertEqual(response.data["message"], "This field is required.")
        self.assertIn("role", response.data["errors"])

    def test_login_returns_tokens_for_existing_user(self) -> None:
        User.objects.create_user(
            email="buyer@example.com",
            password="StrongPass123!",
            role="BUYER",
        )

        response = self.client.post(
            reverse("login"),
            {
                "email": "buyer@example.com",
                "password": "StrongPass123!",
            },
            format="json",
        )

        if response.status_code != status.HTTP_200_OK:
            self.fail(repr(response.data))
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["user"]["role"], "BUYER")
        self.assertIn("access", response.data["data"]["tokens"])
        self.assertNotIn("refresh", response.data["data"]["tokens"])
        self.assertIn(settings.REFRESH_TOKEN_COOKIE_NAME, response.cookies)

    def test_login_rejects_disabled_user(self) -> None:
        user = User.objects.create_user(
            email="disabled@example.com",
            password="StrongPass123!",
            role="BUYER",
        )
        user.is_active = False
        user.save(update_fields=["is_active"])

        with patch("apps.accounts.serializers.authenticate_user", return_value=user):
            response = self.client.post(
                reverse("login"),
                {
                    "email": user.email,
                    "password": "StrongPass123!",
                },
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "This account is disabled.")

    def test_refresh_returns_new_access_token(self) -> None:
        user = User.objects.create_user(
            email="refresh@example.com",
            password="StrongPass123!",
            role="BUYER",
        )
        login_response = self.client.post(
            reverse("login"),
            {
                "email": user.email,
                "password": "StrongPass123!",
            },
            format="json",
        )
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] = login_response.cookies[
            settings.REFRESH_TOKEN_COOKIE_NAME
        ].value
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME][
            "path"
        ] = settings.REFRESH_TOKEN_COOKIE_PATH

        response = self.client.post(
            reverse("refresh"),
            format="json",
        )

        if response.status_code != status.HTTP_200_OK:
            self.fail(repr(response.data))
        self.assertEqual(response.data["status"], "success")
        self.assertIn("access", response.data["data"]["tokens"])
        self.assertIn("user", response.data["data"])
        self.assertIn(settings.REFRESH_TOKEN_COOKIE_NAME, response.cookies)

    def test_refresh_returns_401_when_session_cookie_is_missing(self) -> None:
        response = self.client.post(
            reverse("refresh"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["message"], "Refresh session is missing.")

    def test_refresh_returns_401_when_token_serializer_fails(self) -> None:
        user = User.objects.create_user(
            email="serializer-failure@example.com",
            password="StrongPass123!",
            role="BUYER",
        )
        login_response = self.client.post(
            reverse("login"),
            {
                "email": user.email,
                "password": "StrongPass123!",
            },
            format="json",
        )
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] = login_response.cookies[
            settings.REFRESH_TOKEN_COOKIE_NAME
        ].value
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME][
            "path"
        ] = settings.REFRESH_TOKEN_COOKIE_PATH

        with patch("apps.accounts.views.SimpleJWTTokenRefreshSerializer.is_valid", side_effect=TokenError("Token is invalid or expired")):
            response = self.client.post(
                reverse("refresh"),
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["message"], "Token is invalid or expired")

    def test_failed_refresh_does_not_clear_cookie_after_rotation_race(self) -> None:
        user = User.objects.create_user(
            email="race@example.com",
            password="StrongPass123!",
            role="BUYER",
        )
        login_response = self.client.post(
            reverse("login"),
            {
                "email": user.email,
                "password": "StrongPass123!",
            },
            format="json",
        )
        original_refresh_cookie = login_response.cookies[
            settings.REFRESH_TOKEN_COOKIE_NAME
        ].value

        first_refresh_response = self.client.post(
            reverse("refresh"),
            format="json",
        )

        self.assertEqual(first_refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn(settings.REFRESH_TOKEN_COOKIE_NAME, first_refresh_response.cookies)

        stale_client = APIClient()
        stale_client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] = original_refresh_cookie
        stale_client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME][
            "path"
        ] = settings.REFRESH_TOKEN_COOKIE_PATH

        stale_refresh_response = stale_client.post(
            reverse("refresh"),
            format="json",
        )

        self.assertEqual(stale_refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn(settings.REFRESH_TOKEN_COOKIE_NAME, stale_refresh_response.cookies)

    def test_logout_ignores_invalid_refresh_token_and_clears_cookie(self) -> None:
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] = "not-a-valid-refresh-token"
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME][
            "path"
        ] = settings.REFRESH_TOKEN_COOKIE_PATH

        response = self.client.post(
            reverse("logout"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertIn(settings.REFRESH_TOKEN_COOKIE_NAME, response.cookies)
        self.assertEqual(response.cookies[settings.REFRESH_TOKEN_COOKIE_NAME]["max-age"], 0)

    def test_me_returns_authenticated_user(self) -> None:
        user = User.objects.create_user(
            email="me@example.com",
            password="StrongPass123!",
            role="SELLER",
        )
        self.client.force_authenticate(user=user)

        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["email"], "me@example.com")
        self.assertEqual(response.data["data"]["role"], "SELLER")

    def test_logout_blacklists_refresh_token(self) -> None:
        user = User.objects.create_user(
            email="logout@example.com",
            password="StrongPass123!",
            role="BUYER",
        )
        login_response = self.client.post(
            reverse("login"),
            {
                "email": user.email,
                "password": "StrongPass123!",
            },
            format="json",
        )
        refresh_cookie_value = login_response.cookies[
            settings.REFRESH_TOKEN_COOKIE_NAME
        ].value
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] = refresh_cookie_value
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME][
            "path"
        ] = settings.REFRESH_TOKEN_COOKIE_PATH

        logout_response = self.client.post(
            reverse("logout"),
            format="json",
        )

        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertEqual(logout_response.data["status"], "success")
        self.assertIn(settings.REFRESH_TOKEN_COOKIE_NAME, logout_response.cookies)
        self.assertEqual(logout_response.cookies[settings.REFRESH_TOKEN_COOKIE_NAME]["max-age"], 0)

        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] = refresh_cookie_value
        self.client.cookies[settings.REFRESH_TOKEN_COOKIE_NAME][
            "path"
        ] = settings.REFRESH_TOKEN_COOKIE_PATH

        refresh_response = self.client.post(
            reverse("refresh"),
            format="json",
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)


class PermissionTests(APITestCase):
    def test_is_seller_permission_allows_seller_only(self) -> None:
        seller = User.objects.create_user(
            email="seller-permission@example.com",
            password="StrongPass123!",
            role="SELLER",
        )
        buyer = User.objects.create_user(
            email="buyer-permission@example.com",
            password="StrongPass123!",
            role="BUYER",
        )
        factory = APIRequestFactory()
        request = factory.get("/api/auth/me/")
        request.user = seller
        self.assertTrue(IsSeller().has_permission(request, MeAPIView()))

        buyer_request = factory.get("/api/auth/me/")
        buyer_request.user = buyer
        self.assertFalse(IsSeller().has_permission(buyer_request, MeAPIView()))
