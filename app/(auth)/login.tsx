import Logo from "@/src/assets/images/logocircle.png";
import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Icon } from "@/src/components/Icon";
import { useAppTheme } from "@/src/hook/ThemeContext";
import { login } from "@/src/services/authService";
import {
  categoryList,
  followerLength,
  followingLength,
  profileAttachment,
  resendVerificationEmail,
} from "@/src/services/masterServices";
import { saveTokens } from "@/src/services/tokenServices";
import {
  RsetCategory,
  RsetFollowerLength,
  RsetFollowingLength,
  RsetUserId,
  RsetUserLogin,
} from "@/src/slices/main";
import { useAppDispatch } from "@/src/store/reduxHookType";
import { validateFormLogin } from "@/src/utils/errorValidation";
import { FormErrors, FormValues } from "@/src/utils/GlobalType";
import { logger } from "@/src/utils/logger";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, View, XStack, YStack } from "tamagui";

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_SEC = 5 * 60;

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const LoginScreen: React.FC<any> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isDark } = useAppTheme();

  // Form
  const [formState, setFormState] = useState<any>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lock
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockRemaining, setLockRemaining] = useState(0);
  const isLocked = lockRemaining > 0;

  // Modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Login Error");
  const [modalMessage, setModalMessage] = useState("");
  const [modalIsError, setModalIsError] = useState(true);

  // Resend verification email
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputBgColor = isDark ? "#1e1e1e" : "#ffffff";
  const inputBorderColor = isDark ? "#383838" : "#E0E0E0";
  const iconColor = isDark ? "#9E9E9E" : "#757575";

  // شمارش معکوس قفل
  useEffect(() => {
    if (!isLocked) return;

    const timer = setInterval(() => {
      setLockRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked]);

  const openModal = (
    message: string,
    options?: { title?: string; isError?: boolean; showResend?: boolean },
  ) => {
    setModalTitle(options?.title ?? "Login Error");
    setModalIsError(options?.isError ?? true);
    setShowResend(options?.showResend ?? false);
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setShowResend(false);
  };

  const lockedMessage = (remainingSec?: number) =>
    remainingSec
      ? `Too many failed attempts. Please try again in ${formatTime(remainingSec)}.`
      : `Too many failed attempts. Please try again in ${LOCK_DURATION_SEC / 60} minutes.`;

  const registerFailedAttempt = () => {
    const next = loginAttempts + 1;

    if (next >= MAX_LOGIN_ATTEMPTS) {
      setLoginAttempts(0);
      setLockRemaining(LOCK_DURATION_SEC);
      return true;
    }

    setLoginAttempts(next);
    return false;
  };

  const handleInputChange = (name: keyof FormValues, value: string) => {
    setFormState((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const handleLoginSuccess = async (data: any) => {
    const { token, refreshToken, userId } = data ?? {};

    if (!token) {
      throw new Error("Token not found in login response");
    }

    await saveTokens(token, refreshToken || "");

    dispatch(RsetUserLogin({ token, userId }));
    dispatch(RsetUserId(userId));

    await Promise.all([
      categoryList()
        .then((res) => dispatch(RsetCategory(res?.data?.data || [])))
        .catch((err) => console.error("❌ Category List Error:", err?.message)),

      followingLength(userId)
        .then((res) => dispatch(RsetFollowingLength(res?.data?.data)))
        .catch((err) =>
          console.error("❌ Following Length Error:", err?.message),
        ),

      followerLength(userId)
        .then((res) => dispatch(RsetFollowerLength(res?.data?.data)))
        .catch((err) =>
          console.error("❌ Follower Length Error:", err?.message),
        ),

      profileAttachment(userId)
        .then((res) => {
          if (res?.data?.data) {
            dispatch(RsetUserLogin({ ...res.data.data, token, userId }));
          }
        })
        .catch((err) =>
          console.error("❌ Profile Attachment Error:", err?.message),
        ),
    ]);

    router.replace("/(tabs)/watch");
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (isLocked) {
      openModal(lockedMessage(lockRemaining));
      return;
    }

    if (!validateFormLogin(formState, setErrors)) return;

    try {
      setLoading(true);

      const response = await login({
        userName: formState.username,
        password: formState.password,
      });

      if (response?.status === 0 || response?.statusCode === 200) {
        await handleLoginSuccess(response?.data);
        return;
      }

      logger.info("login failed response", response);

      // ایمیل تایید نشده: شمارنده قفل زیاد نمی‌شود، دکمه ارسال مجدد نشان داده می‌شود
      if (response?.errorCode === "EMAIL_NOT_CONFIRMED") {
        openModal(
          response?.message ||
            "Your account is not activated. Please verify your email.",
          { showResend: true },
        );
        return;
      }

      // رمز یا نام کاربری اشتباه
      const nowLocked = registerFailedAttempt();
      openModal(
        nowLocked
          ? lockedMessage()
          : response?.message || "User not found or incorrect password.",
      );
    } catch (error: any) {
      logger.error("Login Failed:", error);

      const status = error?.response?.status;
      const isAuthFail = status === 401 || status === 404;

      if (isAuthFail) {
        const nowLocked = registerFailedAttempt();
        openModal(
          nowLocked
            ? lockedMessage()
            : "User not found or incorrect password. Please try again.",
        );
      } else {
        // خطای شبکه/سرور: تلاش ناموفق حساب نمی‌شود
        openModal(
          "Something went wrong. Please check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendLoading) return;

    const username = formState.username?.trim();
    if (!username) return;

    try {
      setResendLoading(true);
      const res = await resendVerificationEmail({ userName: username });

      if (res?.status === 0) {
        openModal("A new verification link has been sent to your email.", {
          title: "Email Sent",
          isError: false,
        });
      } else {
        // مثلاً TOO_MANY_REQUESTS؛ دکمه ارسال مجدد باقی می‌ماند
        openModal(
          res?.message || "Could not send the email. Please try again later.",
          { showResend: true },
        );
      }
    } catch (error) {
      logger.error("Resend verification failed:", error);
      openModal("Could not send the email. Please try again later.", {
        showResend: true,
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#ffffff" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            px="$4"
            py="$6"
            bg="$backgroundPaper"
          >
            <YStack
              borderRadius="$4"
              p="$6"
              width="100%"
              maxWidth={400}
              gap="$4"
              bg={isDark ? "#1e1e1e" : "#ffffff"}
              shadowColor={isDark ? "#000000" : "$shadowColor"}
              shadowOpacity={isDark ? 0.35 : 0.08}
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
                  Sign in to your account
                </Text>
              </YStack>

              <YStack gap="$8">
                <YStack gap="$2">
                  <BaseInput
                    baseColorLabel={inputBgColor}
                    label="Username"
                    value={formState.username}
                    borderColor={inputBorderColor}
                    onChangeText={(text) => handleInputChange("username", text)}
                    colorType="primary"
                    hasError={!!errors.username}
                    variant="outline"
                    errorMessage={errors.username}
                  />
                </YStack>

                <YStack gap="$2">
                  <View position="relative">
                    <BaseInput
                      baseColorLabel={inputBgColor}
                      label="Password"
                      secureTextEntry={!showPassword}
                      borderColor={inputBorderColor}
                      value={formState.password}
                      onChangeText={(text) =>
                        handleInputChange("password", text)
                      }
                      errorMessage={errors.password}
                      rightIcon={
                        <View
                          onPress={() => setShowPassword((prev) => !prev)}
                          cursor="pointer"
                        >
                          <Icon
                            name={
                              showPassword ? "visibility" : "visibility-off"
                            }
                            size={20}
                            color={iconColor}
                          />
                        </View>
                      }
                    />
                  </View>
                </YStack>

                <BaseButton
                  appearance="solid"
                  colorType="primary"
                  loading={loading}
                  disabled={isLocked}
                  onPress={handleSubmit}
                  width="100%"
                >
                  {loading
                    ? "Signing in..."
                    : isLocked
                      ? `Try again in ${formatTime(lockRemaining)}`
                      : "Sign in"}
                </BaseButton>

                <Link href="/forgotPassword" asChild>
                  <BaseButton appearance="ghost" colorType="primary">
                    Forgot password?
                  </BaseButton>
                </Link>

                <XStack
                  justifyContent="center"
                  mt="$2"
                  gap="$2"
                  flexWrap="wrap"
                >
                  <Text fontSize="$3" color="$textPrimary">
                    {`Don't have an account?`}
                  </Text>

                  <Link href="/signup" asChild>
                    <Text
                      fontSize="$3"
                      color="$primaryMain"
                      fontWeight="bold"
                      cursor="pointer"
                    >
                      Sign up
                    </Text>
                  </Link>
                </XStack>
              </YStack>
            </YStack>

            <Modal
              visible={showErrorModal}
              transparent
              animationType="fade"
              onRequestClose={closeModal}
            >
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 24,
                }}
                onPress={closeModal}
              >
                <Pressable
                  onPress={(e) => e.stopPropagation()}
                  style={{ width: "100%", maxWidth: 360 }}
                >
                  <YStack
                    bg="$backgroundPaper"
                    borderRadius="$4"
                    p="$5"
                    gap={14}
                    elevation={6}
                    borderWidth={isDark ? 1 : 0}
                    borderColor={isDark ? "#333333" : "transparent"}
                  >
                    <YStack gap={8}>
                      <Text
                        fontSize="$5"
                        fontWeight="700"
                        color={modalIsError ? "$errorMain" : "$primaryMain"}
                      >
                        {modalTitle}
                      </Text>
                      <Text
                        fontSize="$3"
                        color="$textSecondary"
                        lineHeight={20}
                      >
                        {modalMessage}
                      </Text>
                    </YStack>

                    <XStack jc="flex-end" gap="$3">
                      {showResend && (
                        <BaseButton
                          appearance="ghost"
                          colorType="primary"
                          loading={resendLoading}
                          onPress={handleResend}
                        >
                          Resend email
                        </BaseButton>
                      )}
                      <BaseButton
                        onPress={closeModal}
                        bg="$primaryMain"
                        width={80}
                      >
                        OK
                      </BaseButton>
                    </XStack>
                  </YStack>
                </Pressable>
              </Pressable>
            </Modal>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;