import BaseButton from "@/src/components/BaseButtom";
import { Icon } from "@/src/components/Icon";
import MainTitle from "@/src/components/MainTitle";
import { addProfile } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { logger } from "@/src/utils/logger";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input, Spinner, Text, TextArea, XStack, YStack } from "tamagui";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || "http://192.168.160.157:4005";

export default function EditProfile() {
  const router = useRouter();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const [bio, setBio] = useState(userLogin?.bio || "");
  const [location, setLocation] = useState(userLogin?.location || "");
  const [mail, setMail] = useState(userLogin?.mail || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async () => {
    // if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    //   showFeedback(
    //     "Validation Error",
    //     "Please enter a valid email address.",
    //     false,
    //   );
    //   return;
    // }
    const postData = {
      userId: userLogin?.user?.id,
      Bio: bio || null,
      Location: location || null,
      Mail: mail || null,
    };
    try {
      setIsSubmitting(true);

      const res = await addProfile(postData);
      logger.info("resProfile", res);
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

      {isLoading ? (
        <YStack flex={1} jc="center" ai="center" bg="$background">
          <Spinner size="large" color="$primaryMain" />
        </YStack>
      ) : (
        <YStack flex={1} p="$4" gap="$4" bg="$background">
          <YStack gap="$2">
            <XStack alignItems="center" gap="$1.5">
              <Icon name="mail-outline" size={16} color="#777777" />
              <Text fontSize="$3" fontWeight="bold" color="$textSecondary">
                Email Address
              </Text>
            </XStack>
            <Input
              placeholder="e.g. rouzbeh@example.com"
              value={mail}
              onChangeText={setMail}
              bg="$backgroundHover"
              borderColor="#E0E0E0" // <-- خاکستری بسیار ملایم
              borderWidth={1} // <-- اطمینان از ظرافت خط
              keyboardType="email-address"
              autoCapitalize="none"
              borderRadius="$3"
              h={45}
            />
          </YStack>

          <YStack gap="$2">
            <XStack alignItems="center" gap="$1.5">
              <Icon name="location-on" size={16} color="#777777" />
              <Text fontSize="$3" fontWeight="bold" color="$textSecondary">
                Location
              </Text>
            </XStack>
            <Input
              placeholder="e.g. Tehran, Iran"
              value={location}
              onChangeText={setLocation}
              bg="$backgroundHover"
              borderColor="#E0E0E0" // <-- اعمال تغییر
              borderWidth={1} // <-- اعمال تغییر
              borderRadius="$3"
              h={45}
            />
          </YStack>

          <YStack gap="$2">
            <XStack alignItems="center" gap="$1.5">
              <Icon name="chat-bubble-outline" size={16} color="#777777" />
              <Text fontSize="$3" fontWeight="bold" color="$textSecondary">
                Bio
              </Text>
            </XStack>
            <TextArea
              placeholder="Tell others about yourself..."
              value={bio}
              onChangeText={setBio}
              bg="$backgroundHover"
              borderColor="#E0E0E0" // <-- اعمال تغییر
              borderWidth={1} // <-- اعمال تغییر
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
              onPress={() => router.back()}
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
