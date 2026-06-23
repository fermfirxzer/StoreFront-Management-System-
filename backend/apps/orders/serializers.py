from __future__ import annotations

from rest_framework import serializers

from .models import Order
from .models import OrderItem


class OrderBuyerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_title",
            "unit_price",
            "quantity",
            "line_total",
            "created_at",
        )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ("id", "subtotal", "total_quantity", "items", "created_at", "updated_at")

    def get_total_quantity(self, obj: Order) -> int:
        return sum(item.quantity for item in obj.items.all())


class SellerSaleSerializer(serializers.ModelSerializer):
    order_id = serializers.UUIDField(source="order.id", read_only=True)
    product_id = serializers.UUIDField(source="product.id", read_only=True)
    buyer = OrderBuyerSerializer(source="order.buyer", read_only=True)
    sold_at = serializers.DateTimeField(source="order.created_at", read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "order_id",
            "product_id",
            "product_title",
            "unit_price",
            "quantity",
            "line_total",
            "sold_at",
            "buyer",
        )

