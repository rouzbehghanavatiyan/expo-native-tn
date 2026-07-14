import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import Follows from "@/src/components/ui/Follows";
import { useFollow } from "@/src/hook/useFollow";
import { followerList } from "@/src/services/masterServices";
import { RsetAllFollowerList } from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";

const FollowerScreen = () => {
  const main = useAppSelector((state) => state.main);
  const dispatch = useAppDispatch();
  const followers = main?.allFollowerList || [];
  const router = useRouter();
  const params = useLocalSearchParams();
  const [followState, setFollowState] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const userIdLogin = main?.userLogin?.user?.id;
  const { isFollowed, toggleFollow, loadingId } = useFollow(userIdLogin);
  const userIdFromLocation = params?.id;

  const handleAllFollowers = async () => {
    try {
      setIsLoading(true);

      const targetUserId = userIdFromLocation || userIdLogin;
      if (!targetUserId) return;

      const res = await followerList(targetUserId);
      const { status, data } = res?.data || {};

      if (status === 0) {
        dispatch(RsetAllFollowerList(data || []));
      }
    } catch (error: any) {
      console.log("followerList error:", error?.message);
      console.log("followerList response:", error?.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleAllFollowers();
  }, [userIdFromLocation, userIdLogin]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View f={1} bg="$background">
        <MainTitle handleBack={() => router.back()} title="Followers" />

        {isLoading && <Spinner size="large" color="$orange10" />}

        {!isLoading && followers.length === 0 && (
          <YStack f={1} ai="center" jc="center">
            <Text fontSize="$6">There are no followers.</Text>
          </YStack>
        )}

        <ScrollView>
          {followers.map((follower: any, index: number) => {
            const followerId =
              follower?.attachment?.attachmentId ||
              follower?.userId ||
              follower?.id;
            const image = getImageUrl(follower?.attachment);

            const followed = isFollowed(followerId);
            const isLoadingThisButton = loadingId === followerId;

            return (
              <XStack
                key={index}
                p="$4"
                bc="$grey100"
                ai="center"
                jc="space-between"
                bg="$white"
              >
                <ImageRank
                  score={0}
                  imgSize={60}
                  userName={follower?.userName || "Unknown User"}
                  imgSrc={image}
                />
                <Follows
                  title={followed ? "Unfollow" : "Follow"}
                  onFollowClick={() => toggleFollow(followerId)}
                />
              </XStack>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default FollowerScreen;
