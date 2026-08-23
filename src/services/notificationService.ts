import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "./api";

// آدرس پایه برای نوتیفیکیشن‌ها از .env خوانده می‌شود
const notifBaseURL = process.env.EXPO_PUBLIC_NOTIF;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

// export async function registerForPushNotifications(userId: number) {
//   if (!userId) {
//     console.log(
//       "❌ UserId is missing, cannot register for push notifications.",
//     );
//     return;
//   }

//   try {
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;

//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       console.log("❌ Failed to get push token for push notification!");
//       return;
//     }

//     if (Platform.OS === "android") {
//       await Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//       });
//     }

//     const projectId =
//       Constants.expoConfig?.extra?.eas?.projectId ??
//       Constants.easConfig?.projectId;

//     const tokenData = await Notifications.getExpoPushTokenAsync(
//       projectId ? { projectId } : undefined,
//     );

//     const expoPushToken = tokenData.data;
//     console.log("✅ Expo Push Token Generated:", expoPushToken);

//     // اصلاح مهم: ارسال Data به بک‌اند با استفاده از تابع کمکی خودتان
//     const postData = {
//       userId: userId,
//       expoPushToken: expoPushToken,
//     };

//     const resSubs = await saveSubscription(postData);

//     // اصلاح سینتکس Axios
//     if (resSubs.status === 200 || resSubs.status === 201) {
//       console.log("✅ Token successfully saved to backend");
//     } else {
//       console.log(
//         "❌ Failed to save token to backend, Status:",
//         resSubs.status,
//       );
//     }
//   } catch (error: any) {
//     console.error(
//       "❌ Error generating/sending push token:",
//       error.message || error,
//     );
//     if (error.response) {
//       console.error("❌ Server Error Response:", error.response.data);
//     }
//   }
// }

export const registerForPushNotifications = async (userId: number) => {
  if (!userId) {
    console.log(
      "❌ UserId is missing, cannot register for push notifications.",
    );
    return null;
  }

  try {
    // ۱. بررسی و دریافت پرمیشن‌ها
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

    // ۲. تنظیم کانال نوتیفیکیشن برای اندروید
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    // ۳. دریافت توکن مستقیم دستگاه (FCM Token) به جای Expo Token
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const fcmToken = tokenData.data;

    console.log("✅ FCM Token Generated:", fcmToken);

    // ۴. ارسال توکن به بک‌اند
    const postData = {
      userId: userId,
      expoPushToken: fcmToken, // به دلیل ساختار DTO بک‌اند شما، کلید را تغییر ندادیم
    };

    const resSubs = await saveSubscription(postData);

    if (resSubs.status === 200 || resSubs.status === 201) {
      console.log("✅ Token successfully saved to backend");
    } else {
      console.log(
        "❌ Failed to save token to backend, Status:",
        resSubs.status,
      );
    }

    return fcmToken;
  } catch (error: any) {
    console.error(
      "❌ Error generating/sending push token:",
      error.message || error,
    );
    return null;
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
