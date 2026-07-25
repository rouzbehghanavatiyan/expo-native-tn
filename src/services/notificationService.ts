import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { logger } from "../utils/logger";
import { api } from "./api";

const notifBaseURL = process.env.EXPO_PUBLIC_NOTIF;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(
  userId: number | string,
): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      logger.warn("Push notifications فقط روی دستگاه واقعی کار می‌کند");
      return null;
    }

    const perm = await Notifications.getPermissionsAsync();
    logger.info("Permissions:", perm);

    let finalStatus = perm.status;

    if (finalStatus !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      logger.info("Requested permissions:", requested);
      finalStatus = requested.status;
    }

    if (finalStatus !== "granted") {
      logger.warn("Notification permission not granted");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    logger.info("projectId:", projectId);

    if (!projectId) {
      logger.warn("projectId پیدا نشد");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });

    logger.info("Expo token:", token);
    return token.data;
  } catch (error: any) {
    logger.error("registerForPushNotifications error message:", error?.message);
    logger.error(
      "registerForPushNotifications error response:",
      error?.response,
    );
    logger.error("registerForPushNotifications raw:", error);
    return null;
  }
}

export const createSubscription = async () => {
  const url = `${notifBaseURL}/public-key`;
  return await api.get(url);
};

export const saveSubscription = async (postData: any) => {
  const url = `${notifBaseURL}/subscribe`;
  return await api.post(url, postData);
};

export const sendAllNotif = async (postData: any) => {
  const url = `${notifBaseURL}/send-all`;
  return await api.post(url, postData);
};

export const sendUserNotif = async (postData: any) => {
  const url = `${notifBaseURL}/send`;
  return await api.post(url, postData);
};
