import { Icon } from "@/src/components/Icon";
import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import { allUserMessagese } from "@/src/services/nestServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import { socketClient } from "@/src/utils/socketClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, View, XStack, YStack } from "tamagui";

interface MessageData {
  id?: string;
  sender: string;
  recipient?: string;
  recieveId?: string;
  receiveId?: string;
  userNameSender?: string;
  score?: number;
  unreadCount?: number;
  [key: string]: any;
}

const ChatRoom: React.FC = () => {
  const router = useRouter();
  const main = useAppSelector((state) => state?.main);
  const userIdLogin = main?.userLogin?.user?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [userSender, setUserSender] = useState<MessageData[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>(
    {},
  );

  const handleGetUserMessages = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        const res = await allUserMessagese(userIdLogin);

        const { data, status } = res?.data || {};
        if (status === 0 && data) {
          setUserSender(data);

          const storedReadStatus: Record<string, boolean> = {};
          for (const user of data) {
            const value = await AsyncStorage.getItem(
              `message_read_${user.sender}`,
            );
            storedReadStatus[user.sender] = value === "false";
          }
          setUnreadMessages(storedReadStatus);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [userIdLogin],
  );

  const handleRedirect = async (data: MessageData) => {
    const senderStr = String(data.sender);
    await AsyncStorage.setItem(`message_read_${senderStr}`, "true");

    setUnreadMessages((prev) => ({
      ...prev,
      [senderStr]: false,
    }));

    // 🟢 ۲. صفر کردن تعداد پیام نخوانده در خود آرایه برای پاک شدن قطعی Badge
    setUserSender((prevUsers) =>
      prevUsers.map((user) =>
        String(user.sender) === senderStr ? { ...user, unreadCount: 0 } : user,
      ),
    );

    router.push({
      pathname: "/chat/[id]",
      params: {
        id: senderStr,
        userName: data.userNameSender ?? "",
        profile: getImageUrl(data) ?? "",
        score: String(data.score ?? 0),
      },
    });
  };

  const handleMessagesReadConfirmation = useCallback(
    (data: { sender: string }) => {
      const senderStr = String(data.sender);
      setUnreadMessages((prev) => ({
        ...prev,
        [senderStr]: false,
      }));

      // 🟢 ۳. اینجا هم Badge درون آرایه را صفر می‌کنیم
      setUserSender((prevUsers) =>
        prevUsers.map((user) =>
          String(user.sender) === senderStr
            ? { ...user, unreadCount: 0 }
            : user,
        ),
      );
    },
    [],
  );

  const handleReceiveMessage = useCallback(
    async (data: MessageData) => {
      const targetUserId = data?.recieveId ?? data?.receiveId;

      if (String(userIdLogin) === String(targetUserId)) {
        const senderStr = String(data.sender);

        await AsyncStorage.setItem(`message_read_${senderStr}`, "false");

        setUnreadMessages((prev) => ({
          ...prev,
          [senderStr]: true,
        }));

        setUserSender((prevUsers) => {
          if (!prevUsers) return prevUsers;

          const existingUserIndex = prevUsers.findIndex(
            (user) => String(user.sender) === senderStr,
          );

          if (existingUserIndex > -1) {
            // 🟢 ۴. اگر کاربر از قبل در لیست هست، مقدار پیام نخوانده را اضافه کن و او را به ابتدای لیست بیاور
            const updatedUsers = [...prevUsers];
            const updatedUser = { ...updatedUsers[existingUserIndex] };

            updatedUser.unreadCount = (updatedUser.unreadCount || 0) + 1;

            // حذف از مکان فعلی و اضافه کردن به ایندکس صفر (بالای لیست)
            updatedUsers.splice(existingUserIndex, 1);
            updatedUsers.unshift(updatedUser);

            return updatedUsers;
          } else {
            // 🟢 ۵. پیام از شخصی آمده که قبلاً با او چت نداشتیم! لیست را در بک‌گراند آپدیت می‌کنیم تا به صفحه اضافه شود
            handleGetUserMessages(false);
            return prevUsers;
          }
        });
      }
    },
    [userIdLogin, handleGetUserMessages],
  );

  useEffect(() => {
    if (!socketClient) return;

    socketClient.on("receive_message", handleReceiveMessage);
    socketClient.on(
      "messages_read_confirmation",
      handleMessagesReadConfirmation,
    );

    return () => {
      socketClient.off("receive_message", handleReceiveMessage);
      socketClient.off(
        "messages_read_confirmation",
        handleMessagesReadConfirmation,
      );
    };
  }, [handleReceiveMessage, handleMessagesReadConfirmation]);

  useEffect(() => {
    handleGetUserMessages(true);
  }, [handleGetUserMessages]);

  useEffect(() => {
    const loadStoredReadStatus = async () => {
      const storedReadStatus: Record<string, boolean> = {};

      for (const user of userSender) {
        const value = await AsyncStorage.getItem(`message_read_${user.sender}`);
        storedReadStatus[user.sender] = value !== "true";
      }

      setUnreadMessages(storedReadStatus);
    };

    if (userSender.length > 0) {
      loadStoredReadStatus();
    }
  }, [userSender]);

  if (isLoading) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg="$background"
      >
        <Spinner size="large" color="$blue10" />
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <YStack flex={1} bg="$background">
        <MainTitle title="Messages" handleBack={() => router.back()} />
        {userSender.length > 0 ? (
          userSender.map((user) => {
            const fixImage = getImageUrl(user);
            const uniqueKey = String(user.sender);

            const showBadge =
              (user?.unreadCount && user.unreadCount > 0) ||
              unreadMessages[String(user.sender)];

            return (
              <Pressable key={uniqueKey} onPress={() => handleRedirect(user)}>
                <XStack
                  p="$4"
                  bc="$grey100"
                  my={1}
                  ai="center"
                  jc="space-between"
                  bg="$white"
                >
                  <ImageRank
                    userName={user?.userNameSender}
                    imgSize={50}
                    score={user?.score || 0}
                    imgSrc={fixImage || "default-profile-image.png"}
                  />

                  {showBadge ? (
                    <View
                      minWidth={20}
                      height={20}
                      borderRadius={10}
                      bg="#FF3040"
                      alignItems="center"
                      justifyContent="center"
                      px="$1"
                    >
                      <Text color="white" fontSize={12} fontWeight="bold">
                        {user?.unreadCount && user.unreadCount > 0
                          ? user.unreadCount
                          : "!"}
                      </Text>
                    </View>
                  ) : null}
                </XStack>
              </Pressable>
            );
          })
        ) : (
          <YStack
            flex={1}
            bg="white"
            alignItems="center"
            justifyContent="center"
            p="$4"
          >
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$2"
              p="$4"
              borderRadius="$4"
            >
              <Icon name="mail" color="gray" size={26} />
              <Text color="$gray11" fontSize="$5">
                Empty messages
              </Text>
            </XStack>
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
};

export default ChatRoom;
