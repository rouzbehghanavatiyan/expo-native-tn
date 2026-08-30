import BlackTalent from "@/src/assets/images/black.png";
import WhiteTalent from "@/src/assets/images/white.png";
import AppHeader from "@/src/header/AppHeader";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { FontAwesome } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { Image, Pressable } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { YStack } from "tamagui";

export default function TabLayout() {
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const pathname = usePathname();
  const userProfile = getImageUrl(userInfo?.profile);
  const insets = useSafeAreaInsets();

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
            tabBarItemStyle: {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "transparent",
              pointerEvents: "box-none",
            },
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{ color: "transparent" }}
                style={[
                  props.style,
                  {
                    backgroundColor: "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    pointerEvents: "auto",
                  },
                ]}
              />
            ),
            tabBarStyle: {
              position: "absolute",
              backgroundColor: "transparent",
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              height: 50,
              bottom: insets.bottom > 0 ? insets.bottom - 65 : 12,
              pointerEvents: "box-none",
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
              tabBarIcon: ({ color, size, focused }) => {
                const containerSize = size;
                const imageSize = focused ? size + 8 : size + 3;
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
