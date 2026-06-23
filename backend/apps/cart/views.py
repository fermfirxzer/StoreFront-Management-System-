from __future__ import annotations

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsBuyer
from core.responses import success_response

from .serializers import AddCartItemSerializer
from .serializers import CartSerializer
from .serializers import UpdateCartItemSerializer
from .services import CartService


class CartDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    service = CartService()

    def get(self, request) -> Response:
        cart = self.service.get_cart_for_buyer(request.user)
        serializer = CartSerializer(cart, context={"request": request})
        return success_response(serializer.data)


class CartItemListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    service = CartService()

    def post(self, request) -> Response:
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = self.service.add_item(
            buyer=request.user,
            product_id=serializer.validated_data["product_id"],
            quantity=serializer.validated_data["quantity"],
        )
        response_serializer = CartSerializer(cart, context={"request": request})
        return success_response(response_serializer.data, status_code=201)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    service = CartService()

    def patch(self, request, item_id) -> Response:
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = self.service.update_item_quantity(
            buyer=request.user,
            item_id=item_id,
            quantity=serializer.validated_data["quantity"],
        )
        response_serializer = CartSerializer(cart, context={"request": request})
        return success_response(response_serializer.data)

    def delete(self, request, item_id) -> Response:
        cart = self.service.remove_item(buyer=request.user, item_id=item_id)
        response_serializer = CartSerializer(cart, context={"request": request})
        return success_response(response_serializer.data)

