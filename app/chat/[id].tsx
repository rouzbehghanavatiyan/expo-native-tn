import AppLoading from "@/src/components/AppLoading";
import ImageRank from "@/src/components/ImageRank";
import MessageInput from "@/src/components/MessageInput";
import { userMessages } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl, mergeUniqueMessages } from "@/src/utils/fileHelper";
import { socketClient } from "@/src/utils/socketClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import ChatHeader from "./ChatHeader";

interface MessageType {
  id?: number;
  tempId: any;
  userProfile: string;
  sender: number;
  recieveId: number;
  title: string;
  time: string;
  userNameSender?: string;
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
  const reciveUserId = Number(id);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [title, setTitle] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const userProfile = getImageUrl(userInfo?.profile);
  const isInitialLoadRef = useRef(true);
  const isLoadingMoreRef = useRef(false); // اضافه کن
  const lastLoadMoreTimeRef = useRef(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const initialScrollDoneRef = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const paginationRef = useRef({ skip: 0, take: 10 });
  const firstItemIdRef = useRef<string | null>(null);

  const scrollToBottom = (animated = true) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated });
      }, 100);
    });
  };

  const handleSendMessage = async () => {
    if (!title.trim()) return;

    const timeString = new Date().toTimeString().slice(0, 5);

    const message: MessageType = {
      tempId: Date.now().toString(),
      sender: userIdLogin,
      recieveId: reciveUserId,
      title: title.trim(),
      time: timeString,
      userProfile: "",
    };

    socketClient?.emit("send_message", message);
    setMessages((prev) => mergeUniqueMessages([...prev, message]));
    setTitle("");
    setShowStickers(false);
    scrollToBottom();
  };

  const handleReciveMessage = useCallback(
    (data: MessageType) => {
      const shouldShow =
        (data.sender === userIdLogin && data.recieveId === reciveUserId) ||
        (data.recieveId === userIdLogin && data.sender === reciveUserId);

      if (!shouldShow) return;
      if (data.sender === userIdLogin) return;

      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            (data.id != null && msg.id === data.id) ||
            (data.tempId && msg.tempId === data.tempId),
        );

        if (exists) return prev;
        return [...prev, data];
      });

      scrollToBottom();
    },
    [userIdLogin, reciveUserId],
  );

  const getMessages = async (isLoadMore = false) => {
    if (!userIdLogin || !reciveUserId) return;
    if (isLoadMore && (!hasMore || isLoadingMoreRef.current)) return;

    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
        isLoadingMoreRef.current = true;
      } else {
        setIsInitialLoading(true);
      }

      const res = await userMessages(
        userIdLogin,
        reciveUserId,
        paginationRef.current.skip,
        paginationRef.current.take,
      );

      const fetchedMessages: MessageType[] = res?.data?.messages || [];
      const fetchedHasMore: boolean = res?.data?.hasMore ?? false;

      setHasMore(fetchedHasMore);

      if (isLoadMore) {
        setMessages((prev) => {
          firstItemIdRef.current = prev[0]?.id ? String(prev[0].id) : null;
          return mergeUniqueMessages([...fetchedMessages, ...prev]);
        });
      } else {
        setMessages(mergeUniqueMessages(fetchedMessages));
        scrollToBottom(false);
      }

      paginationRef.current.skip += fetchedMessages.length;
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
  };

  useEffect(() => {
    if (!userIdLogin || !reciveUserId) return;

    paginationRef.current = { skip: 0, take: 10 };
    isInitialLoadRef.current = true;
    isLoadingMoreRef.current = false;
    initialScrollDoneRef.current = false;
    firstItemIdRef.current = null;
    lastLoadMoreTimeRef.current = 0;

    setMessages([]);
    setHasMore(true);
    setIsLoadingMore(false);

    getMessages(false).finally(() => {
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 700);
    });

    socketClient?.on("receive_message", handleReciveMessage);

    return () => {
      socketClient?.off("receive_message", handleReciveMessage);

      AsyncStorage.setItem(`message_read_${reciveUserId}`, "true");

      socketClient?.emit("mark_messages_as_read", {
        sender: reciveUserId,
        receiver: userIdLogin,
      });
    };
  }, [userIdLogin, reciveUserId, handleReciveMessage]);

  useEffect(() => {
    if (firstItemIdRef.current !== null && messages.length > 0) {
      const index = messages.findIndex(
        (m, i) => String(m.id ?? i) === firstItemIdRef.current,
      );
      if (index > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: false,
          });
        }, 50);
      }
      firstItemIdRef.current = null;
    }
  }, [messages]);

  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    // fallback اگر scrollToIndex فیل شد
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: Math.min(info.index, info.highestMeasuredFrameIndex),
        animated: false,
      });
    }, 100);
  };
  const otherUserProfile = profile || "";

  const renderMessage = ({ item }: { item: MessageType }) => {
    const isOwn = item.sender === userIdLogin;

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
      >
        {!isOwn && <ImageRank imgSrc={messageAvatar} imgSize={35} />}

        <YStack
          maxWidth="70%"
          bg={isOwn ? "white" : "$grey100"}
          borderRadius="$4"
          px="$3"
          py="$2"
          mx="$2"
        >
          <Text>{item.title}</Text>

          <Text fontSize={8} color="$grey400">
            {item?.time?.slice(0, 5)}
          </Text>
        </YStack>

        {isOwn && <ImageRank imgSrc={messageAvatar} imgSize={35} />}
      </XStack>
    );
  };

  const handleLoadMore = useCallback(() => {
    if (isInitialLoadRef.current) return;
    if (isLoadingMoreRef.current) return;
    if (!hasMore) return;

    const now = Date.now();

    if (now - lastLoadMoreTimeRef.current < 1000) return;

    lastLoadMoreTimeRef.current = now;

    console.log("Loading older messages...");

    getMessages(true);
  }, [hasMore, userIdLogin, reciveUserId]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
                keyExtractor={(item, index) => {
                  if (item.id != null) return `msg-${item.id}`;
                  if (item.tempId != null) return `temp-${item.tempId}`;
                  return `idx-${index}`;
                }}
                renderItem={renderMessage}
                onScroll={(event) => {
                  const offsetY = event.nativeEvent.contentOffset.y;

                  if (offsetY <= 80) {
                    handleLoadMore();
                  }
                }}
                scrollEventThrottle={16}
                ListHeaderComponent={
                  isLoadingMore ? (
                    <XStack justifyContent="center">
                      <AppLoading />
                    </XStack>
                  ) : null
                }
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "flex-end",
                  paddingVertical: 10,
                }}
                onScrollToIndexFailed={handleScrollToIndexFailed}
                onContentSizeChange={() => {
                  if (!initialScrollDoneRef.current && messages.length > 0) {
                    initialScrollDoneRef.current = true;
                    scrollToBottom(false);
                  }
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
    </>
  );
}
