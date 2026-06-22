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

    const { refreshToken, clearSession, updateTokens } = useAuthStore.getState();
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextTokens = await refreshRequest(refreshToken);
      updateTokens({
        accessToken: nextTokens.access,
        refreshToken: nextTokens.refresh,
      });

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${nextTokens.access}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  }
);

export { apiClient };
