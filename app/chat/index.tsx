import UserListLayout from "@/src/common/UserListLayout";
import { allUserMessagese } from "@/src/services/nestServices";
import { markSenderAsRead, setChatUsers } from "@/src/slices/chat";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "tamagui";

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
  const userSender = useAppSelector((state) => state.chat.users) || [];
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

  useEffect(() => {
    if (!chatListLoaded) {
      handleGetUserMessages(true);
    }
  }, [handleGetUserMessages, chatListLoaded]);

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

  return (
    <UserListLayout
      title="Messages"
      isLoading={isLoading}
      data={userSender}
      emptyMessage="Empty messages"
      onBack={() => router.back()}
      onItemPress={handleRedirect}
      imgSize={50}
      renderRight={(user: MessageData) => {
        const showBadge =
          (user?.unreadCount && user.unreadCount > 0) ||
          user?.isReadChat === false;
        if (!showBadge) return null;
        return <View width={10} height={10} borderRadius={10} bg="#FF3040" />;
      }}
    />
  );
};

export default ChatRoom;
