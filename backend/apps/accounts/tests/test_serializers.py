from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User, UserRole
from apps.accounts.serializers import LoginSerializer, RegisterSerializer


class RegisterSerializerTests(TestCase):
    def test_register_serializer_accepts_valid_payload(self) -> None:
        serializer = RegisterSerializer(
            data={
                "email": "valid@example.com",
                "password": "StrongPass123!",
                "password_confirmation": "StrongPass123!",
                "role": "BUYER",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertEqual(user.email, "valid@example.com")
        self.assertEqual(user.role, "BUYER")

    def test_register_serializer_rejects_password_mismatch(self) -> None:
        serializer = RegisterSerializer(
            data={
                "email": "valid@example.com",
                "password": "StrongPass123!",
                "password_confirmation": "DifferentPass123!",
                "role": "BUYER",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["password_confirmation"][0],
            "Passwords do not match.",
        )

    def test_register_serializer_rejects_duplicate_email(self) -> None:
        User.objects.create_user(
            email="duplicate@example.com",
            password="StrongPass123!",
            role=UserRole.BUYER,
        )
        serializer = RegisterSerializer(
            data={
                "email": "duplicate@example.com",
                "password": "StrongPass123!",
                "password_confirmation": "StrongPass123!",
                "role": "BUYER",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["email"][0],
            "A user with this email already exists.",
        )

    def test_register_serializer_rejects_invalid_role(self) -> None:
        serializer = RegisterSerializer(
            data={
                "email": "valid@example.com",
                "password": "StrongPass123!",
                "password_confirmation": "StrongPass123!",
                "role": "ADMIN",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors["role"][0], '"ADMIN" is not a valid choice.')


class LoginSerializerTests(TestCase):
    def test_login_serializer_accepts_valid_credentials(self) -> None:
        user = User.objects.create_user(
            email="login@example.com",
            password="StrongPass123!",
            role=UserRole.SELLER,
        )
        serializer = LoginSerializer(
            data={"email": "login@example.com", "password": "StrongPass123!"}
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["user"], user)

    def test_login_serializer_rejects_invalid_credentials(self) -> None:
        User.objects.create_user(
            email="login@example.com",
            password="StrongPass123!",
            role=UserRole.SELLER,
        )
        serializer = LoginSerializer(
            data={"email": "login@example.com", "password": "WrongPass123!"}
        )

        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors["non_field_errors"][0], "Invalid email or password.")
