import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Icon } from "@/src/components/Icon";
import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import { getThemeColor } from "@/src/hook/getThemeColor";
import {
  addProfile,
  forgotPassword,
  requestChangeEmail,
} from "@/src/services/masterServices";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Text, TextArea, useTheme, XStack, YStack } from "tamagui";
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const SectionCard = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <YStack
    bg="$backgroundPaper"
    borderRadius="$4"
    borderWidth={1}
    borderColor="$borderColor"
    p="$4"
    gap="$3"
  >
    <XStack ai="center" gap="$2">
      <Icon name={icon as any} size={20} color="#6366f1" />
      <Text fontSize="$4" fontWeight="700" color="$color">
        {title}
      </Text>
    </XStack>
    {subtitle ? (
      <Text fontSize="$2" color="$colorMuted" lineHeight={18}>
        {subtitle}
      </Text>
    ) : null}
    {children}
  </YStack>
);

export default function EditProfile() {
  const theme = useTheme();
  const router = useRouter();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);

  const inputBorderColor = getThemeColor(theme.borderColor, "#E0E0E0");
  const inputBgLabel = getThemeColor(theme.background, "#f4f4f4");
  const successColor = getThemeColor(theme.successMain, "#2e7d32");
  const errorColor = getThemeColor(theme.errorMain, "#d32f2f");
  const insets = useSafeAreaInsets();
  const [bio, setBio] = useState(userLogin?.bio || "");
  const [location, setLocation] = useState(userLogin?.location || "");
  const [mail, setMail] = useState(userLogin?.mail || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [resetEmail, setResetEmail] = useState(
    (userLogin as any)?.email || (userLogin as any)?.mail || "",
  );
  const [newEmail, setNewEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailUpdating, setIsEmailUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [goBackOnClose, setGoBackOnClose] = useState(false);

  useEffect(() => {
    if (userLogin) {
      setBio(userLogin.bio || "");
      setLocation(userLogin.location || "");
      setMail(userLogin.mail || "");
      setResetEmail(
        (prev: string) =>
          prev || (userLogin as any)?.email || (userLogin as any)?.mail || "",
      );
    }
  }, [userLogin]);

  const showFeedback = (
    title: string,
    message: string,
    success: boolean,
    goBack = false,
  ) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setIsSuccess(success);
    setGoBackOnClose(goBack);
    setFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
    if (goBackOnClose) {
      setGoBackOnClose(false);
      router.back();
    }
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

      if (res?.data?.status === 0) {
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
      console.log("Error updating profile:", error);
      showFeedback(
        "Network Error",
        "Something went wrong. Please try again.",
        false,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (isResetting) return;

    const email = resetEmail.trim();
    if (!EMAIL_REGEX.test(email)) {
      showFeedback("Error", "Please enter a valid email address.", false);
      return;
    }

    try {
      setIsResetting(true);
      const res: any = await forgotPassword({ email });

      if (res?.data?.status === 0) {
        showFeedback(
          "Email Sent",
          "If an account matches that email, a password reset link has been sent. Check your inbox.",
          true,
        );
      } else {
        showFeedback(
          "Error",
          res?.data?.message || "Failed to process request. Please try again.",
          false,
        );
      }
    } catch (error: any) {
      console.log("Forgot Password Error:", error);
      showFeedback(
        "Network Error",
        error?.response?.data?.message ||
        "An error occurred. Please try again later.",
        false,
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleEmailChangeRequest = async () => {
    if (isEmailUpdating) return;

    const email = newEmail.trim();
    if (!EMAIL_REGEX.test(email)) {
      showFeedback("Error", "Please enter a valid email address.", false);
      return;
    }

    try {
      setIsEmailUpdating(true);
      const res: any = await requestChangeEmail({ newEmail: email });

      if (res?.data?.status === 0) {
        showFeedback(
          "Verification Sent",
          `A confirmation link has been sent to ${email}. Your email will change after you confirm it.`,
          true,
        );
        setNewEmail("");
      } else {
        showFeedback(
          "Error",
          res?.data?.message || "Failed to send verification email.",
          false,
        );
      }
    } catch (error: any) {
      console.log("Change email error:", error);
      showFeedback(
        "Network Error",
        error?.response?.data?.message ||
        "Something went wrong. Please try again.",
        false,
      );
    } finally {
      setIsEmailUpdating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <YStack flex={1} bg="$background">
        <MainTitle handleBack={() => router.back()} title="Edit Profile" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
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

            <YStack flex={1} px="$4" gap="$4">
              {/* Profile info */}
              <SectionCard icon="person" title="Profile Info">
                <BaseInput
                  label="Social Link"
                  value={mail}
                  onChangeText={setMail}
                  baseColorLabel={inputBgLabel}
                  borderColor={inputBorderColor}
                  autoCapitalize="none"
                />

                <BaseInput
                  baseColorLabel={inputBgLabel}
                  label="Location"
                  borderColor={inputBorderColor}
                  value={location}
                  onChangeText={setLocation}
                />

                <YStack gap="$2">
                  <Text color="$color">Status</Text>
                  <TextArea
                    placeholderTextColor="$colorMuted"
                    value={bio}
                    onChangeText={setBio}
                    bg="$background"
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

                <XStack gap="$3" mt="$2">
                  <BaseButton
                    flex={1}
                    appearance="outline"
                    colorType="neutral"
                    onPress={() => router.back()}
                  >
                    Cancel
                  </BaseButton>
                  <BaseButton
                    bg="$indigoDark"
                    flex={1}
                    appearance="solid"
                    colorType="primary"
                    loading={isSubmitting}
                    onPress={handleSubmit}
                  >
                    Save
                  </BaseButton>
                </XStack>
              </SectionCard>

              {/* Change email */}
              <SectionCard
                icon="mail-outline"
                title="Change Email"
                subtitle="We'll send a confirmation link to your new email. Your current email stays active until you confirm it."
              >
                <BaseInput
                  label="New Email"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  borderColor={inputBorderColor}
                  baseColorLabel={inputBgLabel}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <BaseButton
                  fullWidth
                  appearance="solid"
                  colorType="primary"
                  loading={isEmailUpdating}
                  onPress={handleEmailChangeRequest}
                >
                  Send Confirmation Email
                </BaseButton>
              </SectionCard>

              {/* Change password */}
              <SectionCard
                icon="lock-outline"
                title="Change Password"
                subtitle="Enter your account email and we'll send you a link to set a new password."
              >
                <BaseInput
                  label="Account Email"
                  placeholder="Your Email"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  borderColor={inputBorderColor}
                  baseColorLabel={inputBgLabel}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <BaseButton
                  fullWidth
                  appearance="outline"
                  colorType="primary"
                  loading={isResetting}
                  onPress={handleResetPassword}
                >
                  Send Reset Link
                </BaseButton>
              </SectionCard>
            </YStack>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Feedback modal */}
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