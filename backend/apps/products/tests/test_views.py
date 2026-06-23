from __future__ import annotations

import shutil
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.test import APIRequestFactory
from rest_framework.test import APITestCase

from apps.products.models import Product
from apps.products.views import ProductDetailView
from core.permissions import IsProductOwner
from core.permissions import IsSeller

User = get_user_model()


@override_settings(MEDIA_ROOT=Path(settings.BASE_DIR) / "test_media")
class ProductViewTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.seller = User.objects.create_user(
            email="seller@example.com",
            password="StrongPass123!",
            role="SELLER",
        )
        self.other_seller = User.objects.create_user(
            email="other-seller@example.com",
            password="StrongPass123!",
            role="SELLER",
        )
        self.buyer = User.objects.create_user(
            email="buyer@example.com",
            password="StrongPass123!",
            role="BUYER",
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title="Desk lamp",
            description="Warm light",
            unit_price=Decimal("24.99"),
            quantity=5,
        )
        self.other_product = Product.objects.create(
            seller=self.other_seller,
            title="Phone stand",
            description="Foldable stand",
            unit_price=Decimal("19.99"),
            quantity=0,
        )

    def tearDown(self) -> None:
        shutil.rmtree(settings.MEDIA_ROOT, ignore_errors=True)

    def authenticate(self, user) -> None:
        self.client.force_authenticate(user=user)

    def test_marketplace_list_requires_authentication(self) -> None:
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_seller_products_requires_authentication(self) -> None:
        response = self.client.get(reverse("seller-product-list-create"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_buyer_can_browse_marketplace_products(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 2)
        self.assertEqual(len(response.data["data"]["results"]), 2)

    def test_marketplace_list_uses_paginated_response(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"), {"page_size": 1, "page": 1})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["count"], 2)
        self.assertEqual(len(response.data["data"]["results"]), 1)
        self.assertIsNotNone(response.data["data"]["next"])

    def test_marketplace_search_filters_by_title_case_insensitively(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"), {"search": "PHONE"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(response.data["data"]["results"][0]["title"], "Phone stand")

    def test_marketplace_min_price_filter_works(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"), {"min_price": "20"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(response.data["data"]["results"][0]["title"], "Desk lamp")

    def test_marketplace_max_price_filter_works(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"), {"max_price": "20"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(response.data["data"]["results"][0]["title"], "Phone stand")

    def test_marketplace_in_stock_filter_works(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"), {"in_stock": "true"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(response.data["data"]["results"][0]["title"], "Desk lamp")

    def test_marketplace_out_of_stock_filter_works(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"), {"in_stock": "false"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(response.data["data"]["results"][0]["title"], "Phone stand")

    def test_marketplace_combined_filters_work(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(
            reverse("product-list"),
            {
                "search": "desk",
                "min_price": "20",
                "max_price": "30",
                "in_stock": "true",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(response.data["data"]["results"][0]["title"], "Desk lamp")

    def test_marketplace_response_does_not_expose_private_user_fields(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"))

        seller_payload = response.data["data"]["results"][0]["seller"]
        self.assertEqual(set(seller_payload.keys()), {"id", "email"})

    def test_invalid_price_filter_returns_400(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("product-list"), {"min_price": "abc"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_buyer_cannot_access_seller_product_list(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("seller-product-list-create"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_seller_can_list_own_products(self) -> None:
        self.authenticate(self.seller)

        response = self.client.get(reverse("seller-product-list-create"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(len(response.data["data"]["results"]), 1)
        self.assertEqual(response.data["data"]["results"][0]["title"], "Desk lamp")

    def test_seller_product_list_supports_pagination_and_search(self) -> None:
        self.authenticate(self.seller)
        Product.objects.create(
            seller=self.seller,
            title="Office chair",
            description="Mesh back",
            unit_price=Decimal("99.99"),
            quantity=4,
        )

        response = self.client.get(
            reverse("seller-product-list-create"),
            {"page_size": 1, "page": 1, "search": "office"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)
        self.assertEqual(len(response.data["data"]["results"]), 1)
        self.assertEqual(response.data["data"]["results"][0]["title"], "Office chair")

    def test_valid_data_creates_product_successfully(self) -> None:
        self.authenticate(self.seller)

        response = self.client.post(
            reverse("seller-product-list-create"),
            {
                "title": "Headphones",
                "description": "Noise cancelling",
                "unit_price": "199.99",
                "quantity": 8,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.filter(seller=self.seller).count(), 2)

    def test_unit_price_less_than_or_equal_to_zero_returns_400(self) -> None:
        self.authenticate(self.seller)

        response = self.client.post(
            reverse("seller-product-list-create"),
            {
                "title": "Headphones",
                "description": "Noise cancelling",
                "unit_price": "0.00",
                "quantity": 8,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_quantity_less_than_zero_returns_400(self) -> None:
        self.authenticate(self.seller)

        response = self.client.post(
            reverse("seller-product-list-create"),
            {
                "title": "Headphones",
                "description": "Noise cancelling",
                "unit_price": "199.99",
                "quantity": -1,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_required_fields_returns_400(self) -> None:
        self.authenticate(self.seller)

        response = self.client.post(reverse("seller-product-list-create"), {}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_image_upload_saves_to_correct_path(self) -> None:
        self.authenticate(self.seller)
        image = SimpleUploadedFile(
            "product.jpg",
            (
                b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00"
                b"\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00"
                b"\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b"
            ),
            content_type="image/gif",
        )

        response = self.client.post(
            reverse("seller-product-list-create"),
            {
                "title": "Poster",
                "description": "Art print",
                "unit_price": "29.99",
                "quantity": 3,
                "image": image,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_product = Product.objects.get(title="Poster")
        self.assertTrue(created_product.image.name.startswith("products/"))

    def test_buyer_can_retrieve_product_detail(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(
            reverse("product-detail", kwargs={"product_id": self.product.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["id"], str(self.product.id))

    def test_seller_can_update_own_product(self) -> None:
        self.authenticate(self.seller)

        response = self.client.put(
            reverse("product-detail", kwargs={"product_id": self.product.id}),
            {
                "title": "Desk lamp pro",
                "description": "Warm light",
                "unit_price": "34.99",
                "quantity": 7,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.title, "Desk lamp pro")

    def test_buyer_cannot_update_product(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.patch(
            reverse("product-detail", kwargs={"product_id": self.product.id}),
            {"quantity": 10},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_seller_cannot_update_another_sellers_product(self) -> None:
        self.authenticate(self.other_seller)

        response = self.client.put(
            reverse("product-detail", kwargs={"product_id": self.product.id}),
            {
                "title": "Unauthorized edit",
                "description": "Warm light",
                "unit_price": "34.99",
                "quantity": 7,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_works_correctly(self) -> None:
        self.authenticate(self.seller)

        response = self.client.patch(
            reverse("product-detail", kwargs={"product_id": self.product.id}),
            {"quantity": 10},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 10)
        self.assertEqual(self.product.title, "Desk lamp")

    def test_seller_can_delete_own_product(self) -> None:
        self.authenticate(self.seller)

        response = self.client.delete(
            reverse("product-detail", kwargs={"product_id": self.product.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())

    def test_seller_cannot_delete_another_sellers_product(self) -> None:
        self.authenticate(self.other_seller)

        response = self.client.delete(
            reverse("product-detail", kwargs={"product_id": self.product.id})
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_permissions_adds_seller_and_owner_checks_for_mutating_methods(self) -> None:
        factory = APIRequestFactory()
        request = factory.put(
            reverse("product-detail", kwargs={"product_id": self.product.id})
        )
        view = ProductDetailView()
        view.request = request

        permissions = view.get_permissions()

        self.assertTrue(any(isinstance(permission, IsSeller) for permission in permissions))
        self.assertTrue(any(isinstance(permission, IsProductOwner) for permission in permissions))
