from __future__ import annotations

from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import serializers

from apps.products.models import Product
from apps.products.serializers import ProductWriteSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


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

    def test_validate_quantity_rejects_negative_value_directly(self) -> None:
        serializer = ProductWriteSerializer()

        with self.assertRaises(serializers.ValidationError):
            serializer.validate_quantity(-1)


class ProductReadSerializerTests(TestCase):
    def setUp(self) -> None:
        self.seller = User.objects.create_user(
            email="seller-read@example.com",
            password="StrongPass123!",
            role="SELLER",
        )

    def test_get_image_returns_none_when_product_has_no_image(self) -> None:
        product = Product.objects.create(
            seller=self.seller,
            title="Notebook",
            description="Plain",
            unit_price=Decimal("10.00"),
            quantity=2,
        )

        from apps.products.serializers import ProductReadSerializer

        serializer = ProductReadSerializer(product, context={})

        self.assertIsNone(serializer.data["image"])

    def test_get_image_returns_relative_url_without_request_context(self) -> None:
        image = SimpleUploadedFile(
            "product.jpg",
            b"fake image bytes",
            content_type="image/jpeg",
        )
        product = Product.objects.create(
            seller=self.seller,
            title="Camera",
            description="Compact",
            unit_price=Decimal("100.00"),
            quantity=1,
            image=image,
        )

        from apps.products.serializers import ProductReadSerializer

        serializer = ProductReadSerializer(product, context={})

        self.assertEqual(serializer.data["image"], product.image.url)
