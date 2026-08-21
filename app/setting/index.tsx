import BaseButton from "@/src/components/BaseButtom";
import MainTitle from "@/src/components/MainTitle";
import SoftLink from "@/src/components/SoftLink";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

export default function SettingLayout() {
  const router = useRouter();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await AsyncStorage.clear();
      setLogoutDialogOpen(false);
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAcceptCategory = async (category: any) => {
    if (category.name === "Signout") {
      setLogoutDialogOpen(true);
      return;
    }
    if (category.name === "Profile") {
      router.push("/setting/editProfile");
      return;
    }
    if (category.name === "Learning") {
      router.push("/learning");
      return;
    }
    if (category.name === "Support") {
      router.push("/support");
      return;
    }
    if (category.name === "About us") {
      router.push("/about");
      return;
    }
    if (category.name === "Mark") {
      router.push("/mark");
      return;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <MainTitle title="Setting" />

      <View flex={1} px="$2" py="$2" bg="$gray2">
        <SoftLink
          handleAcceptCategory={handleAcceptCategory}
          categories={[
            { name: "Signout", id: 1, icon: "logout" },
            { name: "Profile", id: 2, icon: "person" },
            { name: "Support", id: 3, icon: "support-agent" },
            { name: "About us", id: 4, icon: "info" },
            { name: "Mark", id: 5, icon: "star" },
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
                  type="submit"
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
