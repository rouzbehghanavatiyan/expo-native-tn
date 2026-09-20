import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Spinner, Text, XStack, YStack } from "tamagui";
import { topScoreList } from "../services/masterServices";
import { getImageUrl } from "../utils/fileHelper";
import { logger } from "../utils/logger";
import ImageRank from "./ImageRank";

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

  // 🔴 تغییر اصلی اینجاست 🔴
  const handleProfileNavigation = (userTop: TopUser) => {
    if (!userTop?.userId) {
      console.warn("User ID not found for profile navigation");
      return;
    }

    // ساختار دیتا دقیقاً مشابه چیزی است که صفحه پروفایل انتظار دارد دریافت کند
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
        userData: JSON.stringify(targetData), // پاس دادن به عنوان رشته JSON
      },
    });
  };

  if (isLoading) {
    return (
      <YStack py="$4" ai="center" jc="center">
        <Spinner size="small" color="$orange10" />
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
    <YStack mb="$3" m={20} gap={12}>
      {sportCategory.users.map((userTop: any, index) => {
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
            gap="$3"
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            onPress={() => handleProfileNavigation(userTop)}
            cursor="pointer"
          >
            <ImageRank
              userInfo={userInfo}
              imgSize={50}
              score={userTop?.score}
              imgSrc={getImageUrl(userTop?.profile)}
            />
            <YStack jc="center">
              <Text
                fontSize="$3"
                fontWeight="600"
                numberOfLines={1}
                color="$grey900"
              >
                {userTop?.userName}
              </Text>
              <Text fontSize="$2" color="$gray10">
                {userTop?.score ?? 0} pts
              </Text>
            </YStack>
          </XStack>
        );
      })}
    </YStack>
  );
};

export default TopScoreItem;
