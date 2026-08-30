import React, { useState } from "react";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Text, XStack, YStack } from "tamagui";
import { sendUserNotif } from "../services/notificationService";
import { useAppSelector } from "../store/reduxHookType";
import { logger } from "../utils/logger";
import { Icon } from "./Icon";
import ImageRank from "./ImageRank";

const Notification = () => {
  const [notifications, setNotifications] = useState([1, 2, 3, 4]);
  const [expoToken, setExpoToken] = useState<string | null>(null);
  const main = useAppSelector((state) => state?.main);
  const userId = main?.userLogin?.user?.id;

  const handleSendTestNotification = async () => {
    if (!userId) return;
    try {
      await sendUserNotif({
        userId: userId,
        message: "Hello! This is a manual test notification.",
      });
      logger.info("✅ Test notification trigger sent to server");
    } catch (error) {
      logger.error("Error sending test notification", error);
    }
  };

  const handleDelete = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const renderRightActions = () => (
    <YStack width={80} bg="#ef4444" ai="center" jc="center">
      <Icon name="delete" color="white" size={24} />
    </YStack>
  );

  return (
    <YStack f={1} bg="$background">
      <YStack p="$4" gap="$2" bg="$gray3" onPress={handleSendTestNotification}>
        <Text textAlign="center" fontWeight="bold">
          Auto Test Status (Tap to send test)
        </Text>
        {expoToken ? (
          <Text fontSize="$2" color="$green9" textAlign="center">
            Token Ready: {expoToken.substring(0, 20)}...
          </Text>
        ) : (
          <Text fontSize="$2" color="$red9" textAlign="center">
            Fetching token...
          </Text>
        )}
      </YStack>
      <YStack mt="$2">
        {notifications.map((item, index) => (
          <ReanimatedSwipeable
            key={item}
            renderRightActions={renderRightActions}
            onSwipeableOpen={() => handleDelete(index)}
          >
            <XStack p="$2" b="$1" ai="center" bg="$red">
              <ImageRank imgSize={60} userName="Jhan so" />
              <YStack f={1} ai="center">
                <Text fontSize="$2" color="$textSecondary">
                  2 minutes ago
                </Text>
              </YStack>
              <Text
                color="$errorMain"
                fontWeight="700"
                fontSize="$4"
                width={60}
                textAlign="center"
              >
                Loss
              </Text>
            </XStack>
          </ReanimatedSwipeable>
        ))}
      </YStack>
    </YStack>
  );
};

export default Notification;
