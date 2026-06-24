from __future__ import annotations

import shutil
from decimal import Decimal
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test import override_settings
from rest_framework.exceptions import NotFound

from apps.products.models import Product
from apps.products.services import ProductService

User = get_user_model()


@override_settings(MEDIA_ROOT=Path(settings.BASE_DIR) / "test_media")
class ProductServiceTests(TestCase):
    def setUp(self) -> None:
        self.service = ProductService()
        self.seller = User.objects.create_user(
            email="seller-service@example.com",
            password="StrongPass123!",
            role="SELLER",
        )
        self.other_seller = User.objects.create_user(
            email="other-service@example.com",
            password="StrongPass123!",
            role="SELLER",
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title="Desk lamp",
            description="Warm light",
            unit_price=Decimal("24.99"),
            quantity=5,
        )

    def tearDown(self) -> None:
        shutil.rmtree(settings.MEDIA_ROOT, ignore_errors=True)

    def test_get_product_by_id_raises_not_found_for_missing_product(self) -> None:
        with self.assertRaisesMessage(NotFound, "Product not found."):
            self.service.get_product_by_id(uuid4())

    def test_ensure_owner_rejects_other_seller(self) -> None:
        with self.assertRaisesMessage(
            PermissionDenied,
            "You do not have permission to modify this product.",
        ):
            self.service.ensure_owner(user=self.other_seller, product=self.product)

    def test_update_product_replaces_image_when_provided(self) -> None:
        original_image = SimpleUploadedFile(
            "original.jpg",
            b"original image bytes",
            content_type="image/jpeg",
        )
        self.product.image = original_image
        self.product.save()
        old_image_path = Path(self.product.image.path)

        image = SimpleUploadedFile(
            "updated.jpg",
            b"fake image bytes",
            content_type="image/jpeg",
        )

        updated_product = self.service.update_product(
            product=self.product,
            data={
                "title": "Desk lamp pro",
                "description": "Warmer light",
                "unit_price": Decimal("29.99"),
                "quantity": 8,
            },
            image=image,
        )

        self.assertEqual(updated_product.title, "Desk lamp pro")
        self.assertTrue(updated_product.image.name.startswith("products/"))
        self.assertFalse(old_image_path.exists())
        self.assertTrue(Path(updated_product.image.path).exists())

    def test_update_product_removes_image_when_requested(self) -> None:
        image = SimpleUploadedFile(
            "product.jpg",
            b"fake image bytes",
            content_type="image/jpeg",
        )
        self.product.image = image
        self.product.save()
        old_image_path = Path(self.product.image.path)

        updated_product = self.service.update_product(
            product=self.product,
            data={},
            remove_image=True,
        )

        self.assertFalse(updated_product.image)
        self.assertFalse(old_image_path.exists())

    def test_delete_product_deletes_image_file(self) -> None:
        image = SimpleUploadedFile(
            "product.jpg",
            b"fake image bytes",
            content_type="image/jpeg",
        )
        self.product.image = image
        self.product.save()
        image_path = Path(self.product.image.path)

        self.service.delete_product(self.product)

        self.assertFalse(Product.objects.filter(id=self.product.id).exists())
        self.assertFalse(image_path.exists())
