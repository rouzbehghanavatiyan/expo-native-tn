import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "./api";

const notifBaseURL = process.env.EXPO_PUBLIC_VITE_URL;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Failed to get push token for push notification!");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const tokenData = await Notifications.getDevicePushTokenAsync();
    const fcmToken = tokenData?.data;

    console.log("✅ FCM Token Generated:", fcmToken);
    return fcmToken;
  } catch (error: any) {
    console.error("❌ Error generating push token:", error.message || error);
    return null;
  }
};

export const syncPushToken = async (userId: string | number) => {
  if (!userId) return;
  try {
    const deviceToken = await registerForPushNotifications();
    if (!deviceToken) {
      console.warn("❌ Could not get push token from device.");
      return;
    }

    const cacheKey = `user_fcm_token_${userId}`;
    const cachedToken = await AsyncStorage.getItem(cacheKey);

    if (deviceToken !== cachedToken) {
      console.log("🔄 Token is new or changed. Sending to backend...");

      const res = await saveSubscription({
        userId: Number(userId),
        expoPushToken: deviceToken,
      });

      // فقط اگه واقعاً موفق بود کش کن
      if (res?.status === 200 || res?.status === 201) {
        await AsyncStorage.setItem(cacheKey, deviceToken);
        console.log("✅ Token successfully synced and cached.");
      } else {
        console.warn(
          "⚠️ Backend did not confirm success, not caching:",
          res?.status,
          res?.data,
        );
      }
    } else {
      console.log("✅ Token hasn't changed. No need to update backend.");
    }

    return deviceToken;
  } catch (error: any) {
    console.error(
      "❌ Error syncing push token:",
      error?.response?.status,
      error?.response?.data || error.message,
    );
  }
};

export const createSubscription = async () => {
  const url = `${notifBaseURL}/public-key`;
  return await api.get(url);
};

export const saveSubscription = async (postData: {
  userId: number;
  expoPushToken: string;
}) => {
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
