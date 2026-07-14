import React from "react";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import { getImageUrl } from "../utils/fileHelper";
import ImageRank from "./ImageRank";

const TopScoreItem = ({ categories }: any) => {
  return (
    <>
      {categories?.map((category: any) => (
        <YStack key={category.id} mb="$3">
          <XStack ai="center" borderColor="$divider" pt="$2" pb="$2" px="$1">
            <YStack width={40} height={40} ai="center" jc="center">
              {category.icon}
            </YStack>
            <Text fontSize="$4" fontWeight="700">
              {category.title}
            </Text>
          </XStack>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack px="$2">
              {category.users?.map((userTop: any, index: number) => {
                const userInfo = {
                  userProfile: userTop?.profile,
                  user: {
                    userName: userTop?.userName,
                    id: userTop?.userId,
                  },
                  score: userTop?.score,
                };

                return (
                  <YStack key={userTop?.userId ?? index} width={95} ai="center">
                    <ImageRank
                      userInfo={userInfo}
                      imgSize={65}
                      score={userTop?.score}
                      imgSrc={getImageUrl(userTop?.profile)}
                    />
                    <Text mt="$2" fontSize="$3" ta="center" numberOfLines={1}>
                      {userTop?.userName}
                    </Text>
                    {!!userTop?.time && (
                      <Text fontSize="$2" color="$textSecondary">
                        {userTop?.time}
                      </Text>
                    )}
                  </YStack>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>
      ))}
    </>
  );
};

export default TopScoreItem;
