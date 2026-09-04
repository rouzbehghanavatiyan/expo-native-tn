import axios, { type AxiosInstance } from "axios";
import { router } from "expo-router";
import { logger } from "../utils/logger";
import {
  getAccessToken,
  getRefreshToken,
  removeTokens,
  saveTokens,
} from "./tokenServices";

const baseURL = process.env.EXPO_PUBLIC_VITE_URL;
const chatBaseURL = process.env.EXPO_PUBLIC_SOCKET;

// 1. Create Axios instances
export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export const chatApi = axios.create({
  baseURL: chatBaseURL,
  headers: { "Content-Type": "application/json" },
});

// 2. Define state for token refresh process
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 3. Define a single, reusable interceptor logic
const setupInterceptors = (instance: AxiosInstance, name: string) => {
  // === REQUEST INTERCEPTOR ===
  // Attaches the token to every outgoing request
  instance.interceptors.request.use(
    async (config) => {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      logger.debug(
        `[REQUEST] ${name} to ${config.url} | Token Attached: ${!!token}`,
      );
      return config;
    },
    (error) => Promise.reject(error),
  );

  // === RESPONSE INTERCEPTOR ===
  // Handles 401 errors and token refresh logic
  instance.interceptors.response.use(
    (response) => response, // Directly return successful responses
    async (error) => {
      const originalRequest = error.config;

      // Don't refresh on login failure & avoid retry loops
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest); // Retry with the new token
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        logger.warn("No refresh token found. Redirecting to login.");
        await removeTokens();
        router.replace("/login");
        isRefreshing = false;
        processQueue(error, null);
        return Promise.reject(error);
      }

      try {
        const accessToken = await getAccessToken();
        const response = await axios.post(`${baseURL}/refreshToken`, {
          accessToken: accessToken, // Send current (expired) access token
          refreshToken: refreshToken,
        });

        const responseData = response.data?.data;
        const newAccessToken = responseData?.token;
        const newRefreshToken = responseData?.refreshToken;

        if (!newAccessToken || !newRefreshToken) {
          throw new Error("Invalid new tokens received from server.");
        }

        await saveTokens(newAccessToken, newRefreshToken);
        logger.info("✅ Tokens successfully refreshed.");

        // Update the header for the current retried request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process the queue of failed requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        return instance(originalRequest);
      } catch (refreshError) {
        logger.error("❌ Token refresh failed. Logging out.", refreshError);
        await removeTokens();
        processQueue(refreshError, null);
        router.replace("/login"); // Redirect to login on refresh failure
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

// --- MAIN FIX ---
// 4. Apply the interceptors to BOTH axios instances
setupInterceptors(api, "API");
setupInterceptors(chatApi, "ChatAPI");
