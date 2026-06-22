from __future__ import annotations

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase, APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken

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
        self.assertIn("refresh", response.data["data"]["tokens"])
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

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["user"]["role"], "BUYER")
        self.assertIn("access", response.data["data"]["tokens"])
        self.assertIn("refresh", response.data["data"]["tokens"])

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
        refresh_token = login_response.data["data"]["tokens"]["refresh"]

        response = self.client.post(
            reverse("refresh"),
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertIn("access", response.data["data"])

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
        refresh = RefreshToken.for_user(user)
        self.client.force_authenticate(user=user)

        logout_response = self.client.post(
            reverse("logout"),
            {"refresh": str(refresh)},
            format="json",
        )

        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertEqual(logout_response.data["status"], "success")

        refresh_response = self.client.post(
            reverse("refresh"),
            {"refresh": str(refresh)},
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
