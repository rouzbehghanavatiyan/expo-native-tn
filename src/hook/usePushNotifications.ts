import { registerForPushNotifications } from "@/src/services/notificationService";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

export function usePushNotifications() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const userId = 123;

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("notification دریافت شد:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("کاربر کلیک کرد:", data);
      });

    registerForPushNotifications(userId);

    setTimeout(() => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "تست نوتیفیکیشن",
          body: "این یک تست local است",
          data: {
            test: true,
          },
        },
        trigger: null,
      });
    }, 3000);

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
