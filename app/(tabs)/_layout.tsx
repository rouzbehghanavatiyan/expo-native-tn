import BlackTalent from "@/src/assets/images/black.png";
import WhiteTalent from "@/src/assets/images/white.png";
import AppHeader from "@/src/header/AppHeader";
import { useAppSelector } from "@/src/store/reduxHookType";
import * as ImagePicker from "expo-image-picker";
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Alert, Image, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { YStack } from "tamagui";

export default function TabLayout() {
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isWatchTab =
    pathname === "/home" ||
    pathname.includes("/home") ||
    pathname.includes("/watch/show");

  const DotIcon = ({ color }: { color: string }) => {
    const dotSize = 8;
    return (
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
        }}
      />
    );
  };

  // ✅ تابع باز کردن گالری برای انتخاب ویدیو یا عکس
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

        // هدایت به تب clashTalent همراه با پارامترهای فایل انتخابی
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
      <YStack f={1}>
        {!isWatchTab && <AppHeader />}
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: "black",
            tabBarStyle: {
              height: 24 + insets.bottom,
              paddingTop: 0,
              paddingBottom: 30 + insets.bottom,
              backgroundColor: "#fff",
              borderTopWidth: 0.5,
              borderTopColor: "#E5E5E5",
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

          {/* ✅ تب clashTalent با رویداد انتخاب مدیا */}
          <Tabs.Screen
            name="clashTalent"
            listeners={{
              tabPress: (e) => {
                e.preventDefault(); // جلوگیری از باز شدن پیش‌فرض تب
                handlePickMedia(); // باز کردن گالری
              },
            }}
            options={{
              tabBarIcon: ({ color, size, focused }) => {
                const containerSize = 19;
                const imageSize = 20;
                return (
                  <YStack
                    width={containerSize}
                    height={containerSize}
                    borderRadius={containerSize / 2}
                    backgroundColor={focused ? "white" : "$grey700"}
                    justifyContent="center"
                    alignItems="center"
                    borderColor={"#e5e7eb"}
                    overflow="visible"
                  >
                    <Image
                      source={focused ? BlackTalent : WhiteTalent}
                      style={{
                        width: imageSize,
                        height: imageSize,
                        position: "absolute",
                      }}
                      resizeMode="contain"
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
