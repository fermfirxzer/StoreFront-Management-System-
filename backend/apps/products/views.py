from __future__ import annotations

from rest_framework import status
from rest_framework.parsers import FormParser
from rest_framework.parsers import JSONParser
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsProductOwner
from core.permissions import IsSeller
from core.responses import success_response

from .serializers import ProductReadSerializer
from .serializers import ProductWriteSerializer
from .services import ProductService


class ProductListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    service = ProductService()

    def get(self, request) -> Response:
        products = self.service.get_seller_products(request.user)
        serializer = ProductReadSerializer(products, many=True, context={"request": request})
        return success_response(serializer.data)

    def post(self, request) -> Response:
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = self.service.create_product(
            seller=request.user,
            data=serializer.validated_data,
            image=request.FILES.get("image"),
        )
        response_serializer = ProductReadSerializer(product, context={"request": request})
        return success_response(response_serializer.data, status_code=status.HTTP_201_CREATED)


class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]
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
        updated_product = self.service.update_product(
            product=product,
            data=serializer.validated_data,
            image=request.FILES.get("image"),
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
        updated_product = self.service.update_product(
            product=product,
            data=serializer.validated_data,
            image=request.FILES.get("image"),
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
            permissions.append(IsProductOwner())
        return permissions

