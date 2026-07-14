import { AlertTriangle } from "@tamagui/lucide-icons";
import React from "react";
import { Adapt, Button, Dialog, Sheet, Text, XStack, YStack } from "tamagui";

interface MessageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  icon?: React.ReactNode;
  onAccept: () => void;
  acceptText?: string;
}

export const MessageModal = ({
  isOpen,
  onOpenChange,
  title = "Alert",
  message,
  icon = <AlertTriangle size={32} color="#F79009" />,
  onAccept,
  acceptText = "Accept",
}: MessageModalProps) => {
  return (
    <Dialog modal open={isOpen} onOpenChange={onOpenChange}>
      <Adapt platform="touch">
        <Sheet zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animatedBy="default"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Sheet.Handle />
        </Sheet>
      </Adapt>

      <Dialog.Portal zIndex={200000}>
        <Dialog.Overlay
          key="overlay"
          animatedBy="default"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animatedBy="default"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          width="90%"
          maxWidth={400}
        >
          <YStack alignItems="center" gap="$3">
            {icon}
            <Text fontSize="$6" fontWeight="bold">
              {title}
            </Text>
            <Text textAlign="center" color="$gray11">
              {message}
            </Text>
          </YStack>

          <XStack gap="$3" justifyContent="center" mt="$3">
            <Button
              size="$3"
              theme={"light"}
              width="100%"
              onPress={() => {
                if (onAccept) onAccept();
                onOpenChange(false);
              }}
            >
              {acceptText}
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
