import Logo from "@/src/assets/images/logocircle.png";
import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { useMessageModal } from "@/src/hook/useMessageModal";
import { registerUser } from "@/src/services/masterServices";
import { validateForm } from "@/src/utils/errorValidation";
import { FormErrors, FormValues } from "@/src/utils/GlobalType";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View, XStack, YStack } from "tamagui";

export default function SignUpScreen() {
  const router = useRouter();
  const [inputs, setInputs] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const message = useMessageModal();

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
      const { status, message } = res?.data || {};
      if (status === 0 || status === 2) {
        alert("Dear user, please check your email to verify your account.");
        router.replace("/");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: message || "Registration failed. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
      setErrors((prev) => ({
        ...prev,
        general: "An error occurred. Please try again later.",
      }));
      alert("An error occurred. Please try again later.");
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
            Clash Talent
          </Text>

          <Text color="$textSecondary" mt="$2">
            Create your account
          </Text>
        </YStack>

        <YStack gap="$4">
          <BaseInput
            label="Username"
            value={inputs.username}
            onChangeText={(text) => handleInputChange("username", text)}
            placeholder="username"
            colorType="primary"
            variant="outline"
            errorMessage={errors.username}
          />

          <BaseInput
            label="Email"
            value={inputs.email}
            onChangeText={(text) => handleInputChange("email", text)}
            placeholder="email"
            colorType="primary"
            variant="outline"
            errorMessage={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <BaseInput
            label="Password"
            secureTextEntry={!showPassword}
            value={inputs.password}
            onChangeText={(text) => handleInputChange("password", text)}
            placeholder="password"
            colorType="primary"
            variant="outline"
            errorMessage={errors.password}
            rightIcon={
              <View
                onPress={() => setShowPassword((prev) => !prev)}
                cursor="pointer"
              >
                {showPassword ? (
                  <EyeOff size={20} color="gray" />
                ) : (
                  <Eye size={20} color="gray" />
                )}
              </View>
            }
          />
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
            errorMessage={errors.passwordConfirmation}
            rightIcon={
              <View
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                cursor="pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="gray" />
                ) : (
                  <Eye size={20} color="gray" />
                )}
              </View>
            }
          />

          {!!errors.general && (
            <Text color="$errorMain" fontSize="$3" textAlign="center">
              {errors.general}
            </Text>
          )}

          <BaseButton
            appearance="solid"
            colorType="primary"
            loading={isLoading}
            onPress={handleSignUp}
            width="100%"
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
    </YStack>
  );
}
