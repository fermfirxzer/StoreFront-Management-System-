from __future__ import annotations

from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.accounts.models import UserRole
from apps.accounts.services import (
    authenticate_user,
    build_token_user_payload,
    create_user_account,
    validate_role,
)


class AccountServiceTests(TestCase):
    def test_validate_role_accepts_allowed_roles(self) -> None:
        self.assertEqual(validate_role(UserRole.BUYER), UserRole.BUYER)
        self.assertEqual(validate_role(UserRole.SELLER), UserRole.SELLER)

    def test_validate_role_rejects_invalid_role(self) -> None:
        with self.assertRaisesMessage(ValidationError, "Invalid role selected."):
            validate_role("ADMIN")

    def test_create_user_account_normalizes_email(self) -> None:
        user = create_user_account(
            email="NewUser@Example.com",
            password="StrongPass123!",
            role=UserRole.SELLER,
        )

        self.assertEqual(user.email, "NewUser@example.com")
        self.assertTrue(user.check_password("StrongPass123!"))

    def test_authenticate_user_returns_user_or_none(self) -> None:
        user = create_user_account(
            email="AuthUser@example.com",
            password="StrongPass123!",
            role=UserRole.BUYER,
        )

        self.assertEqual(
            authenticate_user(email="AuthUser@example.com", password="StrongPass123!"),
            user,
        )
        self.assertIsNone(
            authenticate_user(email="AuthUser@example.com", password="WrongPass123!")
        )

    def test_build_token_user_payload(self) -> None:
        user = create_user_account(
            email="PayloadUser@example.com",
            password="StrongPass123!",
            role=UserRole.BUYER,
        )

        self.assertEqual(
            build_token_user_payload(user),
            {
                "id": user.id,
                "email": "PayloadUser@example.com",
                "role": UserRole.BUYER,
            },
        )
