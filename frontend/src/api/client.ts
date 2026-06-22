import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { createBaseClient } from "./baseClient";
import { refreshRequest } from "./auth";
import { useAuthStore } from "../stores/authStore";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const apiClient = createBaseClient();

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
  } else if (config.headers && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const { clearSession, updateTokens, setUser } = useAuthStore.getState();
    originalRequest._retry = true;

    try {
      const nextSession = await refreshRequest();
      updateTokens({ accessToken: nextSession.tokens.access });
      setUser(nextSession.user);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${nextSession.tokens.access}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  }
);

export { apiClient };
