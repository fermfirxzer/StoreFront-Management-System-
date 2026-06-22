import axios from "axios";

import type { ApiErrorResponse } from "../types/api";

function extractMessage(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = extractMessage(item);
      if (message) {
        return message;
      }
    }
    return null;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      const message = extractMessage(item);
      if (message) {
        return message;
      }
    }
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const response = error.response?.data;
  if (!response) {
    return fallback;
  }

  const errorsMessage = extractMessage(response.errors);
  if (errorsMessage) {
    return errorsMessage;
  }

  if (response.message && response.message !== "Validation failed.") {
    return response.message;
  }

  return response.message || fallback;
}
