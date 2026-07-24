import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import {
  Image,
  Popover,
  Progress,
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { getStatus } from "../services/nestServices";
import { Icon } from "./Icon";

const Started = require("../assets/ranks/starter.png");
const bronseBase1 = require("../assets/ranks/bronze.png");
const bronseBase2 = require("../assets/ranks/bronze.png");
const bronseBase3 = require("../assets/ranks/bronze.png");
const silver1 = require("../assets/ranks/silver.png");
const silver2 = require("../assets/ranks/silver.png");
const silver3 = require("../assets/ranks/silver.png");
const gold1 = require("../assets/ranks/gold.png");
const gold2 = require("../assets/ranks/gold.png");
const gold3 = require("../assets/ranks/gold.png");
const ruby = require("../assets/ranks/ruby.png");
const word = require("../assets/ranks/world.png");

interface ProfileBioProps {
  rankPercentage: number;
  rankScore: number;
}

const rankCategories = [
  {
    title: "Starter",
    ranks: [{ name: "Starter", img: Started }],
  },
  {
    title: "Bronze",
    ranks: [
      { name: "Bronze 1", img: bronseBase1 },
      { name: "Bronze 2", img: bronseBase2 },
      { name: "Bronze 3", img: bronseBase3 },
    ],
  },
];

const ProfileBio: React.FC<ProfileBioProps> = ({
  rankScore,
  rankPercentage,
}) => {
  const [fields, setFields] = useState<any>();

  const fetchCurrentStatus = async () => {
    try {
      const response = await getStatus();
      const { code, message, data } = response?.data;

      if (code === 0) {
        setFields(data);
      }
    } catch (error) {
      console.log("Error fetching status:", error);
    }
  };

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  return (
    <YStack px="$4" alignItems="center" w="100%">
      <Popover size="$5" allowFlip placement="bottom">
        <Popover.Trigger asChild>
          <Pressable style={{ width: "100%" }}>
            <View
              w="100%"
              h={16}
              bg="$backgroundHover"
              borderRadius="$4"
              overflow="hidden"
              position="relative"
            >
              <Progress value={rankPercentage} h={16} bg="transparent">
                <Progress.Indicator bg="$indigoDark" />
              </Progress>
              <View
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                border="1"
                borderRadius="$4"
                borderColor="$grey400"
                justifyContent="center"
                alignItems="center"
              >
                <Text
                  fontWeight="bold"
                  fontSize={10}
                  color="$grey900"
                  zIndex={10}
                >
                  {rankPercentage}%
                </Text>
              </View>
            </View>
          </Pressable>
        </Popover.Trigger>

        <Popover.Content
          borderWidth={1}
          borderColor="$borderColor"
          w={280}
          elevate
        >
          <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

          <View
            onPress={() => console.log("Rank Score clicked")}
            p="$2"
            cursor="pointer"
          >
            <XStack
              gap="$2"
              alignItems="center"
              w="100%"
              justifyContent="center"
            >
              <Text color="$textSecondary">Total Score:</Text>
              <Text fontSize="$5" fontWeight="bold" color="$primaryMain">
                {rankScore}
              </Text>
            </XStack>
          </View>

          <Separator my="$2" />

          <View px="$2" py="$1" maxHeight={300} overflow="scroll">
            {rankCategories.map((category, index) => (
              <YStack key={index} mb="$3">
                <Text
                  fontSize="$2"
                  fontWeight="bold"
                  color="$textMuted"
                  mb="$2"
                >
                  {category.title}
                </Text>

                <XStack gap="$4" alignItems="center">
                  {category.ranks.map((rank, rankIndex) => (
                    <View
                      key={rankIndex}
                      flex={1}
                      onPress={() => console.log(`${rank.name} clicked`)}
                      cursor="pointer"
                    >
                      <YStack
                        alignItems="center"
                        bg="$backgroundPaper"
                        p="$2"
                        borderRadius="$2"
                      >
                        <Image
                          source={rank.img}
                          alt={rank.name}
                          w={32}
                          h={32}
                          resizeMode="contain"
                        />
                        <Text
                          fontSize={10}
                          mt="$1"
                          color="$textPrimary"
                          textAlign="center"
                        >
                          {rank.name}
                        </Text>
                      </YStack>
                    </View>
                  ))}
                </XStack>
              </YStack>
            ))}
          </View>
        </Popover.Content>
      </Popover>

      <YStack w="100%" mt="$5" alignItems="flex-start" gap="$3">
        {fields?.bio && (
          <Text color="$textPrimary" fontSize="$3" lineHeight={20} mb="$1">
            {fields?.bio}
          </Text>
        )}

        {fields?.location && (
          <XStack alignItems="center" gap="$2">
            <Icon name="location-on" size={16} color="#777777" />
            <Text color="$textSecondary" fontSize="$3">
              {fields?.location}
            </Text>
          </XStack>
        )}

        {fields?.website && (
          <XStack alignItems="center" gap="$2">
            <Icon name="language" size={16} color="#007aff" />
            <Text fontWeight="600" color="$infoMain" fontSize="$3">
              {fields?.website}
            </Text>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
};

export default ProfileBio;
