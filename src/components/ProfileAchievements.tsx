import React from "react";
import { Image, Text, XStack, YStack } from "tamagui";

const cupLevel = require("../assets/ranks/cup1.png");
const cup3 = require("../assets/ranks/cup1.png");
const cup4 = require("../assets/ranks/cup1.png");

const ProfileAchievements: React.FC = () => {
  const achievements = [
    { img: cupLevel, label: "City" },
    { img: cup3, label: "Country" },
    { img: cup4, label: "Region" },
  ];

  return (
    <XStack
      alignItems="center"
      borderBottomColor={"darkblue"}
      justifyContent="space-around"
      w="100%"
    >
      {achievements.map((cup, index) => (
        <YStack key={index} alignItems="center" justifyContent="flex-end">
          <Image
            source={cup.img}
            alt={`Cup ${cup.label}`}
            w={70}
            h={70}
            resizeMode="contain"
          />
          <Text fontWeight="bold" fontSize="$2" color="$textSecondary" mt="$1">
            {cup.label}
          </Text>
        </YStack>
      ))}
    </XStack>
  );
};

export default ProfileAchievements;
