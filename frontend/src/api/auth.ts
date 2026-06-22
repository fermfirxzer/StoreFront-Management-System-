import { createBaseClient } from "./baseClient";
import type {
  AuthCredentials,
  AuthSession,
  AuthUser,
  RegisterPayload,
} from "../types/auth";
import type { ApiSuccessResponse } from "../types/api";

const authClient = createBaseClient();
let refreshRequestPromise: Promise<RefreshEnvelope> | null = null;

interface AuthEnvelope {
  user: AuthUser;
  tokens: {
    access: string;
  };
}

interface RefreshEnvelope {
  access: string;
  user: AuthUser;
}

export async function registerRequest(
  payload: RegisterPayload
): Promise<AuthSession> {
  const response = await authClient.post<ApiSuccessResponse<AuthEnvelope>>(
    "/auth/register/",
    {
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
      role: payload.role,
    }
  );
  return response.data.data;
}

export async function loginRequest(
  payload: AuthCredentials
): Promise<AuthSession> {
  const response = await authClient.post<ApiSuccessResponse<AuthEnvelope>>(
    "/auth/login/",
    payload
  );
  return response.data.data;
}

export async function refreshRequest(): Promise<RefreshEnvelope> {
  if (refreshRequestPromise) {
    return refreshRequestPromise;
  }

  refreshRequestPromise = authClient
    .post<ApiSuccessResponse<RefreshEnvelope>>("/auth/refresh/")
    .then((response) => response.data.data)
    .finally(() => {
      refreshRequestPromise = null;
    });

  return refreshRequestPromise;
}

export async function logoutRequest(): Promise<void> {
  await authClient.post("/auth/logout/");
}

export async function fetchMe(): Promise<AuthUser> {
  const response = await authClient.get<ApiSuccessResponse<AuthUser>>("/auth/me/");
  return response.data.data;
}
