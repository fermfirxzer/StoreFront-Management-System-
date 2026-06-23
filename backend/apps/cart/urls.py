from __future__ import annotations

from django.urls import path

from .views import CartDetailView
from .views import CartItemDetailView
from .views import CartItemListCreateView

urlpatterns = [
    path("", CartDetailView.as_view(), name="cart-detail"),
    path("items/", CartItemListCreateView.as_view(), name="cart-item-list-create"),
    path("items/<uuid:item_id>/", CartItemDetailView.as_view(), name="cart-item-detail"),
]

