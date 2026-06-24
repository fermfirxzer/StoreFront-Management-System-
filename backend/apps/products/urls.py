from __future__ import annotations

from django.urls import path

from .views import ProductDetailView
from .views import ProductListView
from .views import SellerProductListCreateView

urlpatterns = [
    path("", ProductListView.as_view(), name="product-list"),
    path("seller/", SellerProductListCreateView.as_view(), name="seller-product-list-create"),
    path("<uuid:product_id>/", ProductDetailView.as_view(), name="product-detail"),
]

