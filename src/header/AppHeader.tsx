import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "tamagui";
import AppLoading from "../components/AppLoading";
import BaseInput from "../components/BaseInput";
import { Icon } from "../components/Icon";
import ImageRank from "../components/ImageRank";
import { getThemeColor } from "../hook/getThemeColor";
import { searchUser } from "../services/masterServices";
import { unreadCount } from "../services/nestServices";
import { clearUnreadCount, setUnreadMessagesCount } from "../slices/main";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
import { getImageUrl } from "../utils/fileHelper";
import { logger } from "../utils/logger";
import { socketClient } from "../utils/socketClient";

const AppHeader = () => {
  const router = useRouter();
  const pathname: any = usePathname();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const currentUser = useAppSelector((state) => state.main.userLogin?.user);
  const unreadMessagesCount = useAppSelector(
    (state) => state?.main?.unreadMessagesCount,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const colors = useMemo(
    () => ({
      background: getThemeColor(theme.background, "#fff"),
      backgroundPaper: getThemeColor(theme.backgroundPaper, "#1e1e2d"),
      textPrimary: getThemeColor(theme.textPrimary ?? theme.color, "#10153D"),
      textSecondary: getThemeColor(
        theme.textSecondary ?? theme.colorMuted,
        "#64748B",
      ),
      divider: getThemeColor(theme.divider, "#F1F5F9"),
      borderColor: getThemeColor(theme.borderColor, "#334155"),
    }),
    [theme],
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
  const headerTitle = titleMap[pathname] || "Star Faceoff";

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setShowDropdown(true);

      try {
        const response: any = await searchUser({
          userNameReq: searchQuery.trim(),
          pageNumber: 1,
          pageSize: 10,
        });

        const items = response?.data?.data?.items || [];
        setSearchResults(items);
      } catch (error) {
        logger.error("خطا در سرچ کاربر:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (user: any) => {
    setShowDropdown(false);
    setSearchQuery("");
    const targetData = {
      profile: user?.profile,
      user: user?.user ?? {
        id: user?.id,
        userName: user?.userName,
      },
      score: user?.score ?? 0,
      mail: user?.mail ?? user?.user?.mail ?? "",
      location: user?.location ?? user?.user?.location ?? "",
      bio: user?.bio ?? user?.user?.bio ?? "",
      isFollowedByMe: user?.isFollowedByMe,
    };
    logger.info("Selected user:", user);
    router.push({
      pathname: "/profile",
      params: {
        userData: JSON.stringify(targetData),
      },
    });
  };

  const handleReadConfirmation = useCallback(
    (data: any) => {
      if (currentUser?.id === data?.receiver) {
        dispatch(clearUnreadCount());
      }
    },
    [currentUser, dispatch],
  );

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
            color={colors.textSecondary}
          />
          {unreadMessagesCount > 0 && <View style={styles.badge} />}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (routes.isShowWatch) return null;

  return (
    <View style={[styles.container]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.leftSection,
            routes.isWatch && { flex: 1, marginRight: 12 },
          ]}
        >
          {routes.isWatch ? (
            <BaseInput
              height={30}
              variant="filled"
              placeholder="Search by username"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              fontSize={13}
              backgroundColor={colors.backgroundPaper}
              borderColor={colors.borderColor}
              placeholderTextColor={colors.textSecondary}
              color={colors.textPrimary}
              rightIcon={
                <TouchableOpacity
                  onPress={() => {
                    setShowDropdown(false);
                    router.push({
                      pathname: "/searchListUser",
                      params: { query: searchQuery.trim() },
                    });
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="search" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              }
            />
          ) : (
            // <H2
            //   fontFamily="$logo"
            //   fontSize={20}
            //   fontWeight="bold"
            //   color="$textPrimary"
            // >
            // </H2>
            <Text
              fontSize={20}
              color="$textPrimary"
              style={{ fontFamily: "HandleeRegular" }}
            >
              {headerTitle}
            </Text>
          )}
        </View>

        {routes.isProfile ? (
          <TouchableOpacity onPress={() => router.push("/setting")}>
            <Ionicons
              name="settings-outline"
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <ActionIcons />
        )}
      </View>

      {routes.isWatch && showDropdown && (
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowDropdown(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowDropdown(false)}
            />
            <View
              style={[
                styles.dropdownBox,
                {
                  backgroundColor: colors.backgroundPaper,
                  borderColor: colors.borderColor,
                },
              ]}
            >
              {isLoading ? (
                <View style={styles.dropdownLoading}>
                  <AppLoading />
                </View>
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item, index) =>
                    item?.id?.toString() || index.toString()
                  }
                  style={styles.dropdownList}
                  contentContainerStyle={styles.listContentContainer}
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.resultItem,
                        { borderBottomColor: colors.borderColor },
                      ]}
                      onPress={() => handleSelectUser(item)}
                      activeOpacity={0.7}
                    >
                      <ImageRank
                        iconClass="text-gray-200"
                        imgSrc={getImageUrl(item?.profile)}
                        imgSize={35}
                      />
                      <Text
                        style={[
                          styles.resultText,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {item?.userName ||
                          item?.fullName ||
                          item?.title ||
                          "کاربر"}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.dropdownEmpty}>
                  <Text
                    style={[
                      styles.dropdownEmptyText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Not found
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 99,
  },
  header: {
    height: 35,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flexDirection: "row",
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
  modalOverlay: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 16,
  },
  dropdownBox: {
    borderEndEndRadius: 10,
    borderBottomLeftRadius: 10,
    maxHeight: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownList: {
    flexGrow: 0,
  },
  listContentContainer: {
    paddingBottom: 10,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  resultText: {
    fontSize: 14,
  },
  dropdownLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  dropdownEmpty: {
    padding: 16,
    alignItems: "center",
  },
  dropdownEmptyText: {
    fontSize: 13,
  },
});
