import axios from "axios";
import { router } from "expo-router";
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

// اضافه کردن اکسس توکن به تمامی ریکوئست‌ها
const applyRequestInterceptor = (instance: typeof api) => {
  instance.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

// متغیرهایی برای جلوگیری از ارسال چندباره درخواست Refresh
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
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // اگر ارور 401 بود و قبلاً تلاشی برای این ریکوئست نشده بود
      if (error.response?.status === 401 && !originalRequest._retry) {
        // اگر در حال حاضر یک درخواست رفرش در جریان است، ریکوئست فعلی را در صف منتظر بگذار
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

        originalRequest._retry = true;
        isRefreshing = true;

        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();

        if (!accessToken || !refreshToken) {
          isRefreshing = false;
          await removeTokens();
          router.replace("/login");
          return Promise.reject(error);
        }

        try {
          // درخواست مستقیم با axios خام (بدون api) تا وارد لوپ بی‌نهایت اینترسپتورها نشویم
          // نکته: آدرس دقیق کنترلر لاگین خود را در خط زیر وارد کنید
          const response = await axios.post(`${baseURL}/Login/refreshToken`, {
            accessToken: accessToken,
            refreshToken: refreshToken,
          });

          // دریافت توکن‌های جدید (دقت کنید نام پراپرتی‌ها با DTO بک‌اند یکی باشد)
          const newAccessToken = response.data.token;
          const newRefreshToken = response.data.refreshToken;

          // ذخیره توکن‌های جدید
          await saveTokens(newAccessToken, newRefreshToken);

          // تنظیم توکن جدید روی هدرها و اجرای مجدد ریکوئست اصلی
          instance.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return instance(originalRequest);
        } catch (refreshError) {
          // اگر خود رفرش توکن هم منقضی شده بود یا ارور داد، کاربر باید لاگین کند
          processQueue(refreshError, null);
          await removeTokens();
          router.replace("/login");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

applyRequestInterceptor(api);
applyRequestInterceptor(chatApi);

applyResponseInterceptor(api);
applyResponseInterceptor(chatApi);
