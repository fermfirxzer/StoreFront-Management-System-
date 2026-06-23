from __future__ import annotations

from uuid import UUID

from django.core.exceptions import PermissionDenied
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound

from apps.accounts.models import User

from .models import Product


class ProductService:
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

    def get_product_by_id(self, product_id: UUID) -> Product:
        try:
            return Product.objects.select_related("seller").get(id=product_id)
        except Product.DoesNotExist as exc:
            raise NotFound("Product not found.") from exc

    def ensure_owner(self, *, user: User, product: Product) -> None:
        if product.seller_id != user.id:
            raise PermissionDenied("You do not have permission to modify this product.")

