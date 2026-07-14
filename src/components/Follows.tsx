import React from "react";
import { Text, View } from "tamagui";

interface PropTypes {
  onFollowClick: () => void;
  title: string;
  bgColor?: string;
}

const Follows: React.FC<PropTypes> = ({
  onFollowClick,
  title,
  bgColor = "white",
}) => {
  const textColor = bgColor === "text-white" ? "white" : bgColor;

  return (
    <View alignItems="center" justifyContent="center">
      <View
        onPress={onFollowClick}
        py="$1"
        px="$3"
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.7 }} // افکت ساده هنگام کلیک
        cursor="pointer"
      >
        <Text fontWeight="bold" fontSize={12} color={textColor as any}>
          {title}
        </Text>
      </View>
    </View>
  );
};

export default Follows;
