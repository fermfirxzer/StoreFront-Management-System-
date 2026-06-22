from __future__ import annotations

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import User, UserRole


def create_user_account(*, email: str, password: str, role: str) -> User:
    validate_password(password)
    normalized_email = User.objects.normalize_email(email)
    return User.objects.create_user(
        email=normalized_email,
        password=password,
        role=role,
    )


def authenticate_user(*, email: str, password: str) -> User | None:
    return authenticate(email=User.objects.normalize_email(email), password=password)


def build_token_user_payload(user: User) -> dict[str, object]:
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
    }


def validate_role(role: str) -> str:
    allowed_roles = {choice for choice, _ in UserRole.choices}
    if role not in allowed_roles:
        raise ValidationError("Invalid role selected.")
    return role

