import ProfileAchievements from "@/src/components/ProfileAchievements";
import ProfileBio from "@/src/components/ProfileBio";
import ProfileHeader from "@/src/components/ProfileHeader";
import { stopMatchTimer } from "@/src/components/TimerForFindMatch";
import { useLoadMore } from "@/src/components/useLoadMore";
import {
  profileAttachment,
  userAttachmentList,
} from "@/src/services/masterServices";
import { RsetProfileVideo } from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
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
  const myVideosInRedux =
    useAppSelector((state) => state?.main?.profileVideo) || [];
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const followerCountRedux = useAppSelector(
    (state) => state?.main?.followerLength,
  );
  const followingCountRedux = useAppSelector(
    (state) => state?.main?.followingLength,
  );
  const userIdWhantToShow = route.params?.userData;
  const [refreshing, setRefreshing] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});
  const [newProfile, setNewProfile] = useState<Record<string, number>>({});
  const flatListRef = useRef<FlatList<any>>(null);
  const dispatch = useAppDispatch();
  const isMyProfile =
    !userIdWhantToShow || userIdWhantToShow?.user?.id === userLogin?.user?.id;
  const [otherUserVideos, setOtherUserVideos] = useState<any[]>([]);
  const allVideoData = isMyProfile ? myVideosInRedux : otherUserVideos;

  const findImg: any = !!userIdWhantToShow?.user
    ? getImageUrl(userIdWhantToShow?.profile)
    : getImageUrl(userLogin?.profile);

  const targetUserId = userIdWhantToShow?.user?.id ?? userLogin?.user?.id;

  const fetchVideos = useCallback(
    async (params: { skip: number; take: number }) => {
      if (params.skip === 0 && isMyProfile && myVideosInRedux.length > 0) {
        return null;
      }
      return await userAttachmentList({ ...params, id: targetUserId });
    },
    [targetUserId, isMyProfile, myVideosInRedux.length],
  );

  const handleDataLoaded = useCallback(
    (newItems: any[], isFirstPage: boolean) => {
      if (!newItems) return; // اگر از fetchVideos مقدار null برگشت، کاری نکن

      if (isMyProfile) {
        // ذخیره در ریداکس فقط برای پروفایل خودمان
        if (isFirstPage) {
          dispatch(RsetProfileVideo(newItems));
        } else {
          dispatch(RsetProfileVideo([...myVideosInRedux, ...newItems]));
        }
      } else {
        // ذخیره در استیت لوکال برای پروفایل دیگران
        if (isFirstPage) {
          setOtherUserVideos(newItems);
        } else {
          setOtherUserVideos((prev) => [...prev, ...newItems]);
        }
      }
    },
    [dispatch, isMyProfile, myVideosInRedux],
  );
  const { loading, loadMore, hasMore } = useLoadMore(
    fetchVideos,
    handleDataLoaded,
    allVideoData?.length || 0,
  );
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const profileRes = await profileAttachment(userLogin?.user?.id);
      const userData = profileRes?.data;
      if (userData?.status === 0) {
        setNewProfile(userData?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const itsMatchingWithTimer = useMemo(() => {
    return allVideoData?.some(
      (item: any) =>
        item?.inviteInserted?.insertDate !== -1 ||
        item?.inviteMatched?.insertDate !== -1,
    );
  }, [allVideoData]);

  useEffect(() => {
    if (!itsMatchingWithTimer) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 230, animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [itsMatchingWithTimer]);

  useEffect(() => {
    const handleGetAddLike = (data: { userId: number; movieId: number }) => {
      logger.info("handleGetAddLike:", data);
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
  }, [socketClient]);

  console.log("userLogin", userLogin);

  useEffect(() => {
    const score = userIdWhantToShow?.score || userLogin?.score || 0;
    let calc = score <= 100 ? score : score % 100 || 100;
    setPercentage(Math.min(Math.max(calc, 1), 100));
  }, [userLogin?.score, userIdWhantToShow]);

  const renderHeader = () => (
    <YStack bg="$grey100" gap="$4" p="$2">
      <ProfileHeader
        userImage={getImageUrl(newProfile?.profile) || findImg}
        userName={
          userIdWhantToShow?.user?.userName || userLogin?.user?.userName
        }
        score={userIdWhantToShow?.score || userLogin?.score}
        followersCount={
          userIdWhantToShow?.followersCount ?? followerCountRedux?.count
        }
        followingCount={
          userIdWhantToShow?.followingCount ?? followingCountRedux?.count
        }
      />
      <ProfileBio
        rankScore={userIdWhantToShow?.score ?? userLogin?.userLogin?.score}
        rankPercentage={percentage}
      />
      <ProfileAchievements />
    </YStack>
  );

  const handlePlayVideo = useCallback((id: string | null) => {
    setActiveVideoId(id);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <YStack f={1} bg="$backgroundDefault">
        <FlatList
          data={allVideoData || []}
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
              profileWatch
              itsMatchingWithTimer={itsMatchingWithTimer}
              activeVideoId={activeVideoId}
              onPlay={handlePlayVideo}
              video={item}
              isActive
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
          onEndReached={() => {
            if (!loading && allVideoData && allVideoData.length > 0) {
              loadMore();
            }
          }}
          removeClippedSubviews
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      </YStack>
    </SafeAreaView>
  );
};

export default Profile;
