import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { ACCESS_TOKEN_KEY } from "@/lib/constants";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is required");
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

let refreshingPromise: Promise<string | null> | null = null;

const getToken = async () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
export const setToken = async (token: string) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
export const clearToken = async () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  config.headers["X-Worknest-Csrf"] = "1";
  return config;
});

const refreshAccessToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, null, {
      withCredentials: true,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-Worknest-Csrf": "1",
      },
    });
    const token = response.data?.data?.accessToken ?? response.data?.accessToken;
    if (token) {
      await setToken(token);
      return token;
    }
    return null;
  } catch {
    await clearToken();
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshingPromise = refreshingPromise ?? refreshAccessToken();
      const newToken = await refreshingPromise;
      refreshingPromise = null;
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
