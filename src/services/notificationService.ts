import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { logger } from "../utils/logger";
import { api } from "./api";

const notifBaseURL = process.env.EXPO_PUBLIC_NOTIF;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") { 
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      logger.warn("اجازه notification داده نشد");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    logger.info("Resolved EAS projectId:", projectId);

    if (!projectId) {
      logger.warn("projectId پیدا نشد");
      return null;
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    logger.info("Expo push token:", expoPushToken);

    // await saveSubscription({
    //   userId,
    //   token: expoPushToken,
    //   platform: Platform.OS,
    // });

    return expoPushToken;
  } catch (error) {
    logger.error("registerForPushNotifications error:", error);
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
