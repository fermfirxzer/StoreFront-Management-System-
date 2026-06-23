from __future__ import annotations

import uuid
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint
from django.db.models import Q


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="products",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.01"))
    quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            CheckConstraint(check=Q(unit_price__gt=0), name="unit_price_positive"),
            CheckConstraint(check=Q(quantity__gte=0), name="quantity_non_negative"),
        ]
        indexes = [
            models.Index(fields=["seller", "-created_at"]),
            models.Index(fields=["title"]),
        ]

    def __str__(self) -> str:
        return self.title

