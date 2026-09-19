import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Spinner, Text, XStack, YStack } from "tamagui";
import { topScoreList } from "../services/masterServices";
import { getImageUrl } from "../utils/fileHelper";
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
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  users: TopUser[];
}

interface TopScoreItemProps {
  onUserPress?: (user: TopUser) => void;
}

const TopScoreItem: React.FC<TopScoreItemProps> = ({ onUserPress }) => {
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
      {sportCategory.users.map((userTop, index) => {
        const userInfo = {
          userProfile: userTop?.profile,
          user: {
            userName: userTop?.userName,
            id: userTop?.userId,
          },
          score: userTop?.score,
        };

        return (
          <XStack
            key={userTop?.userId ? String(userTop.userId) : String(index)}
            ai="center"
            gap="$3"
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            onPress={() => onUserPress && onUserPress(userTop)}
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
