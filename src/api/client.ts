import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, AppError } from './types';

// Access token stored only in memory — never in localStorage
let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function setRefreshToken(token: string) {
  localStorage.setItem('refreshToken', token);
}

export function clearRefreshToken() {
  localStorage.removeItem('refreshToken');
}

export function clearAuth() {
  clearAccessToken();
  clearRefreshToken();
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const client = axios.create({
  baseURL: apiBaseUrl ?? '',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Refresh token queue management
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// Response interceptor: unwrap envelope + handle 401 refresh
client.interceptors.response.use(
  (response) => {
    // Unwrap { statusCode, title, data } envelope if present
    const body = response.data as ApiResponse<unknown> | unknown;
    if (
      body !== null &&
      typeof body === 'object' &&
      'data' in (body as object) &&
      'statusCode' in (body as object)
    ) {
      response.data = (body as ApiResponse<unknown>).data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const storedRefreshToken = getRefreshToken();

      if (!storedRefreshToken) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve) => {
          refreshQueue.push(resolve);
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Import here to avoid circular dependency
        const { authApi } = await import('./endpoints/auth');
        const data = await authApi.refresh(storedRefreshToken);
        setAccessToken(data.token);
        setRefreshToken(data.refreshToken);
        processQueue(data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return client(originalRequest);
      } catch {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(normalizeError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(error: AxiosError): AppError {
  const data = error.response?.data as Partial<AppError> | undefined;
  return {
    type: data?.type,
    title: data?.title ?? error.message,
    status: error.response?.status ?? 0,
    detail: data?.detail,
    instance: data?.instance,
    errors: data?.errors,
  };
}
