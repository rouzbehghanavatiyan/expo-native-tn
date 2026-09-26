import React from "react";
import { Pressable } from "react-native";
import { Text, View } from "tamagui";

interface PropTypes {
  onFollowClick?: () => void;
  title: string;
  bgColor?: string;
}

const Follows: React.FC<PropTypes> = ({
  onFollowClick,
  title,
  bgColor = "$color",
}) => {
  return (
    <View ai="center" jc="center">
      <Pressable onPress={onFollowClick}>
        <View
          px="$3"
          py="$2"
          bg="$backgroundPaper"
          borderRadius="$2"
          shadowColor="#0f0f0f"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.2}
          shadowRadius={10}
          style={{ elevation: 1 }}
        >
          <Text color={bgColor} fontWeight="500" fontSize={10}>
            {title}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default Follows;
