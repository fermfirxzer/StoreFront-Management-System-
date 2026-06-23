from __future__ import annotations

from django.urls import path

from .views import CheckoutView
from .views import OrderListView
from .views import SellerSalesListView

urlpatterns = [
    path("", OrderListView.as_view(), name="order-list"),
    path("sales/", SellerSalesListView.as_view(), name="seller-sales-list"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
]

