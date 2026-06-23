from __future__ import annotations

from django.urls import path

from .views import CheckoutView
from .views import OrderListView

urlpatterns = [
    path("", OrderListView.as_view(), name="order-list"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
]

