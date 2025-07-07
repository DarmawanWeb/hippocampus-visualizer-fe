import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setAuthData,
} from '@/lib/cookie';
import { apiUrl } from '@/lib/env';
import type { ApiError, ApiResponse } from '@/types/api';
import type { RefreshTokenResponse } from '@/types/auth';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

let refreshPromise: Promise<RefreshTokenResponse> | null = null;

axiosInstance.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshPromise) {
        const rt = getRefreshToken();
        if (!rt) gotoSignOut();
        refreshPromise = axios
          .post<ApiResponse<RefreshTokenResponse>>(`${apiUrl}/auth/refresh`, {
            refreshToken: rt,
          })
          .then((res) => res.data.data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const { accessToken, refreshToken } = await refreshPromise;
        refreshToken
          ? setAuthData(accessToken, refreshToken)
          : setAccessToken(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(original);
      } catch (e) {
        gotoSignOut();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);

function gotoSignOut() {
  clearAuthData();
  if (typeof window !== 'undefined') window.location.href = '/auth';
}

export const api = {
  get: <T = unknown>(u: string, c?: AxiosRequestConfig) =>
    axiosInstance.get<T>(u, c),
  post: <T = unknown, D = unknown>(u: string, d?: D, c?: AxiosRequestConfig) =>
    axiosInstance.post<T>(u, d, c),
  put: <T = unknown, D = unknown>(u: string, d?: D, c?: AxiosRequestConfig) =>
    axiosInstance.put<T>(u, d, c),
  patch: <T = unknown, D = unknown>(u: string, d?: D, c?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(u, d, c),
  delete: <T = unknown>(u: string, c?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(u, c),
};

export const handleApiError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const apiErr = err.response?.data as ApiError;
    return apiErr?.message ?? err.message;
  }
  return err instanceof Error ? err.message : 'Unexpected error';
};

export default axiosInstance;
