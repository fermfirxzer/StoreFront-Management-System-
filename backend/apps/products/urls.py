from __future__ import annotations

from django.urls import path

from .views import ProductDetailView
from .views import ProductListCreateView

urlpatterns = [
    path("", ProductListCreateView.as_view(), name="product-list-create"),
    path("<uuid:product_id>/", ProductDetailView.as_view(), name="product-detail"),
]

