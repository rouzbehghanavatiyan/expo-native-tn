import BaseButton from "@/src/components/BaseButtom";
import { Icon } from "@/src/components/Icon";
import MainTitle from "@/src/components/MainTitle";
import SoftLink from "@/src/components/SoftLink";
import { useAppTheme } from "@/src/hook/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

const THEME_STORAGE_KEY = "@app_theme";

export default function SettingLayout() {
  const router = useRouter();
  const { isDark, setThemeMode } = useAppTheme();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter((k) => k !== THEME_STORAGE_KEY);
      if (keysToRemove.length) {
        await AsyncStorage.multiRemove(keysToRemove);
      }

      setLogoutDialogOpen(false);
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAcceptCategory = async (category: any) => {
    switch (category.name) {
      case "Signout":
        setLogoutDialogOpen(true);
        break;
      case "Profile":
        router.push("/setting/editProfile");
        break;
      case "Learning":
        router.push("/learning");
        break;
      case "Support":
        router.push("/support");
        break;
      case "Block list":
        router.push("/blockList");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    router.replace("/(tabs)/profile");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <MainTitle title="Setting" handleBack={handleBack} />
      <View flex={1} px="$2" py="$2" bg="$backgroundPaper">
        <SoftLink
          handleAcceptCategory={handleAcceptCategory}
          categories={[
            { name: "Signout", id: 1, icon: "logout" },
            { name: "Profile", id: 2, icon: "person" },
            { name: "Support", id: 3, icon: "support-agent" },
            {
              name: "Theme",
              id: 5,
              icon: "star",
              renderRight: () => (
                <XStack ai="center" gap="$2" mr="$2">
                  <XStack
                    tag="button"
                    onPress={() => setThemeMode("light")}
                    px="$2"
                    py="$1"
                    borderRadius="$2"
                    borderWidth={!isDark ? 1.5 : 1}
                    borderColor={!isDark ? "$successMain" : "$grey300"}
                    ai="center"
                    jc="center"
                    gap="$1.5"
                    pressStyle={{ opacity: 0.7 }}
                    animation="quick"
                    cursor="pointer"
                  >
                    <Icon
                      name="sunny"
                      size={14}
                      color={!isDark ? "#2e7d32" : "#757575"}
                    />
                    <Text
                      marginStart={3}
                      fontSize="$3"
                      fontWeight={!isDark ? "700" : "500"}
                      color={!isDark ? "$successMain" : "$grey800"}
                    >
                      Light
                    </Text>
                  </XStack>

                  {/* Dark Button */}
                  <XStack
                    tag="button"
                    onPress={() => setThemeMode("dark")}
                    px="$2"
                    py="$1"
                    borderRadius="$2"
                    borderWidth={isDark ? 1.5 : 1}
                    borderColor={isDark ? "$successMain" : "$grey300"}
                    ai="center"
                    jc="center"
                    gap="$1.5"
                    pressStyle={{ opacity: 0.7 }}
                    animation="quick"
                    cursor="pointer"
                  >
                    <Icon
                      name="bedtime"
                      size={14}
                      color={isDark ? "#2e7d32" : "#757575"}
                    />
                    <Text
                      marginStart={3}
                      fontSize="$3"
                      fontWeight={isDark ? "700" : "500"}
                      color={isDark ? "$successMain" : "$grey800"}
                    >
                      Dark
                    </Text>
                  </XStack>
                </XStack>
              ),
            },
            { name: "Block list", id: 6, icon: "block" },
            { name: "Learning", id: 7, icon: "school" },
          ]}
          isLoading={false}
        />
      </View>

      <Modal
        visible={logoutDialogOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutDialogOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
          onPress={() => !isLoggingOut && setLogoutDialogOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 360 }}
          >
            <YStack
              bg="$backgroundPaper"
              borderRadius="$4"
              p="$5"
              gap={10}
              elevation={6}
            >
              <YStack gap={10}>
                <Text fontSize="$4" fontWeight="700" color="$textPrimary">
                  Sign out
                </Text>
                <Text fontSize="$3" color="$textSecondary">
                  Are you sure you want to sign out? Your local session data
                  will be removed.
                </Text>
              </YStack>
              <XStack jc="flex-end" gap={10}>
                <BaseButton
                  disabled={isLoggingOut}
                  onPress={() => setLogoutDialogOpen(false)}
                  bg="$grey400"
                  variant="outlined"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  disabled={isLoggingOut}
                  onPress={handleLogoutConfirm}
                  bg="$indigoMain"
                >
                  {isLoggingOut ? "Signing out..." : "Confirm"}
                </BaseButton>
              </XStack>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
