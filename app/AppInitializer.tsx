import AppLoading from "@/src/components/AppLoading";
import { useAuthInitialization } from "@/src/hook/useAuthInitialization";
import { useAuthRedirect } from "@/src/hook/useAuthRedirect";
import { usePushNotifications } from "@/src/hook/usePushNotifications";
import { useSocketInitializer } from "@/src/hook/useSocketInitializer";
import { useLocalSearchParams, usePathname } from "expo-router";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const main = useSelector((state: any) => state.main);
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const token = main?.userLogin?.token || main?.token || null;
  const userId = main?.userId;
  const userLoginId = main?.userLogin?.user?.id || main?.userLogin?.userId;
  const isChat = pathname?.includes("chat");
  const receiveUserId = useMemo(() => {
    if (!isChat) return null;

    const rawUser = params?.user;

    if (Array.isArray(rawUser)) {
      return Number(rawUser[0]) || null;
    }

    return Number(rawUser) || null;
  }, [isChat, params?.user]);

  const { isInitializing } = useAuthInitialization();

  useAuthRedirect({
    isInitializing,
    token,
    userId,
    userLoginId,
  });

  useSocketInitializer({
    userLoginId,
    userId,
  });

  usePushNotifications();

  if (isInitializing) {
    return <AppLoading />;
  }

  return (
    <>
      {children}
      {isInitializing && <AppLoading overlay />}
    </>
  );
}
