import UserListLayout from "@/src/common/UserListLayout";
import { allUserMessagese } from "@/src/services/nestServices";
import { markSenderAsRead, setChatUsersPage } from "@/src/slices/chat";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Text, View, YStack } from "tamagui";

const PAGE_SIZE = 10;

interface MessageData {
  id?: string;
  sender: string;
  recipient?: string;
  recieveId?: string;
  receiveId?: string;
  userNameSender?: string;
  score?: number;
  unreadCount?: number;
  isReadChat?: boolean;
  [key: string]: any;
}

const ChatRoom: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const main = useAppSelector((state) => state?.main);
  const userSender = useAppSelector((state) => state.chat.users) || [];
  const chatListLoaded = useAppSelector((state) => state.chat.loaded);
  const skip = useAppSelector((state) => state.chat.skip);
  const hasMore = useAppSelector((state) => state.chat.hasMore);
  const userIdLogin = main?.userLogin?.user?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchingRef = useRef(false);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (!userIdLogin || fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        const res = await allUserMessagese(reset ? 0 : skip, PAGE_SIZE);
        const body = res?.data;
        logger.info("chat page", { reset, count: body?.data?.length });

        if (body?.status === 0 && Array.isArray(body.data)) {
          dispatch(
            setChatUsersPage({
              data: body.data,
              hasMore: Boolean(body.hasMore),
              reset,
            }),
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        fetchingRef.current = false;
      }
    },
    [userIdLogin, skip, dispatch],
  );

  useEffect(() => {
    if (chatListLoaded || !userIdLogin) return;
    setIsLoading(true);
    fetchPage(true).finally(() => setIsLoading(false));
  }, [chatListLoaded, userIdLogin]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || fetchingRef.current) return;
    setIsLoadingMore(true);
    try {
      await fetchPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, fetchPage]);

  const handleRefresh = useCallback(async () => {
    if (fetchingRef.current) return;
    setIsRefreshing(true);
    try {
      await fetchPage(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPage]);

  const handleRedirect = (data: MessageData) => {
    const senderStr = String(data.sender || data.id);
    dispatch(markSenderAsRead(senderStr));
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: senderStr,
        userName: data.userNameSender ?? data.userName ?? "",
        profile: getImageUrl(data) ?? "",
        score: String(data.score ?? 0),
      },
    });
  };

  logger.info("unreadCount", main?.unreadMessagesCount);

  // کامپوننت سفارشی حالت خالی همراه با دکمه Refresh
  const renderEmptyComponent = () => (
    <YStack flex={1} alignItems="center" justifyContent="center" py="$8" gap="$3">
      <MaterialIcons name="chat-bubble-outline" size={48} color="#9ca3af" />
      <Text color="#6b7280" fontSize="$4" fontWeight="600">
        Empty messages
      </Text>
      <Text color="#9ca3af" fontSize="$2">
        No conversations found yet
      </Text>
      <Pressable
        onPress={handleRefresh}
        disabled={isRefreshing}
        style={({ pressed }) => [
          styles.refreshButton,
          (isRefreshing || pressed) && { opacity: 0.75 },
        ]}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <View flexDirection="row" alignItems="center" gap="$2">
            <MaterialIcons name="refresh" size={18} color="#ffffff" />
            <Text color="#ffffff" fontWeight="600" fontSize="$3">
              Refresh
            </Text>
          </View>
        )}
      </Pressable>
    </YStack>
  );

  return (
    <UserListLayout
      title="Messages"
      isLoading={isLoading}
      data={userSender}
      emptyMessage="Empty messages"
      ListEmptyComponent={renderEmptyComponent}
      onBack={() => router.back()}
      onItemPress={handleRedirect}
      imgSize={50}
      onEndReached={handleLoadMore}
      isLoadingMore={isLoadingMore}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      keyExtractor={(item: MessageData) => String(item.sender)}
      renderRight={(user: MessageData) => {
        const showBadge = user?.unreadCount && user.unreadCount > 0;
        if (!showBadge) return null;
        return <View width={10} height={10} borderRadius={10} bg="#FF3040" />;
      }}
    />
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  refreshButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
});
