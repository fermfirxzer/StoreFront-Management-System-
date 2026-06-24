from __future__ import annotations

from decimal import Decimal
from decimal import InvalidOperation

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser
from rest_framework.parsers import JSONParser
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsProductOwner
from core.permissions import IsSeller
from core.responses import success_response

from .pagination import ProductPagination
from .serializers import ProductReadSerializer
from .serializers import ProductWriteSerializer
from .services import ProductService


def parse_decimal_param(value: str | None) -> Decimal | None:
    if value in {None, ""}:
        return None
    try:
        return Decimal(value)
    except InvalidOperation as exc:
        raise ValidationError("Price filters must be valid decimal values.") from exc


def parse_bool_param(value: str | None) -> bool | None:
    if value is None or value == "":
        return None

    normalized = value.strip().lower()
    if normalized == "true":
        return True
    if normalized == "false":
        return False
    return None


class SellerProductListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = ProductPagination
    service = ProductService()

    def get(self, request) -> Response:
        products = self.service.get_paginated_seller_products(
            seller=request.user,
            search=request.query_params.get("search"),
            sort_by=request.query_params.get("sort", "updated-desc"),
        )
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(products, request, view=self)
        serializer = ProductReadSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request) -> Response:
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        data.pop("remove_image", None)
        product = self.service.create_product(
            seller=request.user,
            data=data,
            image=request.FILES.get("image"),
        )
        response_serializer = ProductReadSerializer(product, context={"request": request})
        return success_response(response_serializer.data, status_code=status.HTTP_201_CREATED)


class ProductListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = ProductPagination
    service = ProductService()

    def get(self, request) -> Response:
        products = self.service.get_marketplace_products(
            search=request.query_params.get("search"),
            min_price=parse_decimal_param(request.query_params.get("min_price")),
            max_price=parse_decimal_param(request.query_params.get("max_price")),
            in_stock=parse_bool_param(request.query_params.get("in_stock")),
            sort_by=request.query_params.get("sort", "stock-priority"),
        )
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(products, request, view=self)
        serializer = ProductReadSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    service = ProductService()

    def get_object(self, product_id):
        return self.service.get_product_by_id(product_id)

    def get(self, request, product_id) -> Response:
        product = self.get_object(product_id)
        serializer = ProductReadSerializer(product, context={"request": request})
        return success_response(serializer.data)

    def put(self, request, product_id) -> Response:
        product = self.get_object(product_id)
        self.check_object_permissions(request, product)
        serializer = ProductWriteSerializer(data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        remove_image = data.pop("remove_image", False)
        updated_product = self.service.update_product(
            product=product,
            data=data,
            image=request.FILES.get("image"),
            remove_image=remove_image,
        )
        response_serializer = ProductReadSerializer(
            updated_product,
            context={"request": request},
        )
        return success_response(response_serializer.data)

    def patch(self, request, product_id) -> Response:
        product = self.get_object(product_id)
        self.check_object_permissions(request, product)
        serializer = ProductWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        remove_image = data.pop("remove_image", False)
        updated_product = self.service.update_product(
            product=product,
            data=data,
            image=request.FILES.get("image"),
            remove_image=remove_image,
        )
        response_serializer = ProductReadSerializer(
            updated_product,
            context={"request": request},
        )
        return success_response(response_serializer.data)

    def delete(self, request, product_id) -> Response:
        product = self.get_object(product_id)
        self.check_object_permissions(request, product)
        self.service.delete_product(product)
        return success_response({"detail": "Product deleted successfully."})

    def get_permissions(self):
        permissions = super().get_permissions()
        if self.request.method in {"PUT", "PATCH", "DELETE"}:
            permissions.append(IsSeller())
            permissions.append(IsProductOwner())
        return permissions

