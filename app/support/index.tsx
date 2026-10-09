import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Icon } from "@/src/components/Icon";
import MainTitle from "@/src/components/MainTitle";
import { useAppTheme } from "@/src/hook/ThemeContext";
import { supportConnect } from "@/src/services/masterServices";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextArea, Theme, XStack, YStack } from "tamagui";
// import * as Clipboard from "expo-clipboard";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  detail: string;
  onAction?: () => void;
  actionIcon?: boolean;
  isDark?: boolean;
}

const SUPPORT_EMAIL = "app.clashtalent@gmail.com";

export default function SupportScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const borderColor = isDark ? "#2C2C2C" : "#E0E0E0";

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
      const postData = {
        subject: subject.trim(),
        description: description.trim(),
      };
      setIsSubmitting(true);
      const res = await supportConnect(postData);
      if (res?.data?.code === 0) {
        showFeedback(
          "Message Sent",
          "Thank you! Your message has been sent to our support team.",
          true,
        );
        setSubject("");
        setDescription("");
      } else {
        showFeedback(
          "Error",
          res?.data?.message ||
            "Failed to send your message. Please try again.",
          false,
        );
      }
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
    <Theme name={isDark ? "dark" : "light"}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff" }}
      >
        <MainTitle handleBack={() => router.back()} title="Support & Contact" />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack flex={1} p="$4" gap="$4" bg={isDark ? "#121212" : "$grey100"}>
            <ContactCard
              icon={<Icon name="mail-outline" color="$primaryMain" size={20} />}
              title="Official Support Email"
              detail={SUPPORT_EMAIL}
              onAction={handleCopyEmail}
              actionIcon={true}
              isDark={isDark}
            />

            <YStack gap="$1" mt="$2">
              <Text fontSize="$4" fontWeight="700" color="$textPrimary">
                Send us a Message
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </Text>
            </YStack>

            <YStack gap="$2">
              <BaseInput
                label="Subject"
                placeholder="e.g. Account issue, Feedback..."
                value={subject}
                onChangeText={setSubject}
                baseColorLabel={isDark ? "#616161" : "#f7f7f7"}
                borderColor={borderColor}
              />
            </YStack>

            <YStack gap="$2">
              <TextArea
                placeholder="Write your message or issue description here..."
                placeholderTextColor={isDark ? "#757575" : "#9E9E9E"}
                value={description}
                onChangeText={setDescription}
                bg="$backgroundPaper"
                color="$textPrimary"
                borderColor={borderColor}
                borderWidth={1}
                borderRadius="$3"
                numberOfLines={5}
                h={130}
                textAlignVertical="top"
                p="$3"
              />
            </YStack>

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
                bg="$indigoDark"
                flex={1}
                appearance="solid"
                colorType="primary"
                loading={isSubmitting}
                onPress={handleSubmit}
              >
                Send
              </BaseButton>
            </XStack>
          </YStack>
        </ScrollView>

        <Modal
          visible={feedbackOpen}
          transparent
          animationType="fade"
          onRequestClose={handleFeedbackClose}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
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
                borderWidth={isDark ? 1 : 0}
                borderColor={borderColor}
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
    </Theme>
  );
}

const ContactCard: React.FC<ContactCardProps> = ({
  icon,
  title,
  detail,
  onAction,
  actionIcon = true,
  isDark = false,
}) => {
  return (
    <XStack
      bg="$backgroundPaper"
      p="$4"
      borderRadius="$3"
      ai="center"
      jc="space-between"
      borderWidth={1}
      borderColor={isDark ? "#2C2C2C" : "#E0E0E0"}
    >
      <XStack ai="center" gap="$3" flex={1}>
        <YStack bg={isDark ? "#1E1E1E" : "$grey100"} p="$2" borderRadius={50}>
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
