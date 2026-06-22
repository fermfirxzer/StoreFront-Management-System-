from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer as SimpleJWTTokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from core.auth_cookies import clear_refresh_token_cookie
from core.auth_cookies import set_refresh_token_cookie
from core.responses import error_response
from core.responses import success_response
from django.conf import settings

from .models import User
from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    RefreshTokenSerializer,
    RegisterSerializer,
    UserSerializer,
)


def build_token_pair(user: User) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def build_auth_payload(user: User) -> dict[str, object]:
    tokens = build_token_pair(user)
    return {
        "user": UserSerializer(user).data,
        "tokens": {"access": tokens["access"]},
        "refresh_token": tokens["refresh"],
    }


def attach_refresh_cookie(response: Response, refresh_token: str) -> Response:
    set_refresh_token_cookie(response, refresh_token)
    return response


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        payload = build_auth_payload(user)
        response = success_response(
            {
                "user": payload["user"],
                "tokens": payload["tokens"],
            },
            status_code=status.HTTP_201_CREATED,
        )
        return attach_refresh_cookie(response, payload["refresh_token"])


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        payload = build_auth_payload(user)
        response = success_response(
            {
                "user": payload["user"],
                "tokens": payload["tokens"],
            }
        )
        return attach_refresh_cookie(response, payload["refresh_token"])


class RefreshAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data.get("refresh") or request.COOKIES.get(
            settings.REFRESH_TOKEN_COOKIE_NAME
        )
        if not refresh_token:
            return error_response(
                "Refresh session is missing.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh_claims = RefreshToken(refresh_token)
        except TokenError as exc:
            return error_response(str(exc), status_code=status.HTTP_401_UNAUTHORIZED)

        token_serializer = SimpleJWTTokenRefreshSerializer(data={"refresh": refresh_token})
        try:
            token_serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            return error_response(str(exc), status_code=status.HTTP_401_UNAUTHORIZED)

        access_token = token_serializer.validated_data["access"]
        refresh_token_value = token_serializer.validated_data.get("refresh", refresh_token)
        user_id = refresh_claims.payload.get("user_id")
        user = User.objects.get(id=user_id)
        response = success_response(
            {
                "user": UserSerializer(user).data,
                "tokens": {"access": access_token},
            }
        )
        return attach_refresh_cookie(response, refresh_token_value)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request) -> Response:
        return success_response(UserSerializer(request.user).data)


class LogoutAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data.get("refresh") or request.COOKIES.get(
            settings.REFRESH_TOKEN_COOKIE_NAME
        )
        try:
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass
        response = success_response({"detail": "Logged out successfully."})
        clear_refresh_token_cookie(response)
        return response

