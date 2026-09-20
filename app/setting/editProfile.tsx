import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Icon } from "@/src/components/Icon";
import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import { addProfile } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, TextArea, XStack, YStack } from "tamagui";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || "http://192.168.160.157:4005";

export default function EditProfile() {
  const router = useRouter();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const [bio, setBio] = useState(userLogin?.bio || "");
  const [location, setLocation] = useState(userLogin?.location || "");
  const [mail, setMail] = useState(userLogin?.mail || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  logger.info("userLogin", userLogin);

  useEffect(() => {
    if (userLogin) {
      setBio(userLogin.bio || "");
      setLocation(userLogin.location || "");
      setMail(userLogin.mail || "");
    }
  }, [userLogin]);

  const showFeedback = (title: string, message: string, success: boolean) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setIsSuccess(success);
    setFeedbackOpen(true);
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showFeedback(
        "Permission Denied",
        "Permission to access gallery is required!",
        false,
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const postData = {
      bio: bio || null,
      location: location || null,
      mail: mail || null,
    };

    try {
      setIsSubmitting(true);
      const res = await addProfile(postData);
      logger.info("resProfile", res);

      if (res?.data?.status === 2 || res?.data?.status === 0) {
        showFeedback(
          "Success",
          res?.data?.message || "Profile updated successfully.",
          true,
        );
      } else {
        showFeedback(
          "Error",
          res?.data?.message || "Failed to update profile.",
          false,
        );
      }
    } catch (error) {
      console.log("Error updating status:", error);
      showFeedback(
        "Network Error",
        "Something went wrong. Please try again.",
        false,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
    if (isSuccess) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <MainTitle handleBack={() => router.back()} title="Edit Profile" />

      <YStack ai="center" jc="center" my="$4" gap="$2">
        <Pressable onPress={pickImage}>
          <YStack
            p="$1.5"
            bg="white"
            borderRadius="$round"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.06}
            shadowRadius={10}
            elevation={3}
            borderWidth={1}
            borderColor="#bbbbbb"
          >
            <ImageRank
              onClickDisable={true}
              iconClass="text-gray-200"
              imgSrc={selectedImage || getImageUrl(userLogin?.profile)}
              imgSize={104}
            />
          </YStack>
        </Pressable>

        <Pressable onPress={pickImage}>
          <Text
            color="$primaryMain"
            fontWeight="600"
            fontSize="$3"
            pressStyle={{ opacity: 0.7 }}
          >
            Upload Image
          </Text>
        </Pressable>
      </YStack>

      {isLoading ? (
        <YStack flex={1} jc="center" ai="center" bg="$background">
          <Spinner size="large" color="$primaryMain" />
        </YStack>
      ) : (
        <YStack flex={1} p="$4" gap="$4" bg="$grey100">
          <YStack gap="$2">
            <BaseInput
              label="Social Link"
              value={mail}
              onChangeText={setMail}
              borderColor="#E0E0E0"
              keyboardType="email-address"
            />
          </YStack>

          <YStack gap="$2">
            <BaseInput
              label="Location"
              borderColor="#E0E0E0"
              value={location}
              onChangeText={setLocation}
            />
          </YStack>

          <YStack gap="$2">
            <TextArea
              placeholder="Status..."
              value={bio}
              onChangeText={setBio}
              bg="$grey100"
              borderColor="#E0E0E0"
              borderWidth={1}
              borderRadius="$3"
              numberOfLines={4}
              h={110}
              textAlignVertical="top"
              p="$3"
            />
          </YStack>

          <XStack gap="$3" mt="auto" mb="$4">
            <BaseButton
              flex={1}
              appearance="ghost"
              colorType="primary"
              onPress={() => router.push("/profile")}
            >
              Cancel
            </BaseButton>
            <BaseButton
              disabled={isSubmitting}
              onPress={handleSubmit}
              bg="$primaryMain"
              flex={1}
              borderRadius="$3"
            >
              {isSubmitting ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text color="white" fontWeight="600">
                  Save Changes
                </Text>
              )}
            </BaseButton>
          </XStack>
        </YStack>
      )}

      <Modal
        visible={feedbackOpen}
        transparent
        animationType="fade"
        onRequestClose={handleFeedbackClose}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
          onPress={handleFeedbackClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 320 }}
          >
            <YStack
              bg="$backgroundPaper"
              borderRadius="$4"
              p="$5"
              gap={15}
              alignItems="center"
              elevation={6}
            >
              <Icon
                name={isSuccess ? "check-circle" : "error-outline"}
                size={40}
                color={isSuccess ? "#2e7d32" : "#d32f2f"}
              />
              <Text
                fontSize="$4"
                fontWeight="800"
                color="$textPrimary"
                textAlign="center"
              >
                {feedbackTitle}
              </Text>
              <Text fontSize="$3" color="$textSecondary" textAlign="center">
                {feedbackMessage}
              </Text>

              <BaseButton
                onPress={handleFeedbackClose}
                bg={isSuccess ? "$primaryMain" : "$textPrimary"}
                w="100%"
              >
                <Text color="white" fontWeight="600">
                  OK
                </Text>
              </BaseButton>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
