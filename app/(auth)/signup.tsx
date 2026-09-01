import Logo from "@/src/assets/images/logocircle.png";
import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Icon } from "@/src/components/Icon";
import { registerUser } from "@/src/services/masterServices";
import { validateForm } from "@/src/utils/errorValidation";
import { FormErrors, FormValues } from "@/src/utils/GlobalType";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

interface ModalState {
  visible: boolean;
  type: "success" | "error";
  title: string;
  description: string;
  onConfirm?: () => void;
}

export default function SignUpScreen() {
  const router = useRouter();
  const [inputs, setInputs] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: "success",
    title: "",
    description: "",
  });

  const handleInputChange = (name: keyof FormValues, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
      general: undefined,
    }));
  };

  // بستن مودال و اجرای تابع تایید در صورت وجود
  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, visible: false }));
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
  };

  const handleSignUp = async () => {
    if (isLoading) return;

    const isValid = validateForm(inputs, setErrors);
    if (!isValid) return;

    try {
      setIsLoading(true);
      const postData = {
        UserName: inputs.username,
        Password: inputs.password,
        Email: inputs.email,
      };

      const res: any = await registerUser(postData);
      const { status, message: apiMessage } = res?.data || {};

      if (status === 0 || status === 2) {
        setModalState({
          visible: true,
          type: "success",
          title: "Registration Successful",
          description:
            "Dear user, please check your email to verify your account.",
          onConfirm: () => {
            router.replace("/");
          },
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          general: apiMessage || "Registration failed. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          px="$4"
          py="$6"
        >
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

              <Text
                fontSize="$6"
                fontWeight="bold"
                color="$textPrimary"
                mt="$4"
              >
                Clash Talent
              </Text>

              <Text color="$textSecondary" mt="$2">
                Create your account
              </Text>
            </YStack>

            <YStack gap="$3">
              {/* -- Username Input -- */}
              <YStack gap="$2">
                <BaseInput
                  label="Username"
                  value={inputs.username}
                  onChangeText={(text) => handleInputChange("username", text)}
                  placeholder="username"
                  colorType="primary"
                  variant="outline"
                />
                {errors.username && (
                  <XStack gap="$1.5" alignItems="center">
                    <Text color="$errorMain" fontSize="$2">
                      *
                    </Text>
                    <Text color="$errorMain" fontSize="$2">
                      {errors.username}
                    </Text>
                  </XStack>
                )}
              </YStack>

              {/* -- Email Input -- */}
              <YStack gap="$2">
                <BaseInput
                  label="Email"
                  value={inputs.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  placeholder="email"
                  colorType="primary"
                  variant="outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <XStack gap="$1.5" alignItems="center">
                    <Text color="$errorMain" fontSize="$2">
                      *
                    </Text>
                    <Text color="$errorMain" fontSize="$2">
                      {errors.email}
                    </Text>
                  </XStack>
                )}
              </YStack>

              <YStack gap="$2">
                <BaseInput
                  label="Password"
                  secureTextEntry={!showPassword}
                  value={inputs.password}
                  onChangeText={(text) => handleInputChange("password", text)}
                  placeholder="password"
                  colorType="primary"
                  variant="outline"
                  rightIcon={
                    <View
                      onPress={() => setShowPassword((prev) => !prev)}
                      cursor="pointer"
                    >
                      {showPassword ? (
                        <Icon name="visibilityOff" size={20} color="gray" />
                      ) : (
                        <Icon name="removeRedEye" size={20} color="gray" />
                      )}
                    </View>
                  }
                />
                {errors.password && (
                  <XStack gap="$1.5" alignItems="center">
                    <Text color="$errorMain" fontSize="$2">
                      *
                    </Text>
                    <Text color="$errorMain" fontSize="$2">
                      {errors.password}
                    </Text>
                  </XStack>
                )}
              </YStack>

              <YStack gap="$2">
                <BaseInput
                  label="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  value={inputs.passwordConfirmation}
                  onChangeText={(text) =>
                    handleInputChange("passwordConfirmation", text)
                  }
                  placeholder="Confirm your password"
                  colorType="primary"
                  variant="outline"
                  rightIcon={
                    <View
                      onPress={() => setShowConfirmPassword((prev) => !prev)}
                      cursor="pointer"
                    >
                      {showConfirmPassword ? (
                        <Icon name="visibilityOff" size={20} color="gray" />
                      ) : (
                        <Icon name="removeRedEye" size={20} color="gray" />
                      )}
                    </View>
                  }
                />
                {errors.passwordConfirmation && (
                  <XStack gap="$1.5" alignItems="center">
                    <Text color="$errorMain" fontSize="$2">
                      *
                    </Text>
                    <Text color="$errorMain" fontSize="$2">
                      {errors.passwordConfirmation}
                    </Text>
                  </XStack>
                )}
              </YStack>

              {!!errors.general && (
                <Text
                  color="$errorMain"
                  fontSize="$3"
                  textAlign="center"
                  mt="$2"
                >
                  {errors.general}
                </Text>
              )}

              <BaseButton
                appearance="solid"
                colorType="primary"
                loading={isLoading}
                onPress={handleSignUp}
                width="100%"
                mt="$3"
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </BaseButton>

              <XStack justifyContent="center" mt="$2" gap="$2" flexWrap="wrap">
                <Text fontSize="$3" color="$textPrimary">
                  Already have an account?
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
              backgroundColor="rgba(0, 0, 0, 0.73)"
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
                shadowColor="#16d620"
                shadowOpacity={0.2}
                shadowRadius={10}
                elevation={5}
              >
                <View
                  width={60}
                  height={60}
                  borderRadius={30}
                  backgroundColor={
                    modalState.type === "success"
                      ? "$green4Light"
                      : "$red4Light"
                  }
                  justifyContent="center"
                  alignItems="center"
                  mb="$2"
                >
                  <Text
                    fontSize={32}
                    color={
                      modalState.type === "success" ? "$greenMain" : "$redMain"
                    }
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
                  colorType="success"
                  onPress={handleCloseModal}
                  width="100%"
                >
                  OK
                </BaseButton>
              </YStack>
            </YStack>
          </Modal>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
