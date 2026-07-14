import AppHeader from "@/src/header/AppHeader";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { FontAwesome } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

export default function TabLayout() {
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const pathname = usePathname();
  const userProfile = getImageUrl(userInfo?.profile);

  const isWatchTab =
    pathname === "/home" ||
    pathname.includes("/home") ||
    pathname.includes("/watch/show");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1}>
        {!isWatchTab && <AppHeader />}
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: "black",
            tabBarIconStyle: {
              marginTop: 2,
            },
            tabBarStyle: {
              height: 48,
              paddingTop: 6,
              paddingBottom: 6,
              backgroundColor: "#fff",
              borderTopWidth: 0.5,
              borderTopColor: "#E5E5E5",
              elevation: 0,
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="home" size={size - 2} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="watch"
            options={{
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="play" size={size - 2} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="clashTalent"
            options={{
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="star" size={size - 2} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="topScore"
            options={{
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="check" size={size - 2} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ color, size, focused }) =>
                userProfile ? (
                  <YStack
                    width={size + 8}
                    height={size + 8}
                    borderRadius={(size + 8) / 2}
                    overflow="hidden"
                    borderWidth={focused ? 2 : 1}
                    borderColor={focused ? "black" : "#ccc"}
                  >
                    <Image
                      source={{ uri: userProfile }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </YStack>
                ) : (
                  <FontAwesome name="user" size={size + 4} color={color} />
                ),
            }}
          />
        </Tabs>
      </YStack>
    </SafeAreaView>
  );
}
