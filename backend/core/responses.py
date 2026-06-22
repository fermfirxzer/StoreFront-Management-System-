"""Standard API response helpers."""

from __future__ import annotations

from typing import Any

from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK


def success_response(data: Any, status_code: int = HTTP_200_OK) -> Response:
    return Response({"status": "success", "data": data}, status=status_code)


def error_response(
    message: str,
    errors: Any | None = None,
    status_code: int = 400,
) -> Response:
    payload: dict[str, Any] = {
        "status": "error",
        "message": message,
    }
    if errors is not None:
        payload["errors"] = errors
    return Response(payload, status=status_code)

