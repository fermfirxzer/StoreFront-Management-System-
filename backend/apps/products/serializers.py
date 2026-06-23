from __future__ import annotations

from decimal import Decimal

from rest_framework import serializers

from .models import MAX_UNIT_PRICE
from .models import Product

MAX_PRODUCT_IMAGE_SIZE_BYTES = 2 * 1024 * 1024


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ("title", "description", "unit_price", "quantity", "image")

    def validate_unit_price(self, value: Decimal) -> Decimal:
        if value <= 0:
            raise serializers.ValidationError("Unit price must be greater than 0.")
        if value > MAX_UNIT_PRICE:
            raise serializers.ValidationError("Price must be 10,000,000 THB or less.")
        return value

    def validate_quantity(self, value: int) -> int:
        if value < 0:
            raise serializers.ValidationError("Quantity must be greater than or equal to 0.")
        return value

    def validate_image(self, value):
        if value.size > MAX_PRODUCT_IMAGE_SIZE_BYTES:
            raise serializers.ValidationError("Image must be 2 MB or smaller.")
        return value


class SellerSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)


class ProductReadSerializer(serializers.ModelSerializer):
    seller = SellerSummarySerializer(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "seller",
            "title",
            "description",
            "unit_price",
            "quantity",
            "image",
            "created_at",
            "updated_at",
        )

    def get_image(self, obj: Product) -> str | None:
        if not obj.image:
            return None

        request = self.context.get("request")
        if request is None:
            return obj.image.url
        return request.build_absolute_uri(obj.image.url)

