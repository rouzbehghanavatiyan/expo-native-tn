import BaseButton from "@/src/components/BaseButtom";
import MainTitle from "@/src/components/MainTitle";
import SoftLink from "@/src/components/SoftLink";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch, Text, View, XStack, YStack } from "tamagui";

const THEME_STORAGE_KEY = "@app_theme";

export default function SettingLayout() {
  const router = useRouter();

  const [isDark, setIsDark] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setIsDark(savedTheme === "dark");
        }
      } catch (e) {
        console.log("Error loading theme", e);
      }
    };
    loadTheme();
  }, []);

  const handleToggleTheme = async (checked: boolean) => {
    const themeMode = checked ? "dark" : "light";
    setIsDark(checked);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
    // dispatch(setTheme(themeMode));
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      await AsyncStorage.clear();
      if (savedTheme) {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, savedTheme);
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

      <View flex={1} px="$2" py="$2" bg="$gray2">
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
                  {/* Light Button */}
                  <XStack
                    tag="button"
                    onPress={() => handleToggleTheme(false)}
                    px="$2.5"
                    py="$1.5"
                    borderRadius="$10"
                    borderWidth={!isDark ? 1.5 : 1}
                    borderColor={!isDark ? "$blue9" : "$gray6"}
                    bg={!isDark ? "$blue2" : "transparent"}
                    ai="center"
                    jc="center"
                    pressStyle={{ opacity: 0.7 }}
                    animation="quick"
                    cursor="pointer"
                  >
                    <Text
                      fontSize="$2"
                      fontWeight={!isDark ? "700" : "500"}
                      color={!isDark ? "$blue10" : "$gray9"}
                    >
                      Light
                    </Text>
                  </XStack>

                  <Switch
                    size="$2.5"
                    checked={isDark}
                    onCheckedChange={handleToggleTheme}
                  >
                    <Switch.Thumb animation="bouncy" />
                  </Switch>

                  {/* Dark Button */}
                  <XStack
                    tag="button"
                    onPress={() => handleToggleTheme(true)}
                    px="$2.5"
                    py="$1.5"
                    borderRadius="$10"
                    borderWidth={isDark ? 1.5 : 1}
                    borderColor={isDark ? "$blue9" : "$gray6"}
                    bg={isDark ? "$blue2" : "transparent"}
                    ai="center"
                    jc="center"
                    pressStyle={{ opacity: 0.7 }}
                    animation="quick"
                    cursor="pointer"
                  >
                    <Text
                      fontSize="$2"
                      fontWeight={isDark ? "700" : "500"}
                      color={isDark ? "$blue10" : "$gray9"}
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
                  bg="$errorMain"
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
