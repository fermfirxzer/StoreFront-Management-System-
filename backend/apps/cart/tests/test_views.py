from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.test import APITestCase

from apps.cart.models import Cart
from apps.cart.models import CartItem
from apps.products.models import Product

User = get_user_model()


class CartViewTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.seller = User.objects.create_user(
            email="seller@example.com",
            password="StrongPass123!",
            role="SELLER",
        )
        self.buyer = User.objects.create_user(
            email="buyer@example.com",
            password="StrongPass123!",
            role="BUYER",
        )
        self.other_buyer = User.objects.create_user(
            email="other@example.com",
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
            seller=self.seller,
            title="Office chair",
            description="Mesh back",
            unit_price=Decimal("99.99"),
            quantity=2,
        )

    def authenticate(self, user) -> None:
        self.client.force_authenticate(user=user)

    def test_buyer_can_view_empty_cart(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.get(reverse("cart-detail"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["total_quantity"], 0)
        self.assertEqual(response.data["data"]["items"], [])
        self.assertTrue(Cart.objects.filter(buyer=self.buyer).exists())

    def test_seller_cannot_access_cart_endpoints(self) -> None:
        self.authenticate(self.seller)

        response = self.client.get(reverse("cart-detail"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_buyer_can_add_item_to_cart(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.post(
            reverse("cart-item-list-create"),
            {"product_id": str(self.product.id), "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["total_quantity"], 2)
        self.assertEqual(len(response.data["data"]["items"]), 1)
        self.assertEqual(CartItem.objects.get(cart__buyer=self.buyer).quantity, 2)

    def test_add_item_uses_one_cart_per_buyer(self) -> None:
        self.authenticate(self.buyer)

        self.client.post(
            reverse("cart-item-list-create"),
            {"product_id": str(self.product.id), "quantity": 1},
            format="json",
        )
        self.client.post(
            reverse("cart-item-list-create"),
            {"product_id": str(self.other_product.id), "quantity": 1},
            format="json",
        )

        self.assertEqual(Cart.objects.filter(buyer=self.buyer).count(), 1)

    def test_adding_same_product_merges_quantity(self) -> None:
        self.authenticate(self.buyer)

        self.client.post(
            reverse("cart-item-list-create"),
            {"product_id": str(self.product.id), "quantity": 1},
            format="json",
        )
        response = self.client.post(
            reverse("cart-item-list-create"),
            {"product_id": str(self.product.id), "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["total_quantity"], 3)
        self.assertEqual(CartItem.objects.get(cart__buyer=self.buyer).quantity, 3)

    def test_cannot_add_more_than_available_stock(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.post(
            reverse("cart-item-list-create"),
            {"product_id": str(self.product.id), "quantity": 9},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_buyer_can_update_cart_item_quantity(self) -> None:
        self.authenticate(self.buyer)
        self.client.post(
            reverse("cart-item-list-create"),
            {"product_id": str(self.product.id), "quantity": 1},
            format="json",
        )
        item = CartItem.objects.get(cart__buyer=self.buyer)

        response = self.client.patch(
            reverse("cart-item-detail", kwargs={"item_id": item.id}),
            {"quantity": 4},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 4)
        self.assertEqual(response.data["data"]["total_quantity"], 4)

    def test_buyer_can_remove_cart_item(self) -> None:
        self.authenticate(self.buyer)
        self.client.post(
            reverse("cart-item-list-create"),
            {"product_id": str(self.product.id), "quantity": 1},
            format="json",
        )
        item = CartItem.objects.get(cart__buyer=self.buyer)

        response = self.client.delete(
            reverse("cart-item-detail", kwargs={"item_id": item.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["total_quantity"], 0)
        self.assertFalse(CartItem.objects.filter(id=item.id).exists())

    def test_buyer_cannot_modify_another_buyers_cart_item(self) -> None:
        Cart.objects.create(buyer=self.other_buyer)
        other_item = CartItem.objects.create(
            cart=self.other_buyer.cart,
            product=self.product,
            quantity=1,
        )
        self.authenticate(self.buyer)

        response = self.client.patch(
            reverse("cart-item-detail", kwargs={"item_id": other_item.id}),
            {"quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
