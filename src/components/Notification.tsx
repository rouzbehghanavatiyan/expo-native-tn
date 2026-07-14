import { Trash2 } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Text, XStack, YStack } from "tamagui";
import ImageRank from "./ImageRank";

const Notification = () => {
  const [notifications, setNotifications] = useState([1, 2, 3, 4]);

  const handleDelete = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const renderRightActions = () => (
    <YStack width={80} bg="#ef4444" ai="center" jc="center">
      <Trash2 color="white" size={24} />
    </YStack>
  );

  return (
    <YStack>
      {notifications.map((item, index) => (
        <ReanimatedSwipeable
          key={item}
          renderRightActions={renderRightActions}
          onSwipeableOpen={() => handleDelete(index)}
        >
          <XStack p="$2" b="$1" ai="center" bg="$white">
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
  );
};

export default Notification;
