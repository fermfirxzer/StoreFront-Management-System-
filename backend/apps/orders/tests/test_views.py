from __future__ import annotations

from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.test import APITestCase

from apps.cart.models import Cart
from apps.cart.models import CartItem
from apps.orders.models import Order
from apps.orders.models import OrderItem
from apps.orders.services import OrderService
from apps.products.models import Product

User = get_user_model()


class OrderViewTests(APITestCase):
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
            quantity=3,
        )
        self.cart = Cart.objects.create(buyer=self.buyer)
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

    def authenticate(self, user) -> None:
        self.client.force_authenticate(user=user)

    def test_buyer_can_checkout_cart(self) -> None:
        self.authenticate(self.buyer)

        response = self.client.post(reverse("checkout"))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.filter(buyer=self.buyer).count(), 1)
        self.assertEqual(OrderItem.objects.filter(order__buyer=self.buyer).count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 3)
        self.assertFalse(CartItem.objects.filter(id=self.cart_item.id).exists())
        self.assertEqual(response.data["data"]["subtotal"], "49.98")

    def test_checkout_creates_multiple_order_items(self) -> None:
        CartItem.objects.create(
            cart=self.cart,
            product=self.other_product,
            quantity=1,
        )
        self.authenticate(self.buyer)

        response = self.client.post(reverse("checkout"))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["data"]["items"]), 2)

    def test_checkout_rejects_empty_cart(self) -> None:
        self.cart_item.delete()
        self.authenticate(self.buyer)

        response = self.client.post(reverse("checkout"))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_rejects_insufficient_inventory(self) -> None:
        self.cart_item.quantity = 6
        self.cart_item.save(update_fields=["quantity"])
        self.authenticate(self.buyer)

        response = self.client.post(reverse("checkout"))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 5)

    def test_checkout_rolls_back_on_failure(self) -> None:
        self.authenticate(self.buyer)

        with patch(
            "apps.orders.services.OrderItem.objects.bulk_create",
            side_effect=RuntimeError("bulk create failure"),
        ):
            with self.assertRaises(RuntimeError):
                OrderService().checkout(buyer=self.buyer)

        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(OrderItem.objects.count(), 0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 5)
        self.assertTrue(CartItem.objects.filter(id=self.cart_item.id).exists())

    def test_order_list_returns_buyer_orders(self) -> None:
        Order.objects.create(buyer=self.buyer, subtotal=Decimal("49.98"))
        self.authenticate(self.buyer)

        response = self.client.get(reverse("order-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)

    def test_seller_cannot_checkout(self) -> None:
        self.authenticate(self.seller)

        response = self.client.post(reverse("checkout"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
