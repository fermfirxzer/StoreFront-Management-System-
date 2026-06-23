from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase

from apps.products.models import Product

User = get_user_model()


class ProductModelTests(TestCase):
    def setUp(self) -> None:
        self.seller = User.objects.create_user(
            email="seller-model@example.com",
            password="StrongPass123!",
            role="SELLER",
        )

    def test_product_requires_positive_unit_price(self) -> None:
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                seller=self.seller,
                title="Invalid price",
                description="",
                unit_price=Decimal("0.00"),
                quantity=1,
            )

    def test_product_requires_non_negative_quantity(self) -> None:
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                seller=self.seller,
                title="Invalid quantity",
                description="",
                unit_price=Decimal("10.00"),
                quantity=-1,
            )

    def test_str_returns_title(self) -> None:
        product = Product.objects.create(
            seller=self.seller,
            title="Desk lamp",
            description="Warm light",
            unit_price=Decimal("24.99"),
            quantity=5,
        )

        self.assertEqual(str(product), "Desk lamp")
