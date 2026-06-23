from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.db.models import Prefetch
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from apps.cart.models import Cart
from apps.cart.models import CartItem
from apps.products.models import Product

from .models import Order
from .models import OrderItem


class OrderService:
    def get_orders_for_buyer(self, buyer: User):
        return (
            Order.objects.filter(buyer=buyer)
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related("product").order_by("created_at"),
                )
            )
            .order_by("-created_at")
        )

    def get_sales_for_seller(self, seller: User):
        return (
            OrderItem.objects.filter(product__seller=seller)
            .select_related("product", "order__buyer")
            .order_by("-order__created_at", "-created_at")
        )

    def checkout(self, *, buyer: User) -> Order:
        with transaction.atomic():
            cart = (
                Cart.objects.select_for_update()
                .filter(buyer=buyer)
                .prefetch_related(
                    Prefetch(
                        "items",
                        queryset=CartItem.objects.select_related("product").order_by("created_at"),
                    )
                )
                .first()
            )

            if cart is None or not cart.items.exists():
                raise ValidationError("Your cart is empty.")

            cart_items = list(cart.items.all())
            product_ids = [item.product_id for item in cart_items]
            locked_products = {
                product.id: product
                for product in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            subtotal = Decimal("0.00")
            order = Order.objects.create(buyer=buyer, subtotal=Decimal("0.00"))
            order_items: list[OrderItem] = []

            for cart_item in cart_items:
                locked_product = locked_products[cart_item.product_id]
                if cart_item.quantity > locked_product.quantity:
                    raise ValidationError(
                        f"Insufficient stock for {locked_product.title}."
                    )

                line_total = locked_product.unit_price * cart_item.quantity
                subtotal += line_total
                order_items.append(
                    OrderItem(
                        order=order,
                        product=locked_product,
                        product_title=locked_product.title,
                        unit_price=locked_product.unit_price,
                        quantity=cart_item.quantity,
                        line_total=line_total,
                    )
                )

            OrderItem.objects.bulk_create(order_items)

            for cart_item in cart_items:
                locked_product = locked_products[cart_item.product_id]
                locked_product.quantity -= cart_item.quantity
                locked_product.full_clean()
                locked_product.save(update_fields=["quantity", "updated_at"])

            order.subtotal = subtotal
            order.save(update_fields=["subtotal", "updated_at"])
            cart.items.all().delete()

            return self.get_order_by_id(order.id, buyer=buyer)

    def get_order_by_id(self, order_id, *, buyer: User) -> Order:
        return (
            Order.objects.filter(id=order_id, buyer=buyer)
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related("product").order_by("created_at"),
                )
            )
            .get()
        )

