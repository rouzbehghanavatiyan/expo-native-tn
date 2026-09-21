import AppHeader from "@/src/header/AppHeader";
import { getThemeColor } from "@/src/hook/getThemeColor";
import { useAppSelector } from "@/src/store/reduxHookType";
import * as ImagePicker from "expo-image-picker";
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme, View, YStack } from "tamagui";

export default function TabLayout() {
  const theme = useTheme();
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userLoginId = userInfo?.user?.id || userInfo?.userId;

  // Theme-aware color resolutions
  const activeColor = getThemeColor(theme.color, "#000000");
  const inactiveColor = getThemeColor(theme.primary, "#225db5");
  const tabBgColor = getThemeColor(theme.background, "#ffffff");
  const borderColor = getThemeColor(theme.borderColor, "#d8d8d8");
  const activeDotBg = getThemeColor(theme.background, "#ffffff");
  const activeInnerDot = getThemeColor(theme.color, "#000000");
  const inactiveInnerDot = getThemeColor(theme.background, "#ffffff");

  const isWatchTab =
    pathname === "/home" ||
    pathname.includes("/home") ||
    pathname.includes("/watch/show");

  const DotIcon = ({ color }: { color: string }) => {
    return <View w={8} h={8} borderRadius={4} bg={color} />;
  };

  const handlePickMedia = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("دسترسی لازم است", "لطفاً دسترسی به گالری را تایید کنید.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        router.push({
          pathname: "/(tabs)/clashTalent",
          params: {
            mediaUri: selectedAsset.uri,
            mediaType:
              selectedAsset.type ??
              (selectedAsset.uri.endsWith(".mp4") ? "video" : "image"),
            duration: selectedAsset.duration ?? 0,
          },
        });
      }
    } catch (error) {
      console.error("Error picking media: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <YStack f={1} bg="$background">
        {!isWatchTab && <AppHeader />}
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: activeColor,
            tabBarInactiveTintColor: inactiveColor,
            tabBarStyle: {
              height: 24 + insets.bottom,
              paddingTop: 0,
              paddingBottom: 30 + insets.bottom,
              backgroundColor: tabBgColor,
              borderTopWidth: 0.5,
              borderTopColor: borderColor,
              elevation: 0,
            },
            tabBarItemStyle: {
              transform: [{ translateY: -4 }],
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              tabBarIcon: ({ color }) => <DotIcon color={color} />,
            }}
          />

          <Tabs.Screen
            name="watch"
            options={{
              tabBarIcon: ({ color }) => <DotIcon color={color} />,
            }}
          />

          <Tabs.Screen
            name="clashTalent"
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                handlePickMedia();
              },
            }}
            options={{
              tabBarIcon: ({ focused }) => {
                const containerSize = 19;
                const dotSize = 6;
                return (
                  <YStack
                    width={containerSize}
                    height={containerSize}
                    borderRadius={containerSize / 2}
                    bg={focused ? activeDotBg : inactiveColor}
                    jc="center"
                    ai="center"
                    borderColor="$borderColor"
                    borderWidth={1}
                    overflow="visible"
                  >
                    <View
                      w={dotSize}
                      h={dotSize}
                      borderRadius={dotSize / 2}
                      bg={focused ? activeInnerDot : inactiveInnerDot}
                    />
                  </YStack>
                );
              },
            }}
          />

          <Tabs.Screen
            name="topScore"
            options={{
              tabBarIcon: ({ color }) => <DotIcon color={color} />,
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ color }) => <DotIcon color={color} />,
            }}
            listeners={{
              tabPress: () => {
                router.setParams({ userData: undefined });
              },
            }}
          />
        </Tabs>
      </YStack>
    </SafeAreaView>
  );
}
