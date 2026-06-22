from __future__ import annotations

from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.accounts.models import User, UserRole


class UserManagerTests(TestCase):
    def test_create_user_normalizes_email_and_hashes_password(self) -> None:
        user = User.objects.create_user(
            email="TestUser@Example.com",
            password="StrongPass123!",
            role=UserRole.BUYER,
        )

        self.assertEqual(user.email, "TestUser@example.com")
        self.assertTrue(user.check_password("StrongPass123!"))
        self.assertEqual(user.role, UserRole.BUYER)

    def test_create_user_requires_email(self) -> None:
        with self.assertRaisesMessage(ValueError, "The email address must be provided."):
            User.objects.create_user(email="", password="StrongPass123!", role=UserRole.BUYER)

    def test_create_superuser_sets_admin_flags(self) -> None:
        superuser = User.objects.create_superuser(
            email="Admin@Example.com",
            password="StrongPass123!",
        )

        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertEqual(superuser.role, UserRole.SELLER)

    def test_create_superuser_requires_staff_flag(self) -> None:
        with self.assertRaisesMessage(ValueError, "Superuser must have is_staff=True."):
            User.objects.create_superuser(
                email="admin@example.com",
                password="StrongPass123!",
                is_staff=False,
            )

    def test_create_superuser_requires_superuser_flag(self) -> None:
        with self.assertRaisesMessage(ValueError, "Superuser must have is_superuser=True."):
            User.objects.create_superuser(
                email="admin@example.com",
                password="StrongPass123!",
                is_superuser=False,
            )


class UserModelTests(TestCase):
    def test_str_returns_email(self) -> None:
        user = User.objects.create_user(
            email="someone@example.com",
            password="StrongPass123!",
            role=UserRole.BUYER,
        )

        self.assertEqual(str(user), "someone@example.com")
