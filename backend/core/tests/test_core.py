from __future__ import annotations

from django.core.exceptions import PermissionDenied
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.test import APITestCase

from core.exceptions import custom_exception_handler
from core.permissions import IsBuyer, IsSeller
from core.responses import error_response, success_response
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import APIRequestFactory


class CoreResponseTests(APITestCase):
    def test_success_response_wraps_payload(self) -> None:
        response = success_response({"ok": True}, status_code=201)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"], {"ok": True})

    def test_error_response_wraps_message_and_errors(self) -> None:
        response = error_response("Bad request", errors={"field": ["invalid"]}, status_code=400)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], "error")
        self.assertEqual(response.data["message"], "Bad request")
        self.assertEqual(response.data["errors"], {"field": ["invalid"]})


class CustomExceptionHandlerTests(APITestCase):
    def test_validation_error_uses_first_nested_message(self) -> None:
        response = custom_exception_handler(
            ValidationError({"email": ["Enter a valid email address."]}),
            context={},
        )

        assert response is not None
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["message"], "Enter a valid email address.")
        self.assertEqual(response.data["errors"], {"email": ["Enter a valid email address."]})

    def test_permission_denied_uses_detail_message(self) -> None:
        response = custom_exception_handler(PermissionDenied("Not allowed."), context={})

        assert response is not None
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["message"], "Not allowed.")

    def test_api_exception_fallback_path(self) -> None:
        original_handler = custom_exception_handler.__globals__["exception_handler"]

        def fake_exception_handler(exc: Exception, context: dict[str, object]):
            return None

        try:
            custom_exception_handler.__globals__["exception_handler"] = fake_exception_handler
            response = custom_exception_handler(APIException("Boom"), context={})
        finally:
            custom_exception_handler.__globals__["exception_handler"] = original_handler

        assert response is not None
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.data["message"], "Boom")


class PermissionClassTests(APITestCase):
    def test_permission_classes_match_user_roles(self) -> None:
        factory = APIRequestFactory()
        seller = type("Seller", (), {"is_authenticated": True, "role": "SELLER"})()
        buyer = type("Buyer", (), {"is_authenticated": True, "role": "BUYER"})()

        seller_request = factory.get("/api/test/")
        seller_request.user = seller
        buyer_request = factory.get("/api/test/")
        buyer_request.user = buyer
        anonymous_request = factory.get("/api/test/")
        anonymous_request.user = AnonymousUser()

        self.assertTrue(IsSeller().has_permission(seller_request, view=object()))
        self.assertFalse(IsSeller().has_permission(buyer_request, view=object()))
        self.assertFalse(IsSeller().has_permission(anonymous_request, view=object()))
        self.assertTrue(IsBuyer().has_permission(buyer_request, view=object()))
        self.assertFalse(IsBuyer().has_permission(seller_request, view=object()))
