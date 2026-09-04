import Logo from "@/src/assets/images/logocircle.png";
import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { Icon } from "@/src/components/Icon";
import { api, chatApi } from "@/src/services/api";
import { login } from "@/src/services/authService";
import {
  categoryList,
  followerLength,
  followingLength,
  profileAttachment,
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
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { Modal, Pressable } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

const LoginScreen: React.FC<any> = () => {
  const router = useRouter();
  const [formState, setFormState] = useState<any>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const dispatch = useAppDispatch();

  const handleInputChange = (name: keyof FormValues, value: string) => {
    setFormState((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async () => {
    if (loading || loginAttempts >= 3) return;
    const isValid = validateFormLogin(formState, setErrors);
    if (!isValid) return;

    try {
      setLoading(true);
      const response = await login({
        userName: formState.username,
        password: formState.password,
      });
      logger.info("response Login", response);

      if (response?.status === 0 || response?.statusCode === 200) {
        const token = response?.data?.token;
        const refreshToken = response?.data?.refreshToken;

        await saveTokens(token, refreshToken);

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        chatApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        chatApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const decoded: any = jwtDecode(token);
        const userId: any = Object.values(decoded)?.[1];

        dispatch(RsetUserLogin({ token, userId }));
        dispatch(RsetUserId(userId));

        await Promise.all([
          categoryList()
            .then((res) => dispatch(RsetCategory(res?.data?.data || [])))
            .catch((err) => console.log("Category List Error:", err?.message)),

          followingLength(userId)
            .then((res) =>
              dispatch(RsetFollowingLength(res?.data?.data?.count)),
            )
            .catch((err) =>
              console.log("Following Length Error:", err?.message),
            ),

          followerLength(userId)
            .then((res) => dispatch(RsetFollowerLength(res?.data?.data?.count)))
            .catch((err) =>
              console.log("Follower Length Error:", err?.message),
            ),

          profileAttachment(userId)
            .then((res) => {
              if (res?.data?.data) {
                dispatch(RsetUserLogin({ ...res.data.data, token, userId }));
              }
            })
            .catch((err) => {
              console.log("Profile Attachment Error:", err?.message);
              dispatch(RsetUserLogin({ token, userId }));
            }),
        ]);
        router.replace("/(tabs)/watch");
        setLoginAttempts((prev) => prev + 1);
        setModalMessage(
          "User not found or incorrect password. Please try again.",
        );
        setShowErrorModal(true);
      }
    } catch (error: any) {
      setLoginAttempts((prev) => prev + 1);

      const status = error?.response?.status;
      const msg =
        status === 404 || status === 401
          ? "User not found or incorrect password. Please try again."
          : "Something went wrong. Please check your connection and try again.";

      setModalMessage(msg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
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
            Sign in to your account
          </Text>
        </YStack>

        <YStack gap="$8">
          <YStack gap="$2">
            <BaseInput
              label="Username"
              value={formState.username}
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
                label="Password"
                secureTextEntry={!showPassword}
                value={formState.password}
                onChangeText={(text) => handleInputChange("password", text)}
                errorMessage={errors.password}
                rightIcon={
                  <View
                    onPress={() => setShowPassword((prev) => !prev)}
                    cursor="pointer"
                  >
                    {showPassword ? (
                      <Icon name="Visibility" size={20} color="gray" />
                    ) : (
                      <Icon name="Visibility" size={20} color="gray" />
                    )}
                  </View>
                }
              />
            </View>
          </YStack>
          <BaseButton
            appearance="solid"
            colorType="primary"
            loading={loading}
            onPress={handleSubmit}
            width="100%"
          >
            {loading ? "Signing in..." : "Sign in"}
          </BaseButton>

          <Link href="/forgotPassword" asChild>
            <BaseButton appearance="ghost" colorType="primary">
              Forgot password?
            </BaseButton>
          </Link>

          <XStack justifyContent="center" mt="$2" gap="$2" flexWrap="wrap">
            <Text fontSize="$3" color="$textPrimary">
              {`Dont't have an account?`}
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
        onRequestClose={() => setShowErrorModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
          onPress={() => setShowErrorModal(false)}
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
            >
              <YStack gap={8}>
                <Text fontSize="$5" fontWeight="700" color="$errorMain">
                  Login Error
                </Text>
                <Text fontSize="$3" color="$textSecondary" lineHeight={20}>
                  {modalMessage}
                </Text>
              </YStack>

              <XStack jc="flex-end">
                <BaseButton
                  onPress={() => setShowErrorModal(false)}
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
  );
};

export default LoginScreen;
