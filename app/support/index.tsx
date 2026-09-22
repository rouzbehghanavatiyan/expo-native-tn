import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Icon } from "@/src/components/Icon";
import MainTitle from "@/src/components/MainTitle";
import { useAppTheme } from "@/src/hook/ThemeContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, TextArea, XStack, YStack } from "tamagui";
// import * as Clipboard from "expo-clipboard";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  detail: string;
  onAction?: () => void;
  actionIcon?: boolean;
}

const SUPPORT_EMAIL = "app.starfaceoff@gmail.com";

export default function SupportScreen() {
  const router = useRouter();
  const { isDark, setThemeMode } = useAppTheme();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback Modal States
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const showFeedback = (title: string, message: string, success: boolean) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setIsSuccess(success);
    setFeedbackOpen(true);
  };

  const handleCopyEmail = () => {
    // Clipboard.setStringAsync(SUPPORT_EMAIL);
    showFeedback("Copied", "Email copied to clipboard!", true);
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      showFeedback("Validation Error", "Please enter a subject.", false);
      return;
    }

    if (!description.trim()) {
      showFeedback("Validation Error", "Please enter your message.", false);
      return;
    }

    try {
      setIsSubmitting(true);

      // در صورت تمایل به ارسال مستقیم ایمیل از طریق کلاینت ایمیل کاربر:
      // const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(description)}`;
      // await Linking.openURL(mailtoUrl);

      // شبیه‌سازی فراخوانی API:
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showFeedback(
        "Message Sent",
        "Thank you! Your message has been sent to our support team.",
        true,
      );
      setSubject("");
      setDescription("");
    } catch (error) {
      console.error("Support submit error:", error);
      showFeedback(
        "Error",
        "Failed to send your message. Please try again later.",
        false,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff" }}
    >
      <MainTitle handleBack={() => router.back()} title="Support & Contact" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack flex={1} p="$4" gap="$4" bg="$grey100">
          {/* Official Email Contact Card */}
          <ContactCard
            icon={<Icon name="mail-outline" color="$primaryMain" size={20} />}
            title="Official Support Email"
            detail={SUPPORT_EMAIL}
            onAction={handleCopyEmail}
            actionIcon={true}
          />

          {/* Form Header */}
          <YStack gap="$1" mt="$2">
            <Text fontSize="$4" fontWeight="700" color="$textPrimary">
              Send us a Message
            </Text>
            <Text fontSize="$2" color="$textSecondary">
              Fill out the form below and we'll get back to you as soon as
              possible.
            </Text>
          </YStack>

          {/* Subject Field */}
          <YStack gap="$2">
            <BaseInput
              label="Subject"
              placeholder="e.g. Account issue, Feedback..."
              value={subject}
              onChangeText={setSubject}
              borderColor="#E0E0E0"
            />
          </YStack>

          <YStack gap="$2">
            <TextArea
              placeholder="Write your message or issue description here..."
              value={description}
              onChangeText={setDescription}
              bg="$backgroundPaper"
              borderColor="#E0E0E0"
              borderWidth={1}
              borderRadius="$3"
              numberOfLines={5}
              h={130}
              textAlignVertical="top"
              p="$3"
            />
          </YStack>

          {/* Action Buttons */}
          <XStack gap="$3" mt="auto" pt="$4" pb="$4">
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
                  Send Message
                </Text>
              )}
            </BaseButton>
          </XStack>
        </YStack>
      </ScrollView>

      {/* Status Feedback Modal */}
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

const ContactCard: React.FC<ContactCardProps> = ({
  icon,
  title,
  detail,
  onAction,
  actionIcon = true,
}) => {
  return (
    <XStack
      bg="$backgroundPaper"
      p="$4"
      borderRadius="$3"
      ai="center"
      jc="space-between"
      borderWidth={1}
      borderColor="#E0E0E0"
    >
      <XStack ai="center" gap="$3" flex={1}>
        <YStack bg="$grey100" p="$2" borderRadius={50}>
          {icon}
        </YStack>
        <YStack flex={1}>
          <Text color="$textSecondary" fontSize="$2">
            {title}
          </Text>
          <Text color="$textPrimary" fontSize="$3" fontWeight="600">
            {detail}
          </Text>
        </YStack>
      </XStack>

      {onAction && actionIcon && (
        <Pressable onPress={onAction} style={{ padding: 6 }}>
          <Icon name="content-copy" color="$textSecondary" size={18} />
        </Pressable>
      )}
    </XStack>
  );
};
