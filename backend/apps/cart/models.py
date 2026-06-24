from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint
from django.db.models import Q


class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"Cart({self.buyer_id})"


class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            CheckConstraint(condition=Q(quantity__gt=0), name="cart_item_quantity_positive"),
            models.UniqueConstraint(fields=["cart", "product"], name="unique_product_per_cart"),
        ]
        indexes = [
            models.Index(fields=["cart"]),
            models.Index(fields=["product"]),
        ]

    def __str__(self) -> str:
        return f"CartItem({self.cart_id}, {self.product_id}, qty={self.quantity})"

