from __future__ import annotations

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsBuyer
from core.permissions import IsSeller
from core.responses import success_response

from .serializers import OrderSerializer
from .serializers import SellerSaleSerializer
from .services import OrderService


class OrderListView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    service = OrderService()

    def get(self, request) -> Response:
        orders = self.service.get_orders_for_buyer(request.user)
        serializer = OrderSerializer(orders, many=True)
        return success_response(serializer.data)


class SellerSalesListView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]
    service = OrderService()

    def get(self, request) -> Response:
        sales = self.service.get_sales_for_seller(request.user)
        serializer = SellerSaleSerializer(sales, many=True)
        return success_response(serializer.data)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    service = OrderService()

    def post(self, request) -> Response:
        order = self.service.checkout(buyer=request.user)
        serializer = OrderSerializer(order)
        return success_response(serializer.data, status_code=201)

