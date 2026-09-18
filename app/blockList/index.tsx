import UserListLayout from "@/src/common/UserListLayout";
import BaseButton from "@/src/components/BaseButtom";
import MainTitle from "@/src/components/MainTitle";
import SoftLink from "@/src/components/SoftLink";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

export default function BlockListScreen() {
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
      case "Block List":
        router.push("/blockList");
        break;
      case "About us":
        router.push("/about");
        break;
      // case "Mark":
      //   router.push("/mark");
      //   break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <MainTitle title="Setting" />
      <UserListLayout />
    </SafeAreaView>
  );
}
