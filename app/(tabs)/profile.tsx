import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { View, YStack } from "tamagui";

import ProfileAchievements from "@/src/components/ProfileAchievements";
import ProfileBio from "@/src/components/ProfileBio";
import ProfileHeader from "@/src/components/ProfileHeader";
import { stopMatchTimer } from "@/src/components/TimerForFindMatch";
import { useLoadMore } from "@/src/components/useLoadMore";
import { useShowWatch } from "@/src/hook/useShowWatch";
import {
  followerLength,
  followingLength,
  profileAttachment,
  userAttachmentList,
} from "@/src/services/masterServices";
import {
  RsetFollowerLength,
  RsetFollowingLength,
  RsetProfileVideo,
} from "@/src/slices/main";
import { setNeedProfileRefresh } from "@/src/slices/video";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import { socketClient } from "@/src/utils/socketClient";

import Comments from "../comments";
import VideosProfileItem from "../profile/VideosProfileItem";

const Profile: React.FC = () => {
  const params = useLocalSearchParams<{ userData?: string }>();
  const userIdWhantToShow = useMemo(() => {
    try {
      return typeof params.userData === "string"
        ? JSON.parse(params.userData)
        : params.userData;
    } catch (e) {
      logger.error("Failed to parse userData param in Profile", e);
      return null;
    }
  }, [params.userData]);

  logger.info("params", userIdWhantToShow);

  const myVideosInRedux =
    useAppSelector((state) => state?.main?.profileVideo) || [];
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const followerCountRedux = useAppSelector(
    (state) => state?.main?.followerLength,
  );
  const needProfileRefresh = useAppSelector(
    (state) => state?.video?.needProfileRefresh,
  );
  const followingCountRedux = useAppSelector(
    (state) => state?.main?.followingLength,
  );

  const [showComments, setShowComments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});
  const [newProfile, setNewProfile] = useState<Record<string, number>>({});
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [commentPosition, setCommentPosition] = useState(0);
  const [otherUserVideos, setOtherUserVideos] = useState<any[]>([]);
  const flatListRef = useRef<FlatList<any>>(null);
  const dispatch = useAppDispatch();

  const targetUserId = userIdWhantToShow?.user?.id || userLogin?.user?.id;
  const isMyProfile = targetUserId === userLogin?.user?.id;
  const allVideoData = isMyProfile ? myVideosInRedux : otherUserVideos;

  const findImg = userIdWhantToShow?.user
    ? getImageUrl(userIdWhantToShow?.profile)
    : getImageUrl(userLogin?.profile);

  const handleOpenComments = useCallback((video: any, position: number) => {
    setSelectedVideo(video);
    setCommentPosition(position ?? 0);
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
    setSelectedVideo(null);
    setCommentPosition(0);
  }, []);

  const fetchVideos = useCallback(
    async (paginationParams: { skip: number; take: number }) => {
      if (
        paginationParams.skip === 0 &&
        isMyProfile &&
        myVideosInRedux.length > 0
      ) {
        return null;
      }
      return await userAttachmentList({
        ...paginationParams,
        id: targetUserId,
      });
    },
    [targetUserId, isMyProfile, myVideosInRedux.length],
  );

  const handleDataLoaded = useCallback(
    (newItems: any[], isFirstPage: boolean) => {
      if (!newItems) return;

      if (isMyProfile) {
        if (isFirstPage) {
          dispatch(RsetProfileVideo(newItems));
        } else {
          dispatch(RsetProfileVideo([...myVideosInRedux, ...newItems]));
        }
      } else {
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

  const {
    openDropdowns,
    setOpenDropdowns,
    currentlyPlayingId,
    handleVideoPlay,
    toggleDropdown,
    dropdownItems,
  } = useShowWatch({
    inviteId: targetUserId,
    data: allVideoData,
    pagination: { skip: allVideoData.length, take: 10, hasMore },
    customFetchNextPage: async () => {
      if (!loading && hasMore) {
        await loadMore();
      }
    },
  });

  const onRefresh = async () => {
    if (!targetUserId) return;
    setRefreshing(true);
    try {
      const promises: Promise<any>[] = [
        userAttachmentList({
          skip: 0,
          take: 10,
          id: targetUserId,
        }),
        followingLength(targetUserId)
          .then((res) => {
            dispatch(RsetFollowingLength(res?.data?.data));
          })
          .catch((err) =>
            console.error("❌ Following Length Error:", err?.message),
          ),
        followerLength(targetUserId)
          .then((res) => {
            dispatch(RsetFollowerLength(res?.data?.data));
          })
          .catch((err) =>
            console.error("❌ Follower Length Error:", err?.message),
          ),
      ];

      if (isMyProfile) {
        promises.push(
          profileAttachment(userLogin?.user?.id).then((profileRes) => {
            const userData = profileRes?.data;
            if (userData?.status === 0) {
              setNewProfile(userData?.data);
            }
          }),
        );
      }

      const [videosRes] = await Promise.all(promises);

      const freshVideos = videosRes?.data?.data || videosRes?.data || videosRes;

      if (freshVideos && Array.isArray(freshVideos)) {
        if (isMyProfile) {
          dispatch(RsetProfileVideo(freshVideos));
        } else {
          setOtherUserVideos(freshVideos);
        }
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isMyProfile) {
      setOtherUserVideos([]);
    }

    if (targetUserId) {
      onRefresh();
    }
  }, [targetUserId]);

  const itsMatchingWithTimer = useMemo(() => {
    return allVideoData?.some(
      (item: any) =>
        item?.inviteInserted?.insertDate !== -1 ||
        item?.inviteMatched?.insertDate !== -1,
    );
  }, [allVideoData]);

  useEffect(() => {
    if (needProfileRefresh) {
      onRefresh();
      dispatch(setNeedProfileRefresh(false));
    }
  }, [needProfileRefresh]);

  useEffect(() => {
    if (!itsMatchingWithTimer) return;

    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted && flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 230, animated: true });
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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
  }, []);

  useEffect(() => {
    const score = userIdWhantToShow?.score || userLogin?.score || 0;
    let calc = score <= 100 ? score : score % 100 || 100;
    setPercentage(Math.min(Math.max(calc, 1), 100));
  }, [userLogin?.score, userIdWhantToShow]);

  // اضافه کردن useCallback و مقادیر پیش‌فرض (?? 0)
  const renderHeader = useCallback(
    () => (
      <YStack bg="$grey100" gap="$4" p="$2">
        <ProfileHeader
          userImage={getImageUrl(userIdWhantToShow?.profile) || findImg}
          userName={
            userIdWhantToShow?.user?.userName || userLogin?.user?.userName
          }
          isMyProfile={isMyProfile}
          score={userIdWhantToShow?.score || userLogin?.score}
          followersCount={
            userIdWhantToShow?.followersCount ?? followerCountRedux?.count ?? 0
          }
          followingCount={
            userIdWhantToShow?.followingCount ?? followingCountRedux?.count ?? 0
          }
        />
        <ProfileBio
          userLogin={isMyProfile ? userLogin : userIdWhantToShow}
          rankScore={userIdWhantToShow?.score ?? userLogin?.score}
          rankPercentage={percentage}
        />
        <ProfileAchievements />
      </YStack>
    ),
    [
      userIdWhantToShow,
      userLogin,
      isMyProfile,
      percentage,
      followerCountRedux?.count,
      followingCountRedux?.count,
      findImg,
    ],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <YStack f={1} bg="$black">
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
              profileWatch={true}
              itsMatchingWithTimer={itsMatchingWithTimer}
              activeVideoId={currentlyPlayingId}
              onPlay={handleVideoPlay}
              video={item}
              isActive={true}
              videoLikes={videoLikes}
              openDropdowns={openDropdowns}
              setOpenDropdowns={setOpenDropdowns}
              toggleDropdown={toggleDropdown}
              dropdownItems={dropdownItems}
              handleToggleComments={handleOpenComments}
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
      {showComments && (
        <View
          style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }]}
          pointerEvents="auto"
        >
          <Comments
            visible={showComments}
            onClose={handleCloseComments}
            video={selectedVideo}
            positionVideo={commentPosition}
            userIdLogin={userLogin?.user?.id}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Profile;
