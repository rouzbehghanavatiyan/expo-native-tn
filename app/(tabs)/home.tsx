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
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Comments from "../comments";

const HomeScreen: React.FC = () => {
  const hasFetchedOnce = useRef(false);
  const main = useAppSelector((state) => state.main);
  const { pagination, data: reduxData } = main.homeMatch;
  const userIdLogin = main?.userLogin?.user?.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const headerHeight = useHeaderHeight();

  // ارتفاع قابل استفاده دقیقاً تا کف صفحه بدون کم کردن ارتفاع تب‌بار
  const usableHeight = height - headerHeight;

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

  return (
    <View style={styles.container}>
      {showInitialLoader ? (
        <VideoSkeleton count={1} section="itsHome" isSwapper={false} />
      ) : showEmptyState ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Content Available</Text>
            <Text style={styles.emptyText}>
              Dear user, there are no followers available to view at the moment.
              Please visit the Watch page to connect with more users!
            </Text>
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
    backgroundColor: "white",
  },
  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyCard: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default HomeScreen;
