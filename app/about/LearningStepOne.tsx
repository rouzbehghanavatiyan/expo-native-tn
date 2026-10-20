import Logo from "@/src/assets/intrduce.png";
import React from "react";
import { Dimensions } from "react-native";
import { Image, Text, YStack } from "tamagui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_SIZE = Math.min(SCREEN_WIDTH * 0.75, 400);

interface LearningStepOneProps {
  title?: string;
  description?: string;
}

const LearningStepOne: React.FC<LearningStepOneProps> = ({
  title = "An easy way to grow",
  description = "Find yourself with your peers.",
}) => {
  return (
    <YStack flex={1} w="100%" ai="center" jc="center" py="$5" gap="$5">
      <YStack ai="center" gap="$2" px="$2">
        <Text fontSize="$5" fontWeight="bold" ta="center" color="$textPrimary">
          "Clash Talent"
        </Text>
      </YStack>
      <YStack width={IMAGE_SIZE} height={IMAGE_SIZE} ai="center" jc="center">
        {/* <Image
          source={Logo}
          width="100%"
          height="100%"
          resizeMode="contain"
          alt="Introduce"
        /> */}

        <Image
          resizeMethod="auto"
          src={Logo}
          width="100%"
          height="100%"
          alt="Introduce"
        />
      </YStack>
      <YStack ai="center" gap="$2" px="$2">
        <Text fontSize="$5" fontWeight="bold" ta="center" color="$textPrimary">
          {title}
        </Text>
        <Text fontSize="$3" ta="center" color="$textSecondary">
          {description}
        </Text>
      </YStack>
    </YStack>
  );
};

export default LearningStepOne;
