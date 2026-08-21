import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { api } from "./api";

// آدرس پایه برای نوتیفیکیشن‌ها از .env خوانده می‌شود
const notifBaseURL = process.env.EXPO_PUBLIC_NOTIF;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
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

// ---- توابع سرویس ---- //

export const registerForPushNotifications = async (userId: number) => {
  // گرفتن projectId از تنظیمات app.json
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    console.error("❌ Project ID not found. Run 'eas init' or check app.json.");
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId, // 👈 این بخش حتماً باید پاس داده شود
    });

    return tokenData.data;
  } catch (error) {
    console.error("❌ Error fetching Expo token:", error);
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
  // اگر در Ocelot مسیر /subscribe تعریف شده، به شکل زیر ارسال می‌شود
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
