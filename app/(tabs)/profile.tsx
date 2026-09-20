import { useFocusEffect, useLocalSearchParams } from "expo-router";
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
import { Text, useTheme, View, YStack } from "tamagui";

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
  RsetUserLogin,
} from "@/src/slices/main";
import { setNeedProfileRefresh } from "@/src/slices/video";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { logger } from "@/src/utils/logger";
import { socketClient } from "@/src/utils/socketClient";

import { Icon } from "@/src/components/Icon";
import { getThemeColor } from "@/src/hook/getThemeColor";
import Comments from "../comments";
import VideosProfileItem from "../profile/VideosProfileItem";

const Profile: React.FC = () => {
  const params = useLocalSearchParams<{ userData?: string }>();
  const theme = useTheme();
  const screenBackground = getThemeColor(theme.background, "#fff");

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
  const myUserName = userLogin?.user?.userName;
  const myProfileImage = userLogin?.profile;
  const myScore = userLogin?.score;
  const [showComments, setShowComments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [commentPosition, setCommentPosition] = useState(0);
  const [otherUserVideos, setOtherUserVideos] = useState<any[]>([]);
  const flatListRef = useRef<FlatList<any>>(null);
  const dispatch = useAppDispatch();
  const userLoginRef = useRef(userLogin);
  useEffect(() => {
    userLoginRef.current = userLogin;
  }, [userLogin]);

  const myUserId = userLogin?.user?.id;

  const targetUserId = userIdWhantToShow?.user?.id || userLogin?.user?.id;
  const isMyProfile = targetUserId === userLogin?.user?.id;

  const [otherUserData, setOtherUserData] = useState<any>(userIdWhantToShow);
  const currentProfile = isMyProfile
    ? userLogin
    : otherUserData || userIdWhantToShow;

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

  const refreshMyProfileAttachment = useCallback(async () => {
    if (!isMyProfile || !myUserId) return;
    try {
      const profileRes = await profileAttachment(myUserId);
      const resData = profileRes?.data;
      const freshUserData = resData?.data || resData;
      if (freshUserData) {
        dispatch(RsetUserLogin({ ...userLoginRef.current, ...freshUserData }));
      }
    } catch (err) {
      logger.error("profileAttachment refresh error:", err);
    }
  }, [isMyProfile, myUserId, dispatch]);

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

      if (isMyProfile && userLogin?.user?.id) {
        promises.push(refreshMyProfileAttachment());
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

  useFocusEffect(
    useCallback(() => {
      refreshMyProfileAttachment();
    }, [refreshMyProfileAttachment]),
  );

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
  }, [currentProfile?.score]);

  useEffect(() => {
    if (!isMyProfile && userIdWhantToShow) {
      setOtherUserData(userIdWhantToShow);
    }
  }, [userIdWhantToShow, isMyProfile]);

  const currentProfileMemo = useMemo(
    () => ({
      id: currentProfile?.user?.id ?? currentProfile?.id,
      userName: currentProfile?.user?.userName ?? currentProfile?.userName,
      profile: currentProfile?.profile,
      score: currentProfile?.score,
      isFollowedByMe: currentProfile?.isFollowedByMe,
    }),
    [
      currentProfile?.user?.id,
      currentProfile?.id,
      currentProfile?.user?.userName,
      currentProfile?.userName,
      currentProfile?.profile,
      currentProfile?.score,
      currentProfile?.isFollowedByMe,
    ],
  );

  const renderHeader = useCallback(
    () => (
      <YStack bg="$background" gap="$4" p="$2">
        <ProfileHeader
          userImage={getImageUrl(userIdWhantToShow?.profile) || findImg}
          userName={userIdWhantToShow?.user?.userName || myUserName}
          isMyProfile={isMyProfile}
          score={userIdWhantToShow?.score || myScore}
          currentProfile={currentProfileMemo}
          followersCount={
            userIdWhantToShow?.followersCount ?? followerCountRedux?.count ?? 0
          }
          followingCount={
            userIdWhantToShow?.followingCount ?? followingCountRedux?.count ?? 0
          }
        />
        <ProfileBio
          isMyProfile={isMyProfile}
          userLogin={currentProfile}
          rankScore={currentProfile?.score}
          rankPercentage={percentage}
        />
        <ProfileAchievements />
      </YStack>
    ),
    [
      userIdWhantToShow,
      isMyProfile,
      percentage,
      followerCountRedux?.count,
      followingCountRedux?.count,
      findImg,
      myUserName,
      myProfileImage,
      myScore,
      currentProfileMemo,
      currentProfile,
    ],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBackground }}>
      {/* این بخش، محل نمایش ویدیوهاست و همیشه پس‌زمینه‌ی مشکی داره؛ عمداً از تم روشن/تاریک اپ مستقل نگه داشته شده */}
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
          ListEmptyComponent={
            !loading ? (
              <YStack
                alignItems="center"
                justifyContent="center"
                mt={60}
                mx={20}
                px={24}
                py={36}
                borderRadius={24}
                backgroundColor="rgba(255, 255, 255, 0.03)"
                borderWidth={1}
                borderColor="#4F46E5"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 12 }}
                shadowOpacity={0.35}
                shadowRadius={24}
                gap={20}
                pressStyle={{ opacity: 0.85, scale: 0.98 }}
                cursor="pointer"
                // onPress={(e: any) => {
                //   if (!isMyProfile) return;
                //   e.preventDefault();
                //   handlePickMedia();
                // }}
              >
                <View
                  width={76}
                  height={76}
                  borderRadius={38}
                  backgroundColor="#81818125"
                  borderWidth={1}
                  borderColor="#4F46E5"
                  alignItems="center"
                  justifyContent="center"
                  shadowColor="#8B5CF6"
                  shadowOffset={{ width: 0, height: 0 }}
                  shadowOpacity={0.4}
                  shadowRadius={14}
                >
                  <Icon name="locationSearching" size={32} color="#4F46E5" />
                </View>

                <YStack alignItems="center" gap={8} px={8}>
                  <Text
                    fontSize={18}
                    fontWeight="700"
                    color="white"
                    letterSpacing={0.3}
                  >
                    No Matches Yet
                  </Text>
                  <Text
                    fontSize={13.5}
                    color="#9CA3AF"
                    textAlign="center"
                    lineHeight={22}
                  >
                    {isMyProfile
                      ? "You haven't matched with any users yet. Start exploring and create your first match!"
                      : "This user doesn't have any video matches right now."}
                  </Text>
                </YStack>
              </YStack>
            ) : null
          }
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
