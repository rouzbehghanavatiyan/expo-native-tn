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
        <View px="$3" py="$2" bg="$white">
          <Text color={bgColor} fontWeight="500" fontSize={13}>
            {title}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default Follows;
