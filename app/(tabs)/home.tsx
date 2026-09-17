import { Icon } from "@/src/components/Icon";
import VideoSkeleton from "@/src/components/VideoSkeleton";
import ShowWatchSlide from "@/src/components/VideoSlide";
import { useShowWatch } from "@/src/hook/useShowWatch";
import { followerAttachmentList } from "@/src/services/masterServices";
import {
  appendHomeMatch,
  resetHomeMatch,
  setPaginationHomeMatch,
} from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { useHeaderHeight } from "@react-navigation/elements";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Comments from "../comments";

const HomeScreen: React.FC = () => {
  const hasFetchedOnce = useRef(false);
  const main = useAppSelector((state) => state.main);
  const { pagination, data: reduxData } = main.homeMatch;
  const userIdLogin = main?.userLogin?.user?.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const router = useRouter();

  const usableHeight =
    height - headerHeight - (Platform.OS === "android" ? 32 : 0);

  const [refreshing, setRefreshing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentPosition, setCommentPosition] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const dispatch = useAppDispatch();

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

  const onRefresh = async () => {
    if (!userIdLogin) return;
    setRefreshing(true);
    try {
      const freshData = await customFetchNextPage({
        skip: 0,
        take: 6,
        inviteId: userIdLogin,
      });

      dispatch(resetHomeMatch());

      if (freshData && freshData.length > 0) {
        dispatch(appendHomeMatch(freshData));
        dispatch(
          setPaginationHomeMatch({
            skip: freshData.length,
            take: 6,
            hasMore: freshData.length === 6,
          }),
        );
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const customFetchNextPage = useCallback(
    async (params: {
      skip: number;
      take: number;
      inviteId: string | undefined;
    }) => {
      if (!params.inviteId) return [];

      try {
        const res = await followerAttachmentList({
          skip: params.skip,
          take: params.take,
          userIdLogin: params.inviteId,
        });

        hasFetchedOnce.current = true;

        return res?.data?.data || [];
      } catch (error) {
        hasFetchedOnce.current = true;
        console.error("Error fetching data:", error);
        return [];
      }
    },
    [],
  );

  const {
    data,
    isLoading,
    openDropdowns,
    setOpenDropdowns,
    currentlyPlayingId,
    handleVideoPlay,
    toggleDropdown,
    dropdownItems,
    handleSlideChange,
  } = useShowWatch({
    inviteId: userIdLogin,
    data: reduxData,
    pagination,
    customFetchNextPage,
    paginationAction: setPaginationHomeMatch,
    resetAction: resetHomeMatch,
    appendAction: appendHomeMatch,
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      if (viewableItems && viewableItems.length > 0) {
        const visibleItem = viewableItems[0];
        if (visibleItem.index !== null) {
          setCurrentIndex(visibleItem.index);
          handleSlideChange(visibleItem.index);
        }
      }
    },
  ).current;

  const showInitialLoader =
    !hasFetchedOnce.current && (!data || data.length === 0);
  const showEmptyState =
    hasFetchedOnce.current && !isLoading && (!data || data.length === 0);

  const handleRedirectWatch = () => {
    router.replace("/(tabs)/watch");
  };

  return (
    <View style={styles.container}>
      {showInitialLoader ? (
        <VideoSkeleton count={1} section="itsHome" isSwapper={false} />
      ) : showEmptyState ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconInner}>
                <Icon name="locationSearching" size={32} color="#4F46E5" />
              </View>
            </View>

            <Text style={styles.emptyTitle}>No Content Available</Text>

            <Text style={styles.emptyText}>
              There are no posts from your followers right now. Visit the Watch
              page to discover new content and creators!
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={handleRedirectWatch}
            >
              <Icon name="start" color="white" />
              <Text style={styles.emptyButtonText}>Watch</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, width, height: usableHeight }}>
          <FlashList
            data={data || []}
            extraData={currentlyPlayingId}
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            pagingEnabled
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            renderItem={({ item, index }) => (
              <View style={{ width, height: usableHeight }}>
                <ShowWatchSlide
                  itemHeight={usableHeight}
                  showLiked={false}
                  showScore
                  showResult={true}
                  itsHome={true}
                  showCountLiked
                  video={item}
                  index={index}
                  currentlyPlayingId={currentlyPlayingId}
                  openDropdowns={openDropdowns}
                  handleVideoPlay={handleVideoPlay}
                  toggleDropdown={toggleDropdown}
                  dropdownItems={dropdownItems}
                  setOpenDropdowns={setOpenDropdowns}
                  handleToggleComments={handleOpenComments}
                />
              </View>
            )}
          />
        </View>
      )}
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
            userIdLogin={userIdLogin}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // پس‌زمینه خنثی و تمیزتر
  },
  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F6",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF", // رنگ پس‌زمینه بنفش/آبی ملایم
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B", // کنتراست بهتر برای خوانایی نسبت به رنگ قبلی
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#4F46E5",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },

  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default HomeScreen;
