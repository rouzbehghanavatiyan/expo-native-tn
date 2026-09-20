import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Text, useTheme, View, XStack } from "tamagui";
import { getThemeColor } from "../hook/getThemeColor";

interface PropType {
  title: string;
  handleBack?: () => void;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}

const MainTitle: React.FC<PropType> = ({
  title,
  handleBack,
  rightComponent,
}) => {
  const theme = useTheme();
  const iconColor = getThemeColor(theme.textSecondary, "#7b8377");

  return (
    <XStack
      height={35}
      alignItems="center"
      justifyContent="space-between"
      bg="$backgroundPaper"
      borderTopWidth={1}
      borderBottomWidth={1}
      borderColor="$divider"
    >
      <View width={50} justifyContent="center" alignItems="flex-start">
        {handleBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={{ paddingHorizontal: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      <View flex={1} alignItems="center">
        <Text
          fontSize={15}
          fontWeight="bold"
          color="$textPrimary"
          fontFamily="PlusJakartaSans"
        >
          {title}
        </Text>
      </View>

      <View width={50} justifyContent="center" alignItems="flex-end">
        {rightComponent}
      </View>
    </XStack>
  );
};

export default MainTitle;
