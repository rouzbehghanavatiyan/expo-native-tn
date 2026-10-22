import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  KeyboardAvoidingView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme, XStack } from "tamagui";
import AppLoading from "../components/AppLoading";
import BaseInput from "../components/BaseInput";
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
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((s) => s.isVisible);

  const currentUser = useAppSelector((state) => state.main.userLogin?.user);
  const unreadMessagesCount = useAppSelector(
    (state) => state?.main?.unreadMessagesCount,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const PAGE_SIZE = 10;
  const END_REACHED_OFFSET = 10;

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      requestIdRef.current += 1;
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
      setIsLoadingMore(false);
      setPageNumber(1);
      setHasMore(true);
      loadingMoreRef.current = false;
      return;
    }

    setShowDropdown(true);
    setIsLoading(true);

    const currentRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      try {
        const response: any = await searchUser({
          userNameReq: query,
          pageNumber: 1,
          pageSize: PAGE_SIZE,
        });

        if (currentRequestId !== requestIdRef.current) return;

        const items = response?.data?.data?.items || [];
        setSearchResults(items);
        setPageNumber(1);
        setHasMore(items.length === PAGE_SIZE);
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) return;
        logger.error("Error for searching:", error);
        setSearchResults([]);
        setHasMore(false);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadMore = useCallback(async () => {
    const query = searchQuery.trim();

    if (!query || isLoading || !hasMore || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    const currentRequestId = requestIdRef.current;
    const nextPage = pageNumber + 1;

    try {
      const response: any = await searchUser({
        userNameReq: query,
        pageNumber: nextPage,
        pageSize: PAGE_SIZE,
      });

      if (currentRequestId !== requestIdRef.current) return;

      const items: any[] = response?.data?.data?.items || [];

      setSearchResults((prev) => {
        // حذف آیتم‌های تکراری
        const existingIds = new Set(prev.map((u) => u?.id));
        const fresh = items.filter((u) => !existingIds.has(u?.id));
        return [...prev, ...fresh];
      });

      setPageNumber(nextPage);
      setHasMore(items.length === PAGE_SIZE);
    } catch (error) {
      logger.error("Error for load more search:", error);
    } finally {
      loadingMoreRef.current = false;
      if (currentRequestId === requestIdRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [searchQuery, isLoading, hasMore, pageNumber]);

  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const distanceFromEnd =
        contentSize.height - (layoutMeasurement.height + contentOffset.y);

      if (distanceFromEnd <= END_REACHED_OFFSET) {
        loadMore();
      }
    },
    [loadMore],
  );

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
      badgeRed: "#f44336",
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
  const headerTitle = titleMap[pathname] || "Clash Talent";

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    setShowDropdown(true);
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response: any = await searchUser({
          userNameReq: searchQuery.trim(),
          pageNumber: 1,
          pageSize: 5,
        });

        const items = response?.data?.data?.items || [];
        setSearchResults(items);
      } catch (error) {
        logger.error("Error for searching:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (user: any) => {
    Keyboard.dismiss();
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
      logger.error("Error for read count", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    getInitialCount();
  }, []);

  const ActionIcons = () => {
    return (
      <XStack alignItems="center" gap="$3">
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => {
            if (unreadMessagesCount > 0) dispatch(clearUnreadCount());
            router.push("/chat");
          }}
          style={styles.iconWrapper}
        >
          <Ionicons
            name="mail-outline"
            size={22}
            color={colors.textSecondary}
          />
          {unreadMessagesCount > 0 && (
            <View
              style={[styles.badge, { backgroundColor: colors.badgeRed }]}
            />
          )}
        </TouchableOpacity>
      </XStack>
    );
  };

  if (routes.isShowWatch) return null;

  return (
    <>
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
                height={34}
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
              />
            ) : (
              <Text
                fontSize={20}
                color="$textPrimary"
                style={{ fontFamily: "OswaldLight" }}
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
      </View>

      {routes.isWatch && showDropdown && (
        <View style={[styles.overlayContainer, { top: 40 + insets.top }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Keyboard.dismiss();
              setShowDropdown(false);
            }}
          />

          <KeyboardAvoidingView
            behavior="padding"
            style={styles.keyboardAvoid}
            pointerEvents="box-none"
          >
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
                  keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                  style={styles.dropdownList}
                  contentContainerStyle={styles.listContentContainer}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  showsVerticalScrollIndicator={true}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  ListFooterComponent={
                    isLoadingMore ? (
                      <View style={styles.footerLoading}>
                        <AppLoading />
                      </View>
                    ) : null
                  }
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
                        imgSize={50}
                        score={item?.score}
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
                          "User"}
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
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 99,
  },
  footerLoading: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    height: 40,
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
  iconWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  leftSection: {
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
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  keyboardAvoid: {
    flex: 1,
  },
  dropdownBox: {
    borderRadius: 12,
    maxHeight: 350,
    marginTop: 0,
    elevation: 12,
    overflow: "hidden",
  },
  dropdownList: {
    flexGrow: 0,
  },
  listContentContainer: {
    paddingBottom: 60,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dropdownEmpty: {
    padding: 16,
    alignItems: "center",
  },
  dropdownEmptyText: {
    fontSize: 13,
  },
});
