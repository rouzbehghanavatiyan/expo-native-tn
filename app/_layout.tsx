import { ThemeProvider, useAppTheme } from "@/src/hook/ThemeContext";
import { store } from "@/src/store/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider as GorhomPortalProvider } from "@gorhom/portal";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { TamaguiProvider, Theme, View } from "tamagui";
import tamaguiConfig from "../tamagui.config";
import AppInitializer from "./AppInitializer";

function AppShell() {
  const { themeMode, isThemeLoading } = useAppTheme();
  const isDark = themeMode === "dark";

  const [fontsLoaded] = useFonts({
    OswaldLight: require("../src/assets/fonts/logoFont/Oswald-Light.ttf"),
    OleoScriptBold: require("../src/assets/fonts/logoFont/OleoScript-Bold.ttf"),

    playFair: require("../src/assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf"),
    PlusJakartaSans: require("../src/assets/fonts/PlusJakartaSans-Regular.ttf"),
    Vazirmatn: require("../src/assets/fonts/Vazirmatn-Regular.ttf"),
    VazirmatnMedium: require("../src/assets/fonts/Vazirmatn-Medium.ttf"),
    VazirmatnBold: require("../src/assets/fonts/Vazirmatn-Bold.ttf"),
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(isDark ? "#000000" : "#ffffff");
  }, [isDark]);

  if (!fontsLoaded || isThemeLoading) {
    return (
      <TamaguiProvider config={tamaguiConfig} defaultTheme={themeMode}>
        <View
          flex={1}
          justifyContent="center"
          alignItems="center"
          bg={themeMode === "dark" ? "#121212" : "#fff"}
        >
          <ActivityIndicator />
        </View>
      </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={themeMode}>
      <Theme name={themeMode}>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor={isDark ? "#000000" : "#ffffff"}
          translucent={false}
        />
        <SafeAreaProvider>
          <Provider store={store}>
            <GorhomPortalProvider>
              <BottomSheetModalProvider>
                <AppInitializer>
                  <Slot />
                </AppInitializer>
              </BottomSheetModalProvider>
            </GorhomPortalProvider>
          </Provider>
        </SafeAreaProvider>
      </Theme>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
