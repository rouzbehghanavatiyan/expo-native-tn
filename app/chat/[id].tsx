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
import SmartText from "./SmartText";

interface MessageType {
  id?: string | number;
  tempId?: string;
  userProfile?: string;
  senderId: string | number;
  receiveId: string | number;
  content: string;
  time: string;
  createdAt?: string;
  userNameSender?: string;
  isRead?: boolean;
}

const PAGE_SIZE = 10;

/** تبدیل یک تاریخ (ISO یا هر فرمت قابل‌پارس) به ساعت:دقیقه برای نمایش */
function formatTime(dateInput?: string): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toTimeString().slice(0, 5);
}

/**
 * چون FlatList به صورت inverted رندر می‌شود (index 0 = پایین صفحه = جدیدترین پیام)،
 * آرایه‌ی پیام‌ها همیشه باید به صورت نزولی (جدید -> قدیم) مرتب باشد.
 * این تابع پیام‌های جدید فچ‌شده را با پیام‌های موجود merge می‌کند،
 * از تکراری‌شدن (بر اساس id) جلوگیری می‌کند و دوباره مرتب‌سازی می‌کند.
 */
function mergeDescending(
  prev: MessageType[],
  fetched: MessageType[],
): MessageType[] {
  const existingIds = new Set(
    prev.filter((m) => m.id != null).map((m) => String(m.id)),
  );

  const toAdd = fetched.filter(
    (m) => m.id == null || !existingIds.has(String(m.id)),
  );

  const merged = [...prev, ...toAdd];

  return merged.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.time).getTime();
    const timeB = new Date(b.createdAt || b.time).getTime();
    return timeB - timeA; // نزولی: جدید -> قدیم
  });
}

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

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [title, setTitle] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const userProfile = getImageUrl(userInfo?.profile);
  const otherUserProfile = profile ? getImageUrl(profile) : "";

  const isInitialLoadRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [, setHasMoreState] = useState(true);
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
    const trimmed = title.trim();
    if (!trimmed || !userIdLogin || !reciveUserId) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = new Date();

    const serverMessage = {
      sender: userIdLogin,
      recieveId: reciveUserId,
      content: trimmed,
      userProfile: userInfo?.profile || "",
      userNameSender: userInfo?.userName || "",
      tempId,
    };

    const optimisticMessage: MessageType = {
      tempId,
      senderId: userIdLogin,
      receiveId: reciveUserId,
      content: trimmed,
      time: formatTime(now.toISOString()),
      createdAt: now.toISOString(),
      userProfile: userInfo?.profile || "",
      isRead: false,
    };

    socketClient?.emit("send_message", serverMessage);

    // پیام جدید باید ابتدای آرایه اضافه شود چون آرایه نزولی (جدید -> قدیم) است
    setMessages((prev) => [optimisticMessage, ...prev]);
    setTitle("");
    setShowStickers(false);
    scrollToBottom();
  };

  // وقتی سرور پیام را ذخیره کرد، id واقعی دیتابیس را جایگزین tempId می‌کند
  const handleMessageSentAck = useCallback((data: any) => {
    if (!data?.tempId) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.tempId === data.tempId
          ? {
              ...msg,
              id: data.id,
              // زمان واقعی سرور جایگزین زمان محلیِ optimistic می‌شود
              createdAt: data.createdAt || msg.createdAt,
              time: data.createdAt ? formatTime(data.createdAt) : msg.time,
            }
          : msg,
      ),
    );
  }, []);

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
      // پیام‌های خودمان قبلا به صورت optimistic اضافه شده‌اند
      if (sender === currentLogin) return;

      const createdAt = data.createdAt || data.time || new Date().toISOString();

      const normalizedMsg: MessageType = {
        id: data.id,
        tempId: data.tempId,
        senderId: sender,
        receiveId: receiver,
        content: data.content ?? data.title ?? "",
        time: formatTime(createdAt),
        createdAt,
        userProfile: data.userProfile || "",
        isRead: data.isRead ?? false,
      };

      if (sender === currentOther) {
        triggerMarkAsRead();
      }

      // پیام جدید باید ابتدای آرایه اضافه شود چون آرایه نزولی (جدید -> قدیم) است
      setMessages((prev) => [normalizedMsg, ...prev]);
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

        const fetched: MessageType[] = (res?.data?.messages || []).map(
          (m: any) => {
            const createdAt = m.createdAt || m.time || new Date().toISOString();
            const rawContent = m.content;
            const contentText =
              rawContent && typeof rawContent === "object"
                ? (rawContent.text ?? "")
                : (rawContent ?? m.title ?? "");
            return {
              id: m.id,
              senderId: m.senderId ?? m.sender,
              receiveId: m.receiveId ?? m.recieveId,
              content: contentText,
              time: formatTime(createdAt),
              createdAt,
              userProfile: m.userProfile,
              isRead: m.isRead ?? false,
            };
          },
        );

        const fetchedHasMore: boolean = res?.data?.hasMore ?? false;
        hasMoreRef.current = fetchedHasMore;
        setHasMoreState(fetchedHasMore);

        setMessages((prev) => mergeDescending(prev, fetched));

        paginationRef.current.skip += fetched.length;
      } catch (error) {
        logger.error("getMessages error:", error);
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
    socketClient?.on("message_sent_ack", handleMessageSentAck);

    return () => {
      socketClient?.off("receive_message", handleReciveMessage);
      socketClient?.off("messages_read", handleMessagesReadEvent);
      socketClient?.off("message_sent_ack", handleMessageSentAck);
      triggerMarkAsRead();
    };
  }, [
    userIdLogin,
    reciveUserId,
    getMessages,
    handleReciveMessage,
    handleMessagesReadEvent,
    handleMessageSentAck,
    triggerMarkAsRead,
  ]);

  const handleLoadMore = useCallback(() => {
    if (isInitialLoadRef.current) return;
    if (isLoadingMoreRef.current) return;
    if (!hasMoreRef.current) return;
    getMessages(true);
  }, [getMessages]);

  const renderMessage = ({ item }: { item: MessageType }) => {
    const isOwn = String(item.senderId) === String(userIdLogin);

    const messageAvatar = isOwn
      ? userProfile
      : item.userProfile
        ? getImageUrl(item.userProfile)
        : profile;

    // const messageAvatar = isOwn
    //   ? userProfile
    //   : item.userProfile
    //     ? getImageUrl(item.userProfile)
    //     : otherUserProfile;

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
          shadowColor="black"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.05}
          shadowRadius={3}
          elevation={1.5}
        >
          <SmartText style={{ writingDirection: "rtl", textAlign: "right" }}>
            {item.content}
          </SmartText>

          <XStack
            alignSelf={isOwn ? "flex-end" : "flex-start"}
            alignItems="center"
            gap="$1"
            mt="$1"
          >
            <Text fontSize={8} color="$grey400">
              {item.time}
            </Text>
            {isOwn && (
              <Text fontSize={9} color={item.isRead ? "$blue500" : "$grey400"}>
                {item.isRead ? "✓✓" : "✓"}
              </Text>
            )}
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
