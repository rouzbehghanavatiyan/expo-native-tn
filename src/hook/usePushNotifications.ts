import { registerForPushNotifications } from "@/src/services/notificationService";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { useAppSelector } from "../store/reduxHookType";

export function usePushNotifications() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const main = useAppSelector((state) => state?.main);

  useEffect(() => {
    const userId = main?.userLogin?.user?.id;

    registerForPushNotifications(userId);

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("notification get it:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("User clicked:", data);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
