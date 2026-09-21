import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Icon } from "@/src/components/Icon";
import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import { getThemeColor } from "@/src/hook/getThemeColor";
import { addProfile } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, TextArea, useTheme, XStack, YStack } from "tamagui";

export default function EditProfile() {
  const theme = useTheme();
  const router = useRouter();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);

  // Theme Colors
  const inputBorderColor = getThemeColor(theme.borderColor, "#E0E0E0");
  const inputBgLabel = getThemeColor(theme.background, "#f4f4f4");
  const successColor = getThemeColor(theme.successMain, "#2e7d32");
  const errorColor = getThemeColor(theme.errorMain, "#d32f2f");

  // Profile Form States
  const [bio, setBio] = useState(userLogin?.bio || "");
  const [location, setLocation] = useState(userLogin?.location || "");
  const [mail, setMail] = useState(userLogin?.mail || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailUpdating, setIsEmailUpdating] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleEmailChangeRequest = async () => {
    if (!mail || mail.trim() === "") {
      showFeedback("Error", "Please enter a valid email address.", false);
      return;
    }

    try {
      setIsEmailUpdating(true);
      showFeedback(
        "Verification Sent",
        `A confirmation link has been sent to ${mail}. Please check your inbox.`,
        true,
      );
    } catch (error) {
      showFeedback(
        "Error",
        "Failed to send email verification request.",
        false,
      );
    } finally {
      setIsEmailUpdating(false);
    }
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
    if (isSuccess) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <YStack flex={1} bg="$background">
        <MainTitle handleBack={() => router.back()} title="Edit Profile" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <YStack ai="center" jc="center" my="$4" gap="$2">
              <Pressable onPress={pickImage}>
                <YStack
                  p="$1.5"
                  bg="$backgroundPaper"
                  borderRadius="$round"
                  elevation={3}
                  borderWidth={1}
                  borderColor="$borderColor"
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
              <YStack flex={1} p="$4" gap="$4" bg="$background">
                <YStack gap="$1">
                  <XStack ai="center" gap="$2">
                    <YStack flex={1}>
                      <BaseInput
                        placeholder="Email"
                        label="Change Password"
                        value={mail}
                        onChangeText={setMail}
                        borderColor={inputBorderColor}
                        baseColorLabel={inputBgLabel}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </YStack>
                    <Pressable
                      onPress={handleEmailChangeRequest}
                      disabled={isEmailUpdating}
                    >
                      {isEmailUpdating ? (
                        <Spinner size="small" color="$primaryMain" />
                      ) : (
                        <XStack ai="center" jc="center" gap="$1.5">
                          <Icon name="check" size={22} color={successColor} />
                          <Text
                            marginStart={3}
                            fontSize="$3"
                            fontWeight="500"
                            color="$successMain"
                          >
                            Send Email
                          </Text>
                        </XStack>
                      )}
                    </Pressable>
                  </XStack>
                </YStack>

                <YStack gap="$1">
                  <XStack ai="center" gap="$2">
                    <YStack flex={1}>
                      <BaseInput
                        label="Change Email"
                        placeholder="New Email"
                        value={mail}
                        onChangeText={setMail}
                        borderColor={inputBorderColor}
                        baseColorLabel={inputBgLabel}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </YStack>
                    <Pressable
                      onPress={handleEmailChangeRequest}
                      disabled={isEmailUpdating}
                    >
                      {isEmailUpdating ? (
                        <Spinner size="small" color="$primaryMain" />
                      ) : (
                        <XStack ai="center" jc="center" gap="$1.5">
                          <Icon name="check" size={22} color={successColor} />
                          <Text
                            marginStart={3}
                            fontSize="$3"
                            fontWeight="500"
                            color="$successMain"
                          >
                            Send Email
                          </Text>
                        </XStack>
                      )}
                    </Pressable>
                  </XStack>
                </YStack>

                <YStack gap="$2">
                  <BaseInput
                    label="Social Link"
                    value={mail}
                    onChangeText={setMail}
                    baseColorLabel={inputBgLabel}
                    borderColor={inputBorderColor}
                    keyboardType="email-address"
                  />
                </YStack>

                <YStack gap="$2">
                  <BaseInput
                    baseColorLabel={inputBgLabel}
                    label="Location"
                    borderColor={inputBorderColor}
                    value={location}
                    onChangeText={setLocation}
                  />
                </YStack>

                <YStack gap="$2">
                  <Text color="$color">Status</Text>
                  <TextArea
                    placeholderTextColor="$colorMuted"
                    value={bio}
                    onChangeText={setBio}
                    bg="$backgroundPaper"
                    color="$color"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$3"
                    numberOfLines={4}
                    h={100}
                    textAlignVertical="top"
                    p="$3"
                  />
                </YStack>

                <XStack gap="$3" mt="$6" mb="$2">
                  <BaseButton
                    flex={1}
                    appearance="outline"
                    colorType="neutral"
                    onPress={() => router.back()}
                  >
                    Cancel
                  </BaseButton>

                  <BaseButton
                    bg="$backgroundPaper"
                    flex={1}
                    appearance="solid"
                    colorType="primary"
                    loading={isSubmitting}
                    onPress={handleSubmit}
                  >
                    Save Changes
                  </BaseButton>
                </XStack>
              </YStack>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Feedback Modal */}
        <Modal
          visible={feedbackOpen}
          transparent
          animationType="fade"
          onRequestClose={handleFeedbackClose}
        >
          <YStack
            flex={1}
            bg="rgba(0,0,0,0.5)"
            jc="center"
            ai="center"
            px="$5"
            onPress={handleFeedbackClose}
          >
            <YStack
              width="100%"
              maxWidth={320}
              onPress={(e) => e.stopPropagation()}
            >
              <YStack
                bg="$backgroundPaper"
                borderRadius="$4"
                p="$5"
                gap="$3"
                ai="center"
                elevation={6}
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Icon
                  name={isSuccess ? "check-circle" : "error-outline"}
                  size={40}
                  color={isSuccess ? successColor : errorColor}
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
                  appearance="solid"
                  colorType={isSuccess ? "primary" : "error"}
                  fullWidth
                  mt="$2"
                  onPress={handleFeedbackClose}
                >
                  OK
                </BaseButton>
              </YStack>
            </YStack>
          </YStack>
        </Modal>
      </YStack>
    </SafeAreaView>
  );
}
