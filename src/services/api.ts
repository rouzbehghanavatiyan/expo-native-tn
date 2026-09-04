import axios from "axios";
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

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const chatApi = axios.create({
  baseURL: chatBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let navigationRef: any = null;
export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

const applyRequestInterceptor = (instance: typeof api, name: string) => {
  instance.interceptors.request.use(
    async (config) => {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(
        `[REQUEST OUT] ${name} -> ${config.url} | Token attached: ${!!token}`,
      );
      return config;
    },
    (error) => Promise.reject(error),
  );
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const applyResponseInterceptor = (instance: typeof api, name: string) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest.url?.includes("/login")
      ) {
        console.log(`[401 DETECTED] in ${name} on URL: ${originalRequest.url}`);

        if (!originalRequest._retry) {
          if (isRefreshing) {
            console.log(
              `[QUEUEING] Request queued waiting for new token: ${originalRequest.url}`,
            );
            return new Promise(function (resolve, reject) {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = "Bearer " + token;
                return instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const accessToken = await getAccessToken();
          const refreshToken = await getRefreshToken();

          if (!accessToken || !refreshToken) {
            console.log(`[REFRESH ABORTED] Missing tokens in storage.`);
            isRefreshing = false;
            await removeTokens();
            router.replace("/login");
            return Promise.reject(error);
          }

          try {
            console.log(
              `[TRYING REFRESH] Sending refresh request to backend...`,
            );
            logger.info("refreshToken", refreshToken);
            logger.info("accessToken", accessToken);
            const response = await axios.post(`${baseURL}/refreshToken`, {
              accessToken: accessToken,
              refreshToken: refreshToken,
            });

            const newAccessToken = response.data.token;
            const newRefreshToken = response.data.refreshToken;

            console.log(`[REFRESH SUCCESS] New token generated.`);
            await saveTokens(newAccessToken, newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            isRefreshing = false;

            return instance(originalRequest);
          } catch (refreshError: any) {
            console.log(
              `[REFRESH FAILED] Status: ${refreshError.response?.status} - Data: ${JSON.stringify(refreshError.response?.data)}`,
            );
            processQueue(refreshError, null);
            isRefreshing = false;
            await removeTokens();
            router.replace("/login");
            return Promise.reject(refreshError);
          }
        }
      }

      if (error.response?.status !== 401) {
        console.log(
          `[API ERROR] Status: ${error.response?.status} on URL: ${originalRequest?.url}`,
        );
      }

      return Promise.reject(error);
    },
  );
};

applyRequestInterceptor(api, "MainAPI");
applyRequestInterceptor(chatApi, "ChatAPI");

applyResponseInterceptor(api, "MainAPI");
applyResponseInterceptor(chatApi, "ChatAPI");
