from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from django.core.exceptions import PermissionDenied
from django.db.models import Case
from django.db.models import IntegerField
from django.db.models import QuerySet
from django.db.models import Value
from django.db.models import When
from rest_framework.exceptions import NotFound

from apps.accounts.models import User

from .models import Product


class ProductService:
    def get_marketplace_products(
        self,
        *,
        search: str | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
        in_stock: bool | None = None,
        sort_by: str = "stock-priority",
    ) -> QuerySet[Product]:
        queryset = Product.objects.select_related("seller").all()

        if search:
            queryset = queryset.filter(title__icontains=search)
        if min_price is not None:
            queryset = queryset.filter(unit_price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(unit_price__lte=max_price)
        if in_stock is True:
            queryset = queryset.filter(quantity__gt=0)
        if in_stock is False:
            queryset = queryset.filter(quantity=0)

        sort_mappings = {
            "updated-desc": ["-updated_at"],
            "price-desc": ["-unit_price", "-updated_at"],
            "price-asc": ["unit_price", "-updated_at"],
            "quantity-desc": ["-quantity", "-updated_at"],
            "quantity-asc": ["quantity", "-updated_at"],
        }

        if sort_by in sort_mappings:
            return queryset.order_by(*sort_mappings[sort_by])

        return queryset.annotate(
            stock_priority=Case(
                When(quantity__gt=0, then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            )
        ).order_by("stock_priority", "-created_at")

    def create_product(
        self,
        seller: User,
        data: dict,
        image=None,
    ) -> Product:
        product = Product(seller=seller, **data)
        if image is not None:
            product.image = image
        product.full_clean()
        product.save()
        return product

    def update_product(
        self,
        product: Product,
        data: dict,
        image=None,
    ) -> Product:
        previous_image_name = product.image.name if product.image else None

        for field, value in data.items():
            setattr(product, field, value)
        if image is not None:
            product.image = image
        product.full_clean()
        product.save()

        if image is not None and previous_image_name and previous_image_name != product.image.name:
            product.image.storage.delete(previous_image_name)

        return product

    def delete_product(self, product: Product) -> None:
        product.delete()

    def get_seller_products(self, seller: User) -> QuerySet[Product]:
        return Product.objects.select_related("seller").filter(seller=seller)

    def get_paginated_seller_products(
        self,
        *,
        seller: User,
        search: str | None = None,
        sort_by: str = "updated-desc",
    ) -> QuerySet[Product]:
        queryset = self.get_seller_products(seller)

        if search:
            queryset = queryset.filter(title__icontains=search)

        sort_mappings = {
            "updated-desc": ["-updated_at"],
            "price-desc": ["-unit_price", "-updated_at"],
            "price-asc": ["unit_price", "-updated_at"],
            "quantity-desc": ["-quantity", "-updated_at"],
            "quantity-asc": ["quantity", "-updated_at"],
        }

        return queryset.order_by(*sort_mappings.get(sort_by, ["-updated_at"]))

    def get_product_by_id(self, product_id: UUID) -> Product:
        try:
            return Product.objects.select_related("seller").get(id=product_id)
        except Product.DoesNotExist as exc:
            raise NotFound("Product not found.") from exc

    def ensure_owner(self, *, user: User, product: Product) -> None:
        if product.seller_id != user.id:
            raise PermissionDenied("You do not have permission to modify this product.")

