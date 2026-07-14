import { View } from "@tamagui/core";
import React from "react";
import { ActivityIndicator } from "react-native";

type AppLoadingProps = {
  overlay?: boolean;
};

const AppLoading: React.FC<AppLoadingProps> = ({ overlay = false }) => {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      {...(overlay
        ? {
            position: "absolute",
            t: 0,
            l: 0,
            r: 0,
            b: 0,
          }
        : {})}
    >
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AppLoading;
