from __future__ import annotations

from decimal import Decimal

from django.test import TestCase

from apps.products.serializers import ProductWriteSerializer


class ProductWriteSerializerTests(TestCase):
    def test_unit_price_must_be_greater_than_zero(self) -> None:
        serializer = ProductWriteSerializer(
            data={
                "title": "Camera",
                "description": "Compact",
                "unit_price": Decimal("0.00"),
                "quantity": 1,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("unit_price", serializer.errors)

    def test_quantity_must_not_be_negative(self) -> None:
        serializer = ProductWriteSerializer(
            data={
                "title": "Camera",
                "description": "Compact",
                "unit_price": Decimal("100.00"),
                "quantity": -1,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("quantity", serializer.errors)
