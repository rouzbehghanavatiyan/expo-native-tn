import { Icon } from "@/src/components/Icon";
import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import { allUserMessagese } from "@/src/services/nestServices";
import { markSenderAsRead, setChatUsers } from "@/src/slices/chat";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
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
  isReadChat?: boolean;
  [key: string]: any;
}

const ChatRoom: React.FC = () => {
  const router = useRouter();
  const main = useAppSelector((state) => state?.main);
  const userSender = useAppSelector((state) => state.chat.users);
  const chatListLoaded = useAppSelector((state) => state.chat.loaded);
  const userIdLogin = main?.userLogin?.user?.id;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetUserMessages = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        if (!userIdLogin) return;
        const res = await allUserMessagese(userIdLogin);
        const { data, status } = res?.data || {};
        if (status === 0 && data) {
          dispatch(setChatUsers(data));
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [userIdLogin, dispatch],
  );

  // 🟢 فقط یک بار، وقتی که هیچوقت لود نشده (کش خالیه)
  useEffect(() => {
    if (!chatListLoaded) {
      handleGetUserMessages(true);
    }
  }, [handleGetUserMessages, chatListLoaded]);

  const handleRedirect = (data: MessageData) => {
    const senderStr = String(data.sender);

    // 🟢 آپدیت خوش‌بینانه (optimistic) بلافاصله در Redux، تا badge سریع محو بشه
    // (آپدیت قطعی و واقعی توسط triggerMarkAsRead در PrivateChat انجام میشه)
    dispatch(markSenderAsRead(senderStr));

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
              user?.isReadChat === false;

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
                      minWidth={10}
                      height={10}
                      borderRadius={10}
                      bg="#FF3040"
                      alignItems="center"
                      justifyContent="center"
                      px="$1"
                    />
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
