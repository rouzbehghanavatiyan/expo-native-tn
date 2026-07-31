import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import React from "react";
import { Modal, Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import BaseButton from "../components/BaseButtom";
import { setShowDeactivatedModal } from "../slices/video";

export const DeactivatedModal = () => {
  const dispatch = useAppDispatch();
  const showModal = useAppSelector((state) => state.video.showDeactivatedModal);

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => dispatch(setShowDeactivatedModal(false))}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
        onPress={() => dispatch(setShowDeactivatedModal(false))}
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
                Video Deactivated
              </Text>
              <Text fontSize="$3" color="$black" lineHeight={20}>
                Match search disabled
              </Text>
            </YStack>

            <XStack justifyContent="flex-end">
              <BaseButton
                flex={1}
                bg="$warningMain"
                onPress={() => dispatch(setShowDeactivatedModal(false))}
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
