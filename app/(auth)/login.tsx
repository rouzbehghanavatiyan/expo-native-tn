import Logo from "@/src/assets/images/logocircle.png";
import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { login } from "@/src/services/authService";
import {
  categoryList,
  followerList,
  followingList,
  profileAttachment,
} from "@/src/services/masterServices";
import { saveToken } from "@/src/services/tokenServices";
import {
  RsetAllFollowerList,
  RsetAllFollowingList,
  RsetCategory,
  RsetUserId,
  RsetUserLogin,
} from "@/src/slices/main";
import { useAppDispatch } from "@/src/store/reduxHookType";
import { validateFormLogin } from "@/src/utils/errorValidation";
import { FormErrors, FormValues } from "@/src/utils/GlobalType";
import { Check, Eye, EyeOff } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { Modal, Pressable } from "react-native"; // اضافه شدن Modal و Pressable
import { Checkbox, Image, Text, View, XStack, YStack } from "tamagui";

const LoginScreen: React.FC<any> = () => {
  const router = useRouter();
  const [formState, setFormState] = useState<any>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // استیت‌های جدید برای مودال خطای Tamagui
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

      if (response?.status === 0) {
        const token = response?.data?.token;
        await saveToken(token);

        const decoded: any = jwtDecode(token);
        const userId: any = Number(Object.values(decoded)?.[1]);

        dispatch(RsetUserLogin({ token, userId }));
        dispatch(RsetUserId(userId));

        await Promise.all([
          categoryList().then((res) =>
            dispatch(RsetCategory(res?.data?.data || [])),
          ),
          followingList(userId).then((res) =>
            dispatch(RsetAllFollowingList(res?.data?.data || [])),
          ),
          followerList(userId).then((res) =>
            dispatch(RsetAllFollowerList(res?.data?.data || [])),
          ),
          profileAttachment(userId).then((res) => {
            if (res?.data?.data) {
              dispatch(RsetUserLogin({ ...res.data.data, token, userId }));
            }
          }),
        ]);

        router.replace("/(tabs)/watch");
      } else {
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

        <YStack gap="$4">
          <YStack gap="$2">
            <BaseInput
              label="Username"
              value={formState.username}
              onChangeText={(text) => handleInputChange("username", text)}
              placeholder="username"
              colorType="primary"
              hasError={!!errors.username}
              variant="outline"
              errorMessage={errors.username}
            />
            {!!errors.username && (
              <Text color="$errorMain" fontSize="$3">
                {errors.username}
              </Text>
            )}
          </YStack>

          <YStack gap="$2">
            <View position="relative">
              <BaseInput
                label="Password"
                secureTextEntry={!showPassword}
                value={formState.password}
                onChangeText={(text) => handleInputChange("password", text)}
                placeholder="password"
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
            </View>
          </YStack>

          <XStack alignItems="center" justifyContent="space-between" mt="$2">
            <XStack alignItems="center" gap="$2">
              <Checkbox id="remember-me" size="$8" defaultChecked={false}>
                <Checkbox.Indicator>
                  <Check />
                </Checkbox.Indicator>
              </Checkbox>

              <Text fontSize="$3" color="$textPrimary">
                Remember me
              </Text>
            </XStack>
          </XStack>

          <BaseButton
            appearance="solid"
            colorType="primary"
            loading={loading}
            onPress={handleSubmit}
            width="100%"
          >
            {loading ? "Signing in..." : "Sign in"}
          </BaseButton>

          <BaseButton
            appearance="ghost"
            colorType="primary"
            onPress={() => Alert.alert("Forgot Password", "Coming soon")}
          >
            Forgot password?
          </BaseButton>

          <XStack justifyContent="center" mt="$2" gap="$2" flexWrap="wrap">
            <Text fontSize="$3" color="$textPrimary">
              Don't have an account?
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
                  color="white"
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
