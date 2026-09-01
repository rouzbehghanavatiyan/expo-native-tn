import Logo from "@/src/assets/images/logocircle.png";
import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

// تعریف تایپ‌های مربوط به استیت مودال
interface ModalState {
  visible: boolean;
  type: "success" | "error";
  title: string;
  description: string;
  onConfirm?: () => void;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState<string>("");
  const [errors, setErrors] = useState<{
    identifier?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // استیت مدیریت مودال اختصاصی
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: "success",
    title: "",
    description: "",
  });

  const handleInputChange = (value: string) => {
    setIdentifier(value);
    setErrors({ identifier: undefined, general: undefined });
  };

  // بستن مودال و اجرای تابع تایید در صورت وجود
  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, visible: false }));
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
  };

  const handleResetPassword = async () => {
    if (isLoading) return;

    // اعتبارسنجی اولیه فرم
    if (!identifier.trim()) {
      setErrors({ identifier: "Email or Username is required" });
      return;
    }

    try {
      setIsLoading(true);

      const postData = {
        UserNameOrEmail: identifier,
      };

      // در اینجا باید API مربوط به بازیابی رمز را فراخوانی کنید
      // const res: any = await forgotPassword(postData);
      // const { status, message: apiMessage } = res?.data || {};

      // شبیه‌سازی ریکوئست موفق برای تست (کدهای بالا را جایگزین این بخش کنید)
      const status = 0;

      if (status === 0 || status === 2) {
        setModalState({
          visible: true,
          type: "success",
          title: "Email Sent",
          description:
            "If an account matches that email or username, a password reset link has been sent.",
          onConfirm: () => {
            router.replace("/");
          },
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          // general: apiMessage || "Failed to process request. Please try again.",
          general: "Failed to process request. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setModalState({
        visible: true,
        type: "error",
        title: "Error",
        description: "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" px="$4">
      <YStack
        borderRadius="$4"
        p="$6"
        width="100%"
        maxWidth={400}
        gap="$4"
        shadowColor="$shadowColor"
        shadowOpacity={0.08}
        shadowRadius={12}
      >
        <YStack alignItems="center" mb="$4">
          <Link href="/" asChild>
            <View cursor="pointer">
              <Image
                src={Logo}
                width={100}
                height={100}
                borderRadius={50}
                alt="Logo"
              />
            </View>
          </Link>

          <Text fontSize="$6" fontWeight="bold" color="$textPrimary" mt="$4">
            Reset Password
          </Text>

          <Text color="$textSecondary" mt="$2" textAlign="center">
            Enter your email or username to receive a password reset link.
          </Text>
        </YStack>

        <YStack gap="$3">
          <YStack gap="$2">
            <BaseInput
              label="Email or Username"
              value={identifier}
              onChangeText={handleInputChange}
              placeholder="e.g., user@example.com or john_doe"
              colorType="primary"
              variant="outline"
              autoCapitalize="none"
            />
            {errors.identifier && (
              <XStack gap="$1.5" alignItems="center">
                <Text color="$errorMain" fontSize="$2">
                  *
                </Text>
                <Text color="$errorMain" fontSize="$2">
                  {errors.identifier}
                </Text>
              </XStack>
            )}
          </YStack>

          {!!errors.general && (
            <Text color="$errorMain" fontSize="$3" textAlign="center" mt="$2">
              {errors.general}
            </Text>
          )}

          <BaseButton
            appearance="solid"
            colorType="primary"
            loading={isLoading}
            onPress={handleResetPassword}
            width="100%"
            mt="$3"
          >
            {isLoading ? "Sending..." : "Send"}
          </BaseButton>

          <XStack justifyContent="center" mt="$2" gap="$2" flexWrap="wrap">
            <Text fontSize="$3" color="$textPrimary">
              Remember your password?
            </Text>
            <Link href="/" asChild>
              <Text
                fontSize="$3"
                color="$primaryMain"
                fontWeight="bold"
                cursor="pointer"
              >
                Sign in
              </Text>
            </Link>
          </XStack>
        </YStack>
      </YStack>
      <Modal
        transparent
        visible={modalState.visible}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor="rgba(0,0,0,0.5)"
          px="$4"
        >
          <YStack
            backgroundColor="$background"
            width="100%"
            maxWidth={350}
            p="$5"
            borderRadius="$4"
            gap="$4"
            alignItems="center"
            shadowColor="#000"
            shadowOpacity={0.2}
            shadowRadius={10}
            elevation={5}
          >
            <View
              width={60}
              height={60}
              borderRadius={30}
              backgroundColor={
                modalState.type === "success" ? "$green4Light" : "$red4Light"
              }
              justifyContent="center"
              alignItems="center"
              mb="$2"
            >
              <Text
                fontSize={32}
                color={modalState.type === "success" ? "$green10" : "$red10"}
              >
                {modalState.type === "success" ? "✓" : "✕"}
              </Text>
            </View>

            <Text
              fontSize="$6"
              fontWeight="bold"
              color="$textPrimary"
              textAlign="center"
            >
              {modalState.title}
            </Text>

            <Text
              fontSize="$4"
              color="$textSecondary"
              textAlign="center"
              mb="$2"
            >
              {modalState.description}
            </Text>

            <BaseButton
              appearance="solid"
              colorType="primary"
              onPress={handleCloseModal}
              width="100%"
            >
              OK
            </BaseButton>
          </YStack>
        </YStack>
      </Modal>
    </YStack>
  );
}
