import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { H1 } from "tamagui";
import { unreadCount } from "../services/nestServices";
import { clearUnreadCount, setUnreadMessagesCount } from "../slices/main";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
import { logger } from "../utils/logger";
import { socketClient } from "../utils/socketClient";

const AppHeader = () => {
  const router = useRouter();
  const pathname: any = usePathname();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.main.userLogin?.user);
  const unreadMessagesCount = useAppSelector(
    (state) => state?.main?.unreadMessagesCount,
  );

  const routes = useMemo(
    () => ({
      isWatch: pathname === "/watch",
      isProfile: pathname === "/profile",
      isShowWatch: pathname === "/watch/show",
      isNotification: pathname === "/notification",
      isMessage: pathname === "/chat",
      isTopScore: pathname === "/topScore",
    }),
    [pathname],
  );

  const titleMap: Record<string, string> = {
    "/profile": "Profile",
    "/notification": "Notifications",
  };
  const headerTitle = titleMap[pathname] || "Clash Talent";

  const handleReadConfirmation = useCallback(
    (data: any) => {
      if (currentUser?.id === data?.receiver) {
        dispatch(clearUnreadCount());
      }
    },
    [currentUser, dispatch],
  );

  // 🟢 فقط شمارنده‌ی کلی رو زیاد می‌کنیم؛ جزئیات لیست چت مسئولیت useGlobalChatSocket است
  const handleReceiveMessage = useCallback(
    (data: any) => {
      const targetUserId = data?.recieveId ?? data?.receiveId;
      if (String(currentUser?.id) !== String(targetUserId)) return;

      dispatch(setUnreadMessagesCount((unreadMessagesCount || 0) + 1));
    },
    [currentUser, unreadMessagesCount, dispatch],
  );

  useEffect(() => {
    if (!socketClient || !currentUser) return;

    socketClient.on("receive_message", handleReceiveMessage);
    socketClient.on("messages_read_confirmation", handleReadConfirmation);

    return () => {
      socketClient.off("receive_message", handleReceiveMessage);
      socketClient.off("messages_read_confirmation", handleReadConfirmation);
    };
  }, [currentUser, handleReceiveMessage, handleReadConfirmation]);

  const getInitialCount = async () => {
    try {
      const count = await unreadCount(currentUser?.id);
      dispatch(setUnreadMessagesCount(count?.count));
    } catch (error) {
      logger.error("خطا در دریافت تعداد پیام‌های خوانده نشده", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    getInitialCount();
  }, [currentUser, dispatch]);

  const ActionIcons = () => (
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={() => router.push("/store")}>
        <Ionicons name="ticket-outline" size={22} color="#10153D" />
      </TouchableOpacity>

      <TouchableOpacity style={{ marginLeft: 16 }}>
        <View>
          <Ionicons
            name="mail-outline"
            onPress={() => {
              if (unreadMessagesCount > 0) {
                dispatch(clearUnreadCount());
              }
              router.push("/chat");
            }}
            size={22}
            color="#10153D"
          />
          {unreadMessagesCount > 0 && <View style={styles.badge} />}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (routes.isShowWatch) return null;

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <H1
          style={styles.logo}
          fontFamily="$logo"
          color="$textPrimary"
          size="$6"
        >
          {headerTitle}
        </H1>
      </View>

      {routes.isProfile ? (
        <TouchableOpacity onPress={() => router.push("/setting")}>
          <Ionicons name="settings-outline" size={22} color="#10153D" />
        </TouchableOpacity>
      ) : (
        <ActionIcons />
      )}
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    height: 40,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    fontFamily: "logoFont",
    fontSize: 20,
    color: "#10153D",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
});
