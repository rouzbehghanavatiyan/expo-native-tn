import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Spinner, Text, Theme, XStack, YStack } from "tamagui";
import { useAppTheme } from "../hook/ThemeContext";
import { topScoreList } from "../services/masterServices";
import { getImageUrl } from "../utils/fileHelper";
import { logger } from "../utils/logger";
import ImageRank from "./ImageRank";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface TopUser {
  userId: number;
  userName: string;
  profile?: {
    id?: number;
    attachmentId?: number;
    attachmentType?: string;
    attachmentName?: string;
    fileName?: string;
    ext?: string;
    insertDate?: string;
  };
  score: number;
  time?: string;
  bio?: string;
  email?: string;
  location?: string;
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  users: TopUser[];
}

const TopScoreItem: React.FC<any> = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isDark } = useAppTheme();

  const [categories, setCategories] = useState<Category[]>([
    {
      id: "sport",
      title: "Top Sport Ranking",
      icon: <FontAwesome5 name="running" size={18} color="#FF7A00" />,
      users: [],
    },
  ]);

  const handleGetAllScore = async () => {
    setIsLoading(true);
    try {
      const res = await topScoreList();
      const { data, status } = res?.data || {};

      if (status === 0 && Array.isArray(data)) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === "sport"
              ? {
                  ...cat,
                  users: data,
                }
              : cat,
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching top scores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllScore();
  }, []);

  const handleProfileNavigation = (userTop: TopUser) => {
    if (!userTop?.userId) {
      console.warn("User ID not found for profile navigation");
      return;
    }

    const targetData = {
      profile: userTop?.profile,
      user: {
        userName: userTop?.userName,
        id: userTop?.userId,
      },
      score: userTop?.score,
      mail: userTop?.email,
      location: userTop?.location,
      bio: userTop?.bio,
    };

    logger.debug("Navigating with userData:", targetData);

    router.push({
      pathname: "/profile",
      params: {
        userData: JSON.stringify(targetData),
      },
    });
  };

  if (isLoading) {
    return (
      <YStack py="$4" ai="center" jc="center">
        <Spinner size="small" color="$primaryMain" />
      </YStack>
    );
  }

  const sportCategory = categories.find(
    (cat) => cat.id === "sport" && cat.users && cat.users.length > 0,
  );

  if (!sportCategory) {
    return null;
  }

  return (
    <Theme name={isDark ? "dark" : "light"}>
      <YStack mb="$3" mx="$3" gap="$2.5">
        {sportCategory.users.map((userTop: TopUser, index: number) => {
          const userInfo = {
            userProfile: userTop?.profile,
            user: {
              userName: userTop?.userName,
              id: userTop?.userId,
            },
            score: userTop?.score,
            bio: userTop?.bio,
            email: userTop?.email,
            location: userTop?.location,
          };

          return (
            <XStack
              key={userTop?.userId ? String(userTop.userId) : String(index)}
              ai="center"
              m={2}
              py={15}
              borderTopWidth={index === 0 ? 0 : 1}
              borderTopColor={isDark ? "#2A2A2A" : "#EEEEEE"}
              gap="$3"
              pressStyle={{ opacity: 0.75, scale: 0.985 }}
              cursor="pointer"
              onPress={() => handleProfileNavigation(userTop)}
            >
              <ImageRank
                userInfo={userInfo}
                imgSize={46}
                score={userTop?.score}
                imgSrc={getImageUrl(userTop?.profile)}
                onClickDisable={true} // کلیک از روی کل سطر هندل می‌شود
              />
              <YStack flex={1} jc="center" gap="$0.5">
                <Text
                  fontSize="$3"
                  fontWeight="700"
                  color="$textPrimary"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  letterSpacing={0.2}
                >
                  {userTop?.userName || "Anonymous"}
                </Text>

                <XStack ai="center" gap="$1">
                  <Text fontSize="$2" fontWeight="600" color="$primaryMain">
                    score: {userTop?.score}
                  </Text>
                </XStack>
              </YStack>
              <FontAwesome5
                name="chevron-right"
                size={12}
                color={isDark ? "#555" : "#CCC"}
              />
            </XStack>
          );
        })}
      </YStack>
    </Theme>
  );
};

export default TopScoreItem;
