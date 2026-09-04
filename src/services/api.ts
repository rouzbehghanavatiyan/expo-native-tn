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

const applyResponseInterceptor = (instance: typeof api) => {
  api.interceptors.request.use(
    async (config) => {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // ۱. اگر خطا ۴۰۱ بود اما مربوط به خود لاگین بود، اصلا رفرش نکن و فقط خطا بده
      if (
        error.response?.status === 401 &&
        originalRequest.url?.includes("/login")
      ) {
        return Promise.reject(error);
      }

      // ۲. اگر ۴۰۱ بود و مربوط به لاگین نبود و قبلا سعی نکرده بودیم رفرش کنیم:
      if (error.response?.status === 401 && !originalRequest._retry) {
        // اگر الان یک ریکوئست دیگر در حال رفرش کردن توکن است، این یکی را بفرست تو صف انتظار
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // اگر در حال رفرش نیستیم، پرچم‌ها را روشن کن تا بقیه بروند تو صف
        originalRequest._retry = true;
        isRefreshing = true;

        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();
        logger.info("refreshToken ", refreshToken);

        if (!accessToken || !refreshToken) {
          isRefreshing = false;
          await removeTokens();
          try {
            router.replace("/login");
          } catch (e) {
            console.log(e);
          }
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(`${baseURL}/refreshToken`, {
            accessToken: accessToken,
            refreshToken: refreshToken,
          });

          console.log("=== SERVER REFRESH RESPONSE ===");
          console.log(JSON.stringify(response.data, null, 2));
          console.log("===============================");

          // FIX: Access the nested 'data' object
          const responseData = response.data?.data;

          const newAccessToken = responseData?.token;
          const newRefreshToken = responseData?.refreshToken;

          if (!newAccessToken || !newRefreshToken) {
            console.error("❌ Invalid tokens received from refresh endpoint!");
            processQueue(new Error("Invalid tokens"), null);
            await removeTokens();
            router.replace("/login");
            return Promise.reject(new Error("Invalid tokens"));
          }

          console.log("✅ Tokens successfully refreshed and validated.");
          await saveTokens(newAccessToken, newRefreshToken);

          api.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
          chatApi.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
          instance.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
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
