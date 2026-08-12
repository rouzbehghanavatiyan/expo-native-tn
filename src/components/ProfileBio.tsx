import React, { useEffect, useState } from "react";
import { Image, Modal, Pressable, StyleSheet } from "react-native";
import { Progress, ScrollView, Text, View, XStack, YStack } from "tamagui";
import { getStatus } from "../services/nestServices";
import { Icon } from "./Icon";

const Started = require("../assets/ranks/starter.png");
const bronseBase1 = require("../assets/ranks/bronze1.png");
const bronseBase2 = require("../assets/ranks/bronze2.png");
const bronseBase3 = require("../assets/ranks/bronze3.png");
const silver1 = require("../assets/ranks/silver1.png");
const silver2 = require("../assets/ranks/silver2.png");
const silver3 = require("../assets/ranks/silver3.png");
const gold1 = require("../assets/ranks/gold1.png");
const gold2 = require("../assets/ranks/gold2.png");
const gold3 = require("../assets/ranks/gold3.png");
const gem1 = require("../assets/ranks/gem1.png");
const gem2 = require("../assets/ranks/gem2.png");
const gem3 = require("../assets/ranks/gem3.png");
const ruby1 = require("../assets/ranks/ruby1.png");
const ruby2 = require("../assets/ranks/ruby2.png");
const ruby3 = require("../assets/ranks/ruby3.png");
const word = require("../assets/ranks/worldMain.png");

interface ProfileBioProps {
  rankPercentage: number;
  rankScore: number;
}

const allRanks = [
  { name: "Starter", img: Started },
  { name: "Bronze 1", img: bronseBase1 },
  { name: "Bronze 2", img: bronseBase2 },
  { name: "Bronze 3", img: bronseBase3 },
  { name: "Silver 1", img: silver1 },
  { name: "Silver 2", img: silver2 },
  { name: "Silver 3", img: silver3 },
  { name: "Gold 1", img: gold1 },
  { name: "Gold 2", img: gold2 },
  { name: "Gold 3", img: gold3 },
  { name: "Gem 1", img: gem1 },
  { name: "Gem 2", img: gem2 },
  { name: "Gem 3", img: gem3 },
  { name: "Ruby 1", img: ruby1 },
  { name: "Ruby 2", img: ruby2 },
  { name: "Ruby 3", img: ruby3 },
  { name: "World", img: word },
];

// جدا کردن رنک اول از بقیه
const starterRank = allRanks[0];
const otherRanks = allRanks.slice(1);

const ProfileBio: React.FC<ProfileBioProps> = ({
  rankScore,
  rankPercentage,
}) => {
  const [fields, setFields] = useState<any>();
  const [showRanksModal, setShowRanksModal] = useState(false);

  const fetchCurrentStatus = async () => {
    try {
      const response = await getStatus();
      const { code, data } = response?.data;

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
      <Pressable
        style={{ width: "100%" }}
        onPress={() => setShowRanksModal(true)}
      >
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
            borderWidth={1}
            borderRadius="$4"
            borderColor="$grey400"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize={10} color="$grey900" zIndex={10}>
              {rankPercentage}%
            </Text>
          </View>
        </View>
      </Pressable>

      <Modal
        visible={showRanksModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRanksModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
        >
          {/* پس‌زمینه تاریک */}
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.45)" },
            ]}
            onPress={() => setShowRanksModal(false)}
          />

          {/* محتوای مودال */}
          <YStack
            width="100%"
            maxHeight="90%"
            bg="$background"
            borderRadius="$4"
            p="$5"
            pt="$7" /* پدینگ بالا را بیشتر کردیم تا با ضربدر تداخل نکند */
            elevation={6}
            position="relative"
          >
            {/* دکمه ضربدر گوشه بالا سمت راست */}
            <Pressable
              onPress={() => setShowRanksModal(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                padding: 8 /* برای بزرگ‌تر شدن فضای تاچ (Hitbox) */,
              }}
              hitSlop={8}
            >
              {/* اگر از lucide-icons استفاده می‌کنید می‌توانید <X size={24} color="gray" /> بگذارید */}
              <Text fontSize="$5" color="$color" fontWeight="bold">
                ✕
              </Text>
            </Pressable>

            {/* بخش اسکرول‌شونده */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {/* عنوان */}
              <YStack gap={8} alignItems="center" pb="$4">
                <Text fontSize="$5" fontWeight="700" color="$primaryMain">
                  All Ranks (Score: {rankScore})
                </Text>
              </YStack>

              {/* رنک استارتر */}
              <YStack
                alignItems="center"
                justifyContent="center"
                bg="$backgroundPaper"
                p="$2"
                borderRadius="$3"
                width={86}
                height={116}
                alignSelf="center"
                mb={16}
              >
                <Image
                  source={starterRank.img}
                  accessibilityLabel={starterRank.name}
                  style={styles.rankImage}
                  resizeMode="contain"
                />
                <Text
                  fontSize="$2"
                  mt="$2"
                  color="$textPrimary"
                  textAlign="center"
                  fontWeight="600"
                  numberOfLines={1}
                >
                  {starterRank.name}
                </Text>
              </YStack>

              {/* بقیه رنک‌ها (Grid) */}
              <XStack flexWrap="wrap" justifyContent="space-between" gap={8}>
                {otherRanks.map((rank) => (
                  <YStack
                    key={rank.name}
                    alignItems="center"
                    justifyContent="center"
                    bg="$backgroundPaper"
                    p="$2"
                    borderRadius="$3"
                    width="31%"
                    height={116}
                    mb={8}
                  >
                    <Image
                      source={rank.img}
                      accessibilityLabel={rank.name}
                      style={styles.rankImage}
                      resizeMode="contain"
                    />
                    <Text
                      fontSize="$2"
                      mt="$2"
                      color="$textPrimary"
                      textAlign="center"
                      fontWeight="600"
                      numberOfLines={1}
                    >
                      {rank.name}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </ScrollView>
          </YStack>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  rankImage: {
    width: 64,
    height: 64,
  },
});
