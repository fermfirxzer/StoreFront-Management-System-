from __future__ import annotations

from django.urls import path

from .views import LoginAPIView, LogoutAPIView, MeAPIView, RefreshAPIView, RegisterAPIView

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("refresh/", RefreshAPIView.as_view(), name="refresh"),
    path("me/", MeAPIView.as_view(), name="me"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
]

