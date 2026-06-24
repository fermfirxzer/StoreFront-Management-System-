from __future__ import annotations

from uuid import UUID

from django.db.models import Prefetch
from rest_framework.exceptions import NotFound
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from apps.products.models import Product

from .models import Cart
from .models import CartItem


class CartService:
    def get_or_create_cart(self, buyer: User) -> Cart:
        cart, _ = Cart.objects.get_or_create(buyer=buyer)
        return cart

    def get_cart_for_buyer(self, buyer: User) -> Cart:
        cart = self.get_or_create_cart(buyer)
        return (
            Cart.objects.select_related("buyer")
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=CartItem.objects.select_related("product").order_by("created_at"),
                )
            )
            .get(id=cart.id)
        )

    def add_item(
        self,
        *,
        buyer: User,
        product_id: UUID,
        quantity: int,
    ) -> Cart:
        cart = self.get_or_create_cart(buyer)
        product = self._get_product(product_id)

        if product.quantity <= 0:
            raise ValidationError("This product is out of stock.")

        try:
            cart_item = CartItem.objects.get(cart=cart, product=product)
            next_quantity = cart_item.quantity + quantity
            self._validate_requested_quantity(product=product, quantity=next_quantity)
            cart_item.quantity = next_quantity
            cart_item.full_clean()
            cart_item.save(update_fields=["quantity", "updated_at"])
        except CartItem.DoesNotExist:
            self._validate_requested_quantity(product=product, quantity=quantity)
            cart_item = CartItem(cart=cart, product=product, quantity=quantity)
            cart_item.full_clean()
            cart_item.save()

        return self.get_cart_for_buyer(buyer)

    def update_item_quantity(
        self,
        *,
        buyer: User,
        item_id: UUID,
        quantity: int,
    ) -> Cart:
        cart_item = self._get_cart_item_for_buyer(buyer=buyer, item_id=item_id)
        self._validate_requested_quantity(product=cart_item.product, quantity=quantity)
        cart_item.quantity = quantity
        cart_item.full_clean()
        cart_item.save(update_fields=["quantity", "updated_at"])
        return self.get_cart_for_buyer(buyer)

    def remove_item(self, *, buyer: User, item_id: UUID) -> Cart:
        cart_item = self._get_cart_item_for_buyer(buyer=buyer, item_id=item_id)
        cart_item.delete()
        return self.get_cart_for_buyer(buyer)

    def _get_product(self, product_id: UUID) -> Product:
        try:
            return Product.objects.get(id=product_id)
        except Product.DoesNotExist as exc:
            raise NotFound("Product not found.") from exc

    def _get_cart_item_for_buyer(self, *, buyer: User, item_id: UUID) -> CartItem:
        try:
            return CartItem.objects.select_related("product", "cart").get(
                id=item_id,
                cart__buyer=buyer,
            )
        except CartItem.DoesNotExist as exc:
            raise NotFound("Cart item not found.") from exc

    def _validate_requested_quantity(self, *, product: Product, quantity: int) -> None:
        if quantity > product.quantity:
            raise ValidationError("Requested quantity exceeds available stock.")

