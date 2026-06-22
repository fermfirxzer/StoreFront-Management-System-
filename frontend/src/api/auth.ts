import { createBaseClient } from "./baseClient";
import type {
  AuthCredentials,
  AuthSession,
  AuthUser,
  RegisterPayload,
} from "../types/auth";
import type { ApiSuccessResponse } from "../types/api";

interface AuthEnvelope {
  user: AuthUser;
  tokens: {
    access: string;
    refresh: string;
  };
}

interface RefreshEnvelope {
  access: string;
  refresh?: string;
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

export async function refreshRequest(refreshToken: string): Promise<RefreshEnvelope> {
  const response = await authClient.post<ApiSuccessResponse<RefreshEnvelope>>(
    "/auth/refresh/",
    { refresh: refreshToken }
  );
  return response.data.data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await authClient.post("/auth/logout/", { refresh: refreshToken });
}

export async function fetchMe(): Promise<AuthUser> {
  const response = await authClient.get<ApiSuccessResponse<AuthUser>>("/auth/me/");
  return response.data.data;
}
const authClient = createBaseClient();
