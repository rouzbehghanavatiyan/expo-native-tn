import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import Follows from "@/src/components/ui/Follows";
import { useFollow } from "@/src/hook/useFollow";
import { followingList } from "@/src/services/masterServices";
import { RsetAllFollowingList } from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import asyncWrapper from "@/src/utils/asyncWrapper";
import { getImageUrl } from "@/src/utils/fileHelper";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";

const Following = () => {
  const main = useAppSelector((state) => state.main);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const userIdLogin = main?.userLogin?.user?.id;
  const userIdFromLocation = params?.id;

  const following = main?.allFollowingList || [];

  const { isFollowed, toggleFollow, loadingId } = useFollow(userIdLogin);

  const handleAllFollowing = asyncWrapper(
    async () => {
      setIsLoading(true);

      const targetUserId = userIdFromLocation || userIdLogin;
      if (!targetUserId) return;

      const res = await followingList(targetUserId);
      const { status, data } = res?.data;

      if (status === 0) {
        dispatch(RsetAllFollowingList(data));
      }
    },
    () => setIsLoading(false),
  );

  useEffect(() => {
    handleAllFollowing();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View f={1} bg="$background">
        <MainTitle handleBack={() => router.back()} title="Following" />

        {isLoading && <Spinner size="large" color="$orange10" />}

        {!isLoading && following.length === 0 && (
          <YStack f={1} ai="center" jc="center">
            <Text fontSize="$6">There are no following.</Text>
          </YStack>
        )}

        <ScrollView>
          {following.map((user: any, index: number) => {
            const userId =
              user?.attachment?.attachmentId || user?.userId || user?.id;

            const image = getImageUrl(user?.attachment);

            const followed = isFollowed(userId);
            const isLoadingThisButton = loadingId === userId;

            return (
              <XStack
                key={index}
                p="$4"
                bc="$grey100"
                my={1}
                ai="center"
                jc="space-between"
                bg="$white"
              >
                <ImageRank
                  score={0}
                  imgSize={50}
                  userName={user?.userName || "Unknown User"}
                  imgSrc={image}
                />
                <Follows
                  title={followed ? "Unfollow" : "Follow"}
                  onFollowClick={() => toggleFollow(userId)}
                />
              </XStack>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Following;
