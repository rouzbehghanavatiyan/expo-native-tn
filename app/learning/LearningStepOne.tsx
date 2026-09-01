import Logo from "@/src/assets/images/logocircle.png";
import React from "react";
import { Image, Text, YStack } from "tamagui";

const LearningStepOne: React.FC = () => {
  return (
    <YStack w="100%" gap="$4" ai="center" pt="$5" px="$4">
      <Image src={Logo} width={100} height={100} borderRadius={50} alt="Logo" />

      <Text
        fontSize="$6"
        fontWeight="bold"
        ta="center" // text-align: center+
        color="$textPrimary"
      >
        Personalized talent connections at your fingertips
      </Text>

      <Text fontSize="$4" ta="center" color="$textSecondary">
        Easy to navigate, visually appealing design.
      </Text>
    </YStack>
  );
};

export default LearningStepOne;
