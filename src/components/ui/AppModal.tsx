import { AlertTriangle } from "@tamagui/lucide-icons";
import React from "react";
import { Adapt, Button, Dialog, Sheet, Text, XStack, YStack } from "tamagui";

interface AppModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  icon?: React.ReactNode;
  onAccept: () => void;
  acceptText?: string;
  cancelText?: string;
}

export const AppModal = ({
  isOpen,
  onOpenChange,
  title = "Alert",
  message,
  icon = <AlertTriangle size={32} color="#F79009" />,
  onAccept,
  acceptText = "Accept",
  cancelText = "Cancel",
}: AppModalProps) => {
  return (
    <Dialog modal open={isOpen} onOpenChange={onOpenChange}>
      <Adapt when>
        <Sheet zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal zIndex={200000}>
        <Dialog.Overlay
          key="overlay"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          // @ts-ignore
          animation={[
            "quick",
            {
              opacity: { overshootClamping: true },
            },
          ]}
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
              onPress={() => onOpenChange(false)}
            >
              {cancelText}
            </Button>
            <Button
              size="$3"
              theme={"active" as any}
              onPress={() => {
                onAccept();
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
