    import React from "react";
import { Modal, Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import BaseButton from "./BaseButtom";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  variant?: "success" | "error";
  onClose: () => void;
};

export default function FeedbackModal({
  visible,
  title,
  message,
  variant = "success",
  onClose,
}: Props) {
  const headerColor = variant === "success" ? "$successMain" : "$errorMain";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ width: "100%", maxWidth: 360 }}
        >
          <YStack
            bg="$backgroundPaper"
            borderRadius="$4"
            p="$5"
            gap={12}
            elevation={6}
          >
            <Text fontSize="$4" fontWeight="800" color={headerColor}>
              {title}
            </Text>

            <Text fontSize="$3" color="$textSecondary">
              {message}
            </Text>

            <XStack jc="flex-end" gap={10} mt={6}>
              <BaseButton onPress={onClose} bg="$primaryMain">
                OK
              </BaseButton>
            </XStack>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
