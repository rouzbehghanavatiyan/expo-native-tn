import React from "react";
import { Modal, Pressable } from "react-native";
import { YStack, XStack, Text, Button } from "tamagui";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { setShowTimeout } from "../slices/video";
import BaseButton from "../components/BaseButtom";

export const MatchTimeoutModal = () => {
  const dispatch = useAppDispatch();
  const showTimeout = useAppSelector((state) => state.video.showTimeout);

  return (
    <Modal
      visible={showTimeout}
      transparent
      animationType="fade"
      onRequestClose={() => dispatch(setShowTimeout(false))}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
        onPress={() => dispatch(setShowTimeout(false))}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ width: "100%", maxWidth: 360 }}
        >
          <YStack
            bg="$background"
            borderRadius="$4"
            p="$5"
            gap={14}
            elevation={6}
          >
            <YStack gap={8}>
              <Text fontSize="$5" fontWeight="700" color="$warningMain">
                No Match Found
              </Text>
              <Text fontSize="$3" color="$grey500" lineHeight={20}>
                Your video will be matched with
                other participants upon the{" "}
                <Text textDecorationLine="underline" fontWeight="700" color="black">
                  first
                </Text>{" "}
                incoming request from available contenders.
              </Text>
            </YStack>

            <XStack justifyContent="flex-end">
              <BaseButton
                flex={1}
                bg="$warningMain"
                onPress={() => dispatch(setShowTimeout(false))}
              >
                Ok
              </BaseButton>
            </XStack>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
