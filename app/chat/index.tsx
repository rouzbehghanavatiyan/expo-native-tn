import UserListLayout from "@/src/common/UserListLayout";
import { allUserMessagese } from "@/src/services/nestServices";
import { markSenderAsRead, setChatUsersPage } from "@/src/slices/chat";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "tamagui";

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

  logger.info("unreadCount", main?.unreadMessagesCount)

  return (
    <UserListLayout
      title="Messages"
      isLoading={isLoading}
      data={userSender}
      emptyMessage="Empty messages"
      onBack={() => router.back()}
      onItemPress={handleRedirect}
      imgSize={50}
      onEndReached={handleLoadMore}
      isLoadingMore={isLoadingMore}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      keyExtractor={(item: MessageData) => String(item.sender)}
      renderRight={(user: MessageData) => {
        const showBadge = user?.unreadCount && user.unreadCount > 0
        if (!showBadge) return null;
        return <View width={10} height={10} borderRadius={10} bg="#FF3040" />;
      }}
    />
  );
};

export default ChatRoom;
