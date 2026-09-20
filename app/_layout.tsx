// مسیر: app/_layout.tsx
import { ThemeProvider, useAppTheme } from "@/src/hook/ThemeContext";
import { store } from "@/src/store/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider as GorhomPortalProvider } from "@gorhom/portal";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { TamaguiProvider, Theme, View } from "tamagui";
import tamaguiConfig from "../tamagui.config";
import AppInitializer from "./AppInitializer";

function AppShell() {
  // themeMode از AsyncStorage خونده می‌شه، پیش‌فرضش "dark" هست (داخل ThemeContext)
  const { themeMode, isThemeLoading } = useAppTheme();

  const [fontsLoaded] = useFonts({
    logoFont: require("../src/assets/fonts/DancingScript-Regular.ttf"),
    playFair: require("../src/assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf"),
    PlusJakartaSans: require("../src/assets/fonts/PlusJakartaSans-Regular.ttf"),
    Vazirmatn: require("../src/assets/fonts/Vazirmatn-Regular.ttf"),
    VazirmatnMedium: require("../src/assets/fonts/Vazirmatn-Medium.ttf"),
    VazirmatnBold: require("../src/assets/fonts/Vazirmatn-Bold.ttf"),
  });

  // تا وقتی فونت‌ها یا تم لود نشدن، یه اسپلش ساده با پس‌زمینه‌ی متناسب با تم نشون بده
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
    // defaultTheme فقط برای رندر اولیه/SSR استفاده می‌شه؛ سوییچ داینامیک واقعی
    // با کامپوننت <Theme name={...}> انجام می‌شه، نه با یه prop روی TamaguiProvider
    <TamaguiProvider config={tamaguiConfig} defaultTheme={themeMode}>
      <Theme name={themeMode}>
        <StatusBar
          style={themeMode === "dark" ? "light" : "dark"}
          backgroundColor="transparent"
          translucent={true}
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
