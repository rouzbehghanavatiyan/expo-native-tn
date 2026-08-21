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
  sender: string; // تغییر به string
  recipient?: string; // تغییر به string
  recieveId?: string; // تغییر به string
  userNameSender?: string;
  score?: number;
  [key: string]: any;
}

const ChatRoom: React.FC = () => {
  const router = useRouter();
  const main = useAppSelector((state) => state?.main);
  const userIdLogin = main?.userLogin?.user?.id; // اکنون به صورت string (GUID) است

  const [isLoading, setIsLoading] = useState(false);
  const [userSender, setUserSender] = useState<MessageData[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>(
    {},
  ); // تغییر کلیدها به string

  const handleRedirect = async (data: MessageData) => {
    await AsyncStorage.setItem(`message_read_${data.sender}`, "true");

    setUnreadMessages((prev) => ({
      ...prev,
      [data.sender]: false,
    }));
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: data.sender, // دیگر نیازی به String() نیست چون sender خودش string است
        userName: data.userNameSender ?? "",
        profile: getImageUrl(data) ?? "",
        score: String(data.score ?? 0),
      },
    });
  };

  const handleMessagesReadConfirmation = useCallback(
    (data: { sender: string }) => {
      // تغییر تایپ sender به string
      setUnreadMessages((prev) => ({
        ...prev,
        [data.sender]: false,
      }));
    },
    [],
  );

  const handleGetUserMessages = async () => {
    try {
      setIsLoading(true);
      const res = await allUserMessagese(userIdLogin);
      setIsLoading(false);
      logger.info("userSenderuserSenderuserSender", res?.data);
      const { data, status } = res?.data;
      if (status === 0) {
        setUserSender(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReceiveMessage = useCallback(
    async (data: MessageData) => {
      if (
        String(userIdLogin) === String(data?.recieveId) ||
        String(userIdLogin) === String(data?.receiveId)
      ) {
        const senderStr = String(data.sender);
        await AsyncStorage.setItem(`message_read_${senderStr}`, "false");

        // به جای استفاده از استیت جداگانه، مستقیماً unreadCount کاربر را در لیست آپدیت کنید
        // فرض می‌کنیم استیت لیست کاربران شما setUserSender یا setUsers است
        setUserSender((prevUsers) => {
          // اگر لیست کاربران وجود ندارد، کاری نکن
          if (!prevUsers) return prevUsers;

          return prevUsers.map((user) => {
            if (String(user.sender) === senderStr) {
              // اگر این همان کاربری است که پیام داده، تعداد نخوانده‌ها را افزایش بده
              return {
                ...user,
                unreadCount: (user.unreadCount || 0) + 1,
              };
            }
            return user;
          });
        });

        // (اختیاری) اگر هنوز به unreadMessages نیاز دارید آن را هم آپدیت کنید
        setUnreadMessages((prev) => ({
          ...prev,
          [senderStr]: true,
        }));
      }
    },
    [userIdLogin],
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
  }, [socketClient, handleReceiveMessage, handleMessagesReadConfirmation]);

  useEffect(() => {
    handleGetUserMessages();
  }, []);

  useEffect(() => {
    const loadStoredReadStatus = async () => {
      const storedReadStatus: Record<string, boolean> = {}; // تغییر کلید به string

      for (const user of userSender) {
        const value = await AsyncStorage.getItem(`message_read_${user.sender}`);
        const isUnread = value !== "true";

        storedReadStatus[user.sender] = isUnread;
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
            const uniqueKey = `${user?.id}-${user?.sender}`;
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

                  {/* نمایش تعداد پیام‌های نخوانده دریافت شده از بک‌اند */}
                  {user?.unreadCount > 0 ||
                  unreadMessages[String(user.sender)] ? (
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
                        {user.unreadCount > 0 ? user.unreadCount : "!"}
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
