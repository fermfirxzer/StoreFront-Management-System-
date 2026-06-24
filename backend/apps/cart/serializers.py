from __future__ import annotations

from decimal import Decimal

from rest_framework import serializers

from apps.products.models import Product

from .models import Cart
from .models import CartItem


class CartProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ("id", "title", "unit_price", "image", "quantity")

    def get_image(self, obj: Product) -> str | None:
        if not obj.image:
            return None

        request = self.context.get("request")
        if request is None:
            return obj.image.url
        return request.build_absolute_uri(obj.image.url)


class CartItemSerializer(serializers.ModelSerializer):
    product = CartProductSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ("id", "product", "quantity", "line_total")

    def get_line_total(self, obj: CartItem) -> Decimal:
        return obj.product.unit_price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_quantity = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "items", "total_quantity", "subtotal", "updated_at")

    def get_total_quantity(self, obj: Cart) -> int:
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj: Cart) -> Decimal:
        return sum(
            (item.product.unit_price * item.quantity for item in obj.items.all()),
            Decimal("0.00"),
        )


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)

