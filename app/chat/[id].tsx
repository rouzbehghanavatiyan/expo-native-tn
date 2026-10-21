import AppLoading from "@/src/components/AppLoading";
import ImageRank from "@/src/components/ImageRank";
import MessageInput from "@/src/components/MessageInput";
import { useAppTheme } from "@/src/hook/ThemeContext";
import { markAsRead, userMessages } from "@/src/services/nestServices";
import { markSenderAsRead } from "@/src/slices/chat";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import { socketClient } from "@/src/utils/socketClient";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import {
  KeyboardAvoidingView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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

function formatTime(dateInput?: string): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toTimeString().slice(0, 5);
}

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
    return timeB - timeA;
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
  const { isDark, setThemeMode } = useAppTheme();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [title, setTitle] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const userProfile = getImageUrl(userInfo?.profile);
  const otherUserProfile = profile ? getImageUrl(profile) : "";
  const insets = useSafeAreaInsets();
  const isInitialLoadRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [, setHasMoreState] = useState(true);
  const dispatch = useAppDispatch();
  const paginationRef = useRef({ skip: 0, take: PAGE_SIZE });

  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const scrollToBottom = (animated = true) => {
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

      const postData = {
        senderId: reciveUserId,
        receiveId: userIdLogin,
      };
      const resRead = await markAsRead(postData);
      logger.info("resRead resRead", resRead);
      dispatch(markSenderAsRead(String(reciveUserId)));
    } catch (err) {
      logger.error("Error triggering markAsRead:", err);
    }
  }, [userIdLogin, reciveUserId, dispatch]);

  const sendMessage = (override?: string) => {
    const trimmed = (override ?? title).trim();
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
    setMessages((prev) => [optimisticMessage, ...prev]);

    if (override === undefined) setTitle("");
    setShowStickers(false);
    scrollToBottom();
  };

  const handleEmojiSelect = (item: any) => {
    const value =
      typeof item === "string"
        ? item
        : item?.emoji ?? item?.native ?? item?.url ?? item?.uri ?? "";
    if (value) setTitle((prev) => prev + value);
  };

  const handleMessageSentAck = useCallback((data: any) => {
    if (!data?.tempId) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.tempId === data.tempId
          ? {
              ...msg,
              id: data.id,
              createdAt: data.createdAt || msg.createdAt,
              time: data.createdAt ? formatTime(data.createdAt) : msg.time,
            }
          : msg,
      ),
    );
  }, []);

  const handleReciveMessage = useCallback(
    (data: any) => {
      const sender = String(data.senderId ?? data.sender);
      const receiver = String(data.receiveId ?? data.recieveId);
      const currentLogin = String(userIdLogin);
      const currentOther = String(reciveUserId);

      const shouldShow =
        (sender === currentLogin && receiver === currentOther) ||
        (receiver === currentLogin && sender === currentOther);

      if (!shouldShow) return;
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
      console.log("getMessages called", {
        userIdLogin,
        reciveUserId,
        isLoadMore,
      });
      if (!userIdLogin || !reciveUserId) {
        console.log("getMessages bailed early");
        return;
      }
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
                ? rawContent.text ?? ""
                : rawContent ?? m.title ?? "";
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

  // useEffect(() => {
  //   if (!userIdLogin || !reciveUserId) return;
  //   paginationRef.current = { skip: 0, take: PAGE_SIZE };
  //   isInitialLoadRef.current = true;
  //   isLoadingMoreRef.current = false;
  //   hasMoreRef.current = true;

  //   setMessages([]);
  //   setIsLoadingMore(false);

  //   getMessages(false).finally(() => {
  //     setTimeout(() => {
  //       isInitialLoadRef.current = false;
  //     }, 500);
  //   });
  //   triggerMarkAsRead();

  //   socketClient?.on("receive_message", handleReciveMessage);
  //   socketClient?.on("messages_read", handleMessagesReadEvent);
  //   socketClient?.on("message_sent_ack", handleMessageSentAck);

  //   return () => {
  //     socketClient?.off("receive_message", handleReciveMessage);
  //     socketClient?.off("messages_read", handleMessagesReadEvent);
  //     socketClient?.off("message_sent_ack", handleMessageSentAck);
  //     triggerMarkAsRead();
  //   };
  // }, [
  //   userIdLogin,
  //   reciveUserId,
  //   getMessages,
  //   handleReciveMessage,
  //   handleMessagesReadEvent,
  //   handleMessageSentAck,
  //   triggerMarkAsRead,
  // ]);

  useEffect(() => {
    console.log("chat mount", { userIdLogin, reciveUserId });
    if (!userIdLogin || !reciveUserId) return;
    paginationRef.current = { skip: 0, take: PAGE_SIZE };
    isInitialLoadRef.current = true;
    isLoadingMoreRef.current = false;
    hasMoreRef.current = true;

    setMessages([]);
    setIsLoadingMore(false);

    socketClient?.emit("join_chat", {
      userId: userIdLogin,
      peerId: reciveUserId,
    });

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
      socketClient?.emit("leave_chat", userIdLogin);
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
    const emojiOnly = isEmojiOnly(item.content);
    const messageAvatar = isOwn
      ? userProfile
      : item.userProfile
      ? getImageUrl(item.userProfile)
      : profile;

    const otherUserInfo = {
      userProfile: item.userProfile ? getImageUrl(item.userProfile) : profile,
      user: userName,
      score: userScore,
      email: "",
      location: "",
      bio: "",
    };

    return (
      <XStack
        justifyContent={isOwn ? "flex-end" : "flex-start"}
        alignItems="flex-end"
        px="$3"
        py="$2"
        width="100%"
      >
        {!isOwn && (
          <ImageRank
            userInfo={otherUserInfo}
            imgSrc={messageAvatar}
            imgSize={35}
          />
        )}

        <YStack
          maxWidth="75%"
          bg={emojiOnly ? "transparent" : isOwn ? "white" : "$grey100"}
          borderRadius="$4"
          px="$3"
          py="$2"
          mx="$2"
          shadowColor="black"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={emojiOnly ? 0 : 0.05}
          shadowRadius={3}
          elevation={emojiOnly ? 0 : 1.5}
        >
          <SmartText
            style={{
              writingDirection: "rtl",
              textAlign: "right",
              ...(emojiOnly ? { fontSize: 32, lineHeight: 40 } : null),
            }}
          >
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

  const EMOJI_ONLY_REGEX =
    /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200d|\ufe0f|\p{Emoji_Modifier}|\s)+$/u;

  const isEmojiOnly = (text: string) => {
    const t = text?.trim();
    return !!t && EMOJI_ONLY_REGEX.test(t);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff" }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
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
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              ref={flatListRef}
              data={messages}
              inverted
              keyExtractor={(item, index) => {
                if (item.id != null) return `msg-${item.id}`;
                if (item.tempId != null) return `temp-${item.tempId}`;
                return `idx-${index}`;
              }}
              renderItem={renderMessage}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              onScroll={({ nativeEvent }) => {
                const { contentOffset, contentSize, layoutMeasurement } =
                  nativeEvent;
                const paddingToEnd = 60;
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
                ) : (
                  <YStack height={30} />
                )
              }
              contentContainerStyle={{
                paddingVertical: 10,
                paddingBottom: 30,
              }}
            />
          )}
          {!isInitialLoading && (
            <YStack pb={keyboardVisible ? 0 : insets.bottom}>
              <MessageInput
                title={title}
                setTitle={setTitle}
                handleSendMessage={() => sendMessage()}
                onEmojiSelect={handleEmojiSelect}
                showStickers={showStickers}
                setShowStickers={setShowStickers}
                onAttachClick={() => console.log("Attach clicked")}
              />
            </YStack>
          )}
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
