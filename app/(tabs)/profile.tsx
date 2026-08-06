import ProfileAchievements from "@/src/components/ProfileAchievements";
import ProfileBio from "@/src/components/ProfileBio";
import ProfileHeader from "@/src/components/ProfileHeader";
import { stopMatchTimer } from "@/src/components/TimerForFindMatch";
import { useLoadMore } from "@/src/components/useLoadMore";
import { userAttachmentList } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { socketClient } from "@/src/utils/socketClient";
import { useRoute } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, FlatList, SafeAreaView } from "react-native";
import { View, YStack } from "tamagui";
import VideosProfileItem from "../profile/VideosProfileItem";

const Profile: React.FC = () => {
  const route = useRoute<any>();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const followerCountRedux = useAppSelector(
    (state) => state?.main?.allFollowerList?.length ?? 0,
  );
  const followingCountRedux = useAppSelector(
    (state) => state?.main?.allFollowingList?.length ?? 0,
  );
  const userIdWhantToShow = route.params?.userData;
  const [refreshing, setRefreshing] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});
  const flatListRef = useRef<FlatList<any>>(null);

  const findImg: any = !!userIdWhantToShow?.user
    ? getImageUrl(userIdWhantToShow?.profile)
    : getImageUrl(userLogin?.profile);

  const targetUserId = userIdWhantToShow?.user?.id ?? userLogin?.user?.id;

  const fetchVideos = useCallback(
    async (params: { skip: number; take: number }) => {
      const response = await userAttachmentList({
        ...params,
        id: targetUserId,
      });
      console.log("REsponse", response);

      return response?.data ?? [];
    },
    [targetUserId],
  );
  const { items, loading, loadMore } = useLoadMore(fetchVideos);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const itsMatchingWithTimer = useMemo(() => {
    console.log("userLogin", userLogin);

    return items?.some(
      (item: any) =>
        item?.inviteInserted?.insertDate !== -1 ||
        item?.inviteMatched?.insertDate !== -1,
    );
  }, [userLogin]);

  console.log(
    "itsMatchingWithTimer itsMatchingWithTimer itsMatchingWithTimer",
    itsMatchingWithTimer,
  );

  useEffect(() => {
    if (!itsMatchingWithTimer) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 230, animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [itsMatchingWithTimer]);

  useEffect(() => {
    const handleGetAddLike = (data: { userId: number; movieId: number }) => {
      setVideoLikes((prev) => ({
        ...prev,
        [data.movieId]: (prev[data.movieId] || 0) + 1,
      }));
    };

    const handleGetRemoveLike = (data: { userId: number; movieId: number }) => {
      setVideoLikes((prev) => ({
        ...prev,
        [data.movieId]: (prev[data.movieId] || 0) - 1,
      }));
    };

    if (socketClient?.on) {
      socketClient.on("add_liked_response", handleGetAddLike);
      socketClient.on("remove_liked_response", handleGetRemoveLike);
    }
    return () => {
      stopMatchTimer();
      if (socketClient) {
        socketClient.off("add_liked_response", handleGetAddLike);
        socketClient.off("remove_liked_response", handleGetRemoveLike);
      }
    };
  }, []);

  useEffect(() => {
    const score = userIdWhantToShow?.score || userLogin?.score || 0;
    let calc = score <= 100 ? score : score % 100 || 100;
    setPercentage(Math.min(Math.max(calc, 1), 100));
  }, [userLogin?.score, userIdWhantToShow]);

  const renderHeader = () => (
    <YStack bg="$grey100" gap="$4" p="$2">
      <ProfileHeader
        userImage={findImg}
        userName={
          userIdWhantToShow?.user?.userName || userLogin?.user?.userName
        }
        score={userIdWhantToShow?.score || userLogin?.score}
        followersCount={
          userIdWhantToShow?.followersCount ?? followerCountRedux?.length ?? 0
        }
        followingCount={
          userIdWhantToShow?.followingCount ?? followingCountRedux?.length ?? 0
        }
      />
      <ProfileBio
        rankScore={userIdWhantToShow?.score ?? userLogin?.userLogin?.score}
        rankPercentage={percentage}
      />
      <ProfileAchievements />
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <YStack f={1} bg="$backgroundDefault">
        <FlatList
          data={items || []}
          keyExtractor={(item, index) =>
            (
              item?.inviteInserted?.id ??
              item?.inviteMatched?.id ??
              index
            ).toString()
          }
          ref={flatListRef}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <VideosProfileItem
              showLiked={true}
              itsMatchingWithTimer={itsMatchingWithTimer}
              activeVideoId={activeVideoId}
              onPlay={(id: string | null) => setActiveVideoId(id)}
              video={item}
              videoLikes={videoLikes}
            />
          )}
          onEndReachedThreshold={0.5}
          initialNumToRender={3}
          ListFooterComponent={
            loading ? (
              <View style={{ padding: 16, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          onEndReached={loadMore}
          removeClippedSubviews
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      </YStack>
    </SafeAreaView>
  );
};

export default Profile;
