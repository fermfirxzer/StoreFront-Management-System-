"""Custom exception handling for DRF."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from rest_framework.exceptions import APIException, ValidationError
from rest_framework.views import exception_handler

from .responses import error_response


def custom_exception_handler(exc: Exception, context: dict[str, Any]) -> Any:
    response = exception_handler(exc, context)
    if response is None:
        if isinstance(exc, APIException):
            return error_response(str(exc.detail), status_code=exc.status_code)
        return None

    message = "Request failed."
    errors: Any = response.data
    if isinstance(exc, ValidationError):
        message = "Validation failed."
    elif isinstance(response.data, Mapping) and "detail" in response.data:
        message = str(response.data["detail"])

    return error_response(message=message, errors=errors, status_code=response.status_code)

