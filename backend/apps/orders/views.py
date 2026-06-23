from __future__ import annotations

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsBuyer
from core.responses import success_response

from .serializers import OrderSerializer
from .services import OrderService


class OrderListView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    service = OrderService()

    def get(self, request) -> Response:
        orders = self.service.get_orders_for_buyer(request.user)
        serializer = OrderSerializer(orders, many=True)
        return success_response(serializer.data)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    service = OrderService()

    def post(self, request) -> Response:
        order = self.service.checkout(buyer=request.user)
        serializer = OrderSerializer(order)
        return success_response(serializer.data, status_code=201)

