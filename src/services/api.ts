import axios from "axios";
import { router } from "expo-router";
import { getToken, removeToken } from "./tokenServices";

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

const applyRequestInterceptor = (instance: typeof api) => {
  instance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

let isRedirecting = false;

const applyResponseInterceptor = (instance: typeof api) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRedirecting) {
          isRedirecting = true;
          await removeToken();
          router.replace("/login");
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
