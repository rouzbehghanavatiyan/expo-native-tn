import BaseButton from "@/src/components/BaseButtom";
import { Icon } from "@/src/components/Icon";
import { getStatus } from "@/src/services/masterServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Input,
  Spinner,
  Text,
  TextArea,
  View,
  XStack,
  YStack,
} from "tamagui";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || "http://192.168.160.157:4005";

export default function EditProfile() {
  const router = useRouter();

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [mail, setMail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const showFeedback = (title: string, message: string, success: boolean) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setIsSuccess(success);
    setFeedbackOpen(true);
  };

  const fetchCurrentStatus = async () => {
    try {
      setIsLoading(true);
      const response = await getStatus();
      const { code, message, data } = response?.data;

      if (code === 0) {
        setBio(data.bio || "");
        setLocation(data.location || "");
        setMail(data.mail || "");
      }
    } catch (error) {
      console.log("Error fetching status:", error);
      showFeedback(
        "Error",
        "Could not load profile details. Check connection.",
        false,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // ولیدیشن ساده ایمیل
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      showFeedback(
        "Validation Error",
        "Please enter a valid email address.",
        false,
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio,
          location,
          mail,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showFeedback("Success", "Profile status updated successfully!", true);
      } else {
        showFeedback(
          "Error",
          result.message || "Failed to update profile.",
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
      <XStack
        px="$4"
        py="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Pressable onPress={() => router.back()} hitSlop={15}>
          <Icon name="arrow-back" size={24} color="$textPrimary" />
        </Pressable>
        {/* <MainTitle title="Edit Profile Status" /> */}
        <View w={24} />
      </XStack>

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
              borderColor="$borderColor"
              keyboardType="email-address"
              autoCapitalize="none"
              borderRadius="$3"
              h={45}
            />
          </YStack>

          {/* فیلد لوکیشن */}
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
              borderColor="$borderColor"
              borderRadius="$3"
              h={45}
            />
          </YStack>

          {/* فیلد بیوگرافی */}
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
              borderColor="$borderColor"
              borderRadius="$3"
              numberOfLines={4}
              h={110}
              textAlignVertical="top"
              p="$3"
            />
          </YStack>

          {/* دکمه‌های کنترلی پایینی */}
          <XStack gap="$3" mt="auto" mb="$4">
            <Button
              flex={1}
              borderRadius="$3"
              disabled={isSubmitting}
              onPress={() => router.back()}
              bg="$backgroundHover"
              borderColor="$borderColor"
            >
              Cancel
            </Button>
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

      {/* مودال فیدبک با استفاده از Modal نیتیو و استایل هماهنگ */}
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
