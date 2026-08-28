import AppLoading from "@/src/components/AppLoading";
import ImageRank from "@/src/components/ImageRank";
import MessageInput from "@/src/components/MessageInput";
import { markAsRead, userMessages } from "@/src/services/nestServices";
import { markSenderAsRead } from "@/src/slices/chat";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import { socketClient } from "@/src/utils/socketClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import ChatHeader from "./ChatHeader";

interface MessageType {
  id?: string | number;
  tempId?: any;
  userProfile?: string;
  senderId: string | number;
  receiveId: string | number;
  title?: string;
  content?: any;
  time: string;
  createdAt?: string;
  userNameSender?: string;
  isRead?: boolean;
}

const PAGE_SIZE = 10;

// timestamp کمکی برای مرتب‌سازی نزولی (جدید -> قدیم)
const getTimestamp = (m: MessageType) => {
  if (m.createdAt) return new Date(m.createdAt).getTime();
  return Date.now(); // پیام تازه ارسال‌شده/آپتیمیستیک، همیشه جدیدترین است
};

// merge + dedupe + سورت نزولی، برای هماهنگی با FlatList معکوس (inverted)
const mergeDescending = (a: MessageType[], b: MessageType[]) => {
  const map = new Map<string, MessageType>();
  [...a, ...b].forEach((m) => {
    const key = m.id != null ? `id-${m.id}` : `temp-${m.tempId}`;
    map.set(key, { ...(map.get(key) || {}), ...m });
  });
  return Array.from(map.values()).sort(
    (x, y) => getTimestamp(y) - getTimestamp(x),
  );
};

