"""Custom permission classes live here."""

from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsSeller(BasePermission):
    message = "Only sellers can perform this action."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "SELLER")


class IsBuyer(BasePermission):
    message = "Only buyers can perform this action."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "BUYER")


class IsProductOwner(BasePermission):
    message = "You can only manage your own products."

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and getattr(obj, "seller_id", None) == user.id)

