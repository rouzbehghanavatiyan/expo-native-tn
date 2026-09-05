import BlackTalent from "@/src/assets/images/black.png";
import WhiteTalent from "@/src/assets/images/white.png";
import AppHeader from "@/src/header/AppHeader";
import { useAppSelector } from "@/src/store/reduxHookType";
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
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

  // ✅ کامپوننت جدید برای نمایش آیکون نقطه
  const DotIcon = ({ color }: { color: string }) => {
    const dotSize = 8; // اندازه ثابت برای همه نقاط
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <YStack f={1}>
        {!isWatchTab && <AppHeader />}
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: "black", // رنگ نقطه فعال
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
          {/* ✅ همه آیکون‌ها به جز clashTalent به DotIcon تبدیل شدند */}
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
            options={{
              tabBarIcon: ({ color, size, focused }) => {
                const containerSize = 19;
                const imageSize = focused ? 20 : 20;
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
