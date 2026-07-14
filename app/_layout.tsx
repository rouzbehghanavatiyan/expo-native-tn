import { store } from "@/src/store/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider as GorhomPortalProvider } from "@gorhom/portal";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PortalProvider, TamaguiProvider, View } from "tamagui";

import tamaguiConfig from "../tamagui.config";
import { AppInitializer } from "./AppInitializer";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    logoFont: require("../src/assets/fonts/DancingScript-Regular.ttf"),
    playFair: require("../src/assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf"),
    PlusJakartaSans: require("../src/assets/fonts/PlusJakartaSans-Regular.ttf"),
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <PortalProvider shouldAddRootHost>
          <SafeAreaProvider>
            <Provider store={store}>
              <GorhomPortalProvider>
                <BottomSheetModalProvider>
                  <AppInitializer>
                    {fontsLoaded ? (
                      // <ConfirmDialogProvider>
                      <Slot />
                    ) : (
                      // </ConfirmDialogProvider>
                      <View
                        flex={1}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <ActivityIndicator />
                      </View>
                    )}
                  </AppInitializer>
                </BottomSheetModalProvider>
              </GorhomPortalProvider>
            </Provider>
          </SafeAreaProvider>
        </PortalProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