export default function PrivateChat() {
  const { id, userName, profile, score } = useLocalSearchParams<{
    id: string;
    userName: string;
    profile: string;
    score: any;
  }>();
  const userScore = Number(score);
  const main = useAppSelector((state) => state?.main);
  const userIdLogin = main?.userLogin?.user?.id;
  const reciveUserId = id;

  // پیام‌ها به‌صورت نزولی نگه‌داری می‌شوند: index 0 = جدیدترین
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [title, setTitle] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const userProfile = getImageUrl(userInfo?.profile);

  const isInitialLoadRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const dispatch = useAppDispatch();
  const paginationRef = useRef({ skip: 0, take: PAGE_SIZE });

  const scrollToBottom = (animated = true) => {
    // در لیست inverted، offset صفر = پایین صفحه (جدیدترین پیام)
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated });
    });
  };

  const triggerMarkAsRead = useCallback(async () => {
    if (!userIdLogin || !reciveUserId) return;
    try {
      socketClient?.emit("mark_messages_as_read", {
        sender: reciveUserId,
        receiver: userIdLogin,
      });
      await markAsRead(reciveUserId, userIdLogin);
      await AsyncStorage.setItem(`message_read_${reciveUserId}`, "true");
      dispatch(markSenderAsRead(String(reciveUserId)));
    } catch (err) {
      logger.error("Error triggering markAsRead:", err);
    }
  }, [userIdLogin, reciveUserId, dispatch]);

  const handleSendMessage = async () => {
    if (!title.trim()) return;

    const timeString = new Date().toTimeString().slice(0, 5);
    const tempId = Date.now().toString();

    const serverMessage = {
      id: tempId,
      tempId: tempId,
      sender: userIdLogin,
      recieveId: reciveUserId,
      title: title.trim(),
      content: title.trim(),
      time: timeString,
      userProfile: userInfo?.profile || "",
      isRead: false,
    };

    socketClient?.emit("send_message", serverMessage);

    const uiMessage: MessageType = {
      ...serverMessage,
      senderId: userIdLogin,
      receiveId: reciveUserId,
      createdAt: new Date().toISOString(),
    };

    // جدیدترین پیام باید در ابتدای آرایه (index 0) قرار بگیرد
    setMessages((prev) => mergeDescending(prev, [uiMessage]));
    setTitle("");
    setShowStickers(false);
    scrollToBottom();
  };

  const handleReciveMessage = useCallback(
    (data: any) => {
      logger.debug("Received Message:", data);

      const sender = String(data.senderId ?? data.sender);
      const receiver = String(data.receiveId ?? data.recieveId);
      const currentLogin = String(userIdLogin);
      const currentOther = String(reciveUserId);

      const shouldShow =
        (sender === currentLogin && receiver === currentOther) ||
        (receiver === currentLogin && sender === currentOther);

      if (!shouldShow) return;
      if (sender === currentLogin) return;

      const normalizedMsg: MessageType = {
        id: data.id,
        tempId: data.tempId,
        senderId: sender,
        receiveId: receiver,
        title: data.title,
        content: data.content ?? data.title,
        time: data.time || new Date().toTimeString().slice(0, 5),
        createdAt: data.createdAt || new Date().toISOString(),
        userProfile: data.userProfile || "",
        isRead: data.isRead ?? false,
      };

      if (sender === currentOther) {
        triggerMarkAsRead();
      }

      setMessages((prev) => mergeDescending(prev, [normalizedMsg]));
      scrollToBottom();
    },
    [userIdLogin, reciveUserId, triggerMarkAsRead],
  );

  const handleMessagesReadEvent = useCallback(
    (data: { sender: string | number; receiver: string | number }) => {
      if (String(data.receiver) === String(reciveUserId)) {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.senderId) === String(userIdLogin)
              ? { ...msg, isRead: true }
              : msg,
          ),
        );
      }
    },
    [reciveUserId, userIdLogin],
  );

  const getMessages = useCallback(
    async (isLoadMore = false) => {
      if (!userIdLogin || !reciveUserId) return;
      if (isLoadMore && (!hasMoreRef.current || isLoadingMoreRef.current))
        return;

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
          isLoadingMoreRef.current = true;
        } else {
          setIsInitialLoading(true);
        }

        const res = await userMessages(
          userIdLogin,
          reciveUserId as any,
          paginationRef.current.skip,
          paginationRef.current.take,
        );

        logger.debug("user messages:", res?.data);

        // پاسخ سرور صعودی است (قدیم -> جدید)؛ نرمال‌سازی فیلدها
        const fetched: MessageType[] = (res?.data?.messages || []).map(
          (m: any) => {
            let messageTime = m.time;
            if (!messageTime && m.createdAt) {
              const date = new Date(m.createdAt);
              const hours = date.getHours().toString().padStart(2, "0");
              const minutes = date.getMinutes().toString().padStart(2, "0");
              messageTime = `${hours}:${minutes}`;
            }
            return {
              ...m,
              senderId: m.senderId ?? m.sender,
              receiveId: m.receiveId ?? m.recieveId,
              time: messageTime || new Date().toTimeString().slice(0, 5),
            };
          },
        );

        const fetchedHasMore: boolean = res?.data?.hasMore ?? false;
        hasMoreRef.current = fetchedHasMore;
        setHasMoreState(fetchedHasMore);

        // merge می‌کند و به‌صورت نزولی (جدید -> قدیم) مرتب می‌کند
        setMessages((prev) => mergeDescending(prev, fetched));

        paginationRef.current.skip += fetched.length;
      } catch (error) {
        console.log("getMessages error:", error);
      } finally {
        if (isLoadMore) {
          setIsLoadingMore(false);
          isLoadingMoreRef.current = false;
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [userIdLogin, reciveUserId],
  );

  const [, setHasMoreState] = useState(true);

  useEffect(() => {
    if (!userIdLogin || !reciveUserId) return;
    paginationRef.current = { skip: 0, take: PAGE_SIZE };
    isInitialLoadRef.current = true;
    isLoadingMoreRef.current = false;
    hasMoreRef.current = true;

    setMessages([]);
    setIsLoadingMore(false);

    getMessages(false).finally(() => {
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 500);
    });
    triggerMarkAsRead();
    socketClient?.on("receive_message", handleReciveMessage);
    socketClient?.on("messages_read", handleMessagesReadEvent);

    return () => {
      socketClient?.off("receive_message", handleReciveMessage);
      socketClient?.off("messages_read", handleMessagesReadEvent);
      triggerMarkAsRead();
    };
  }, [
    userIdLogin,
    reciveUserId,
    getMessages,
    handleReciveMessage,
    handleMessagesReadEvent,
    triggerMarkAsRead,
  ]);

  const handleLoadMore = useCallback(() => {
    if (isInitialLoadRef.current) return;
    if (isLoadingMoreRef.current) return;
    if (!hasMoreRef.current) return;
    getMessages(true);
  }, [getMessages]);

  const otherUserProfile = profile || "";

  const renderMessage = ({ item }: { item: MessageType }) => {
    const isOwn = String(item.senderId) === String(userIdLogin);

    const messageAvatar = isOwn
      ? userProfile
      : item.userProfile
        ? getImageUrl(item.userProfile)
        : otherUserProfile;

    return (
      <XStack
        justifyContent={isOwn ? "flex-end" : "flex-start"}
        alignItems="flex-end"
        px="$3"
        py="$2"
        width="100%"
      >
        {!isOwn && <ImageRank imgSrc={messageAvatar} imgSize={35} />}

        <YStack
          maxWidth="75%"
          bg={isOwn ? "white" : "$grey100"}
          borderRadius="$4"
          px="$3"
          py="$2"
          mx="$2"
        >
          <Text
            style={{ writingDirection: "rtl", textAlign: "right" }}
            flexWrap="wrap"
          >
            {typeof item?.content === "string" ? item?.content : item?.title}
          </Text>

          <XStack
            alignSelf={isOwn ? "flex-end" : "flex-start"}
            alignItems="center"
            gap="$1"
            mt="$1"
          >
            <Text fontSize={8} color="$grey400">
              {item?.time?.slice(0, 5)}
            </Text>
          </XStack>
        </YStack>

        {isOwn && <ImageRank imgSrc={messageAvatar} imgSize={35} />}
      </XStack>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <YStack flex={1} bg="$background">
          <ChatHeader
            userName={userName}
            userProfile={profile}
            score={userScore}
          />
          {isInitialLoading ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              bg="$background"
            >
              <AppLoading />
            </YStack>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              inverted
              keyExtractor={(item, index) => {
                if (item.id != null) return `msg-${item.id}`;
                if (item.tempId != null) return `temp-${item.tempId}`;
                return `idx-${index}`;
              }}
              renderItem={renderMessage}
              onScroll={({ nativeEvent }) => {
                const { contentOffset, contentSize, layoutMeasurement } =
                  nativeEvent;
                const paddingToEnd = 60; // فاصله‌ی حساسیت قبل از رسیدن به انتهای دیتا (بالای صفحه در حالت inverted)
                const isCloseToEnd =
                  contentOffset.y + layoutMeasurement.height >=
                  contentSize.height - paddingToEnd;

                if (isCloseToEnd) {
                  handleLoadMore();
                }
              }}
              scrollEventThrottle={16}
              ListFooterComponent={
                isLoadingMore ? (
                  <XStack justifyContent="center" py="$2">
                    <AppLoading />
                  </XStack>
                ) : null
              }
              contentContainerStyle={{
                paddingVertical: 10,
              }}
            />
          )}
          {!isInitialLoading && (
            <MessageInput
              title={title}
              setTitle={setTitle}
              handleSendMessage={handleSendMessage}
              showStickers={showStickers}
              setShowStickers={setShowStickers}
              onAttachClick={() => console.log("Attach clicked")}
            />
          )}
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
