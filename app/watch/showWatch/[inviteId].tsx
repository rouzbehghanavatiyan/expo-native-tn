import VideoSkeleton from "@/src/components/VideoSkeleton";
import ShowWatchSlide from "@/src/components/VideoSlide";
import { useShowWatch } from "@/src/hook/useShowWatch";
import { attachmentListByInviteId } from "@/src/services/masterServices";
import {
  RsetShowWatch,
  appendShowWatch,
  resetShowWatchState,
  setPaginationShowWatch,
} from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BOTTOM_PADDING = Platform.OS === "ios" ? 0 : 2;

export default function ShowWatchScreen() {
  const { inviteId } = useLocalSearchParams<{ inviteId: string }>();
  const dispatch = useAppDispatch();
  const hasFetchedOnce = useRef(false);

  const { data: reduxData, pagination } = useAppSelector(
    (state) => state.main.showWatchMatch,
  );
  const [loading, setLoading] = useState(false);

  const [containerHeight, setContainerHeight] = useState(
    Dimensions.get("window").height,
  );

  const loadingRef = useRef(false);
  const paginationRef = useRef(pagination);

  const fetchVideos = useCallback(
    async (reset = false) => {
      if (!inviteId) return;

      const inviteIdNumber = Number(inviteId);
      if (Number.isNaN(inviteIdNumber)) return;

      if (loadingRef.current) return;

      const currentPagination = paginationRef.current;
      if (!reset && !currentPagination.hasMore) return;

      try {
        loadingRef.current = true;
        setLoading(true);

        const currentSkip = reset ? 0 : currentPagination.skip;
        const currentTake = currentPagination.take || 6;

        const res = await attachmentListByInviteId({
          skip: currentSkip,
          take: currentTake,
          inviteId: inviteIdNumber,
        });

        const newData = res?.data || [];

        if (reset) {
          dispatch(RsetShowWatch(newData));
        } else {
          dispatch(appendShowWatch(newData));
        }

        dispatch(
          setPaginationShowWatch({
            take: currentTake,
            skip: currentSkip + currentTake,
            hasMore: newData.length === currentTake,
          }),
        );
      } catch (error: any) {
        console.log("error:", error?.message);
      } finally {
        hasFetchedOnce.current = true;
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [inviteId, dispatch],
  );

  useEffect(() => {
    hasFetchedOnce.current = false;
    dispatch(resetShowWatchState());
    paginationRef.current = { take: 6, skip: 0, hasMore: true };
    fetchVideos(true);
  }, [inviteId, fetchVideos]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const {
    data,
    isLoading,
    currentlyPlayingId,
    handleVideoPlay,
    handleSlideChange,
    openDropdowns,
    setOpenDropdowns,
    toggleDropdown,
    dropdownItems,
  } = useShowWatch({
    inviteId: inviteId ? Number(inviteId) : 0,
    data: reduxData,
    pagination,
    customFetchNextPage: () => fetchVideos(false),
    paginationAction: setPaginationShowWatch,
    resetAction: resetShowWatchState,
    appendAction: appendShowWatch,
  });

  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const visibleIndex = viewableItems[0]?.index ?? 0;
      handleSlideChange(visibleIndex);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const showInitialLoader =
    !hasFetchedOnce.current && (!data || data.length === 0);
  const showEmptyState =
    hasFetchedOnce.current && !loading && (!data || data.length === 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={styles.container}
        onLayout={(event) =>
          setContainerHeight(event.nativeEvent.layout.height - BOTTOM_PADDING)
        }
      >
        {showInitialLoader ? (
          <VideoSkeleton count={1} section="itsShowWatch" isSwapper={false} />
        ) : showEmptyState ? (
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Content Available</Text>
              <Text style={styles.emptyText}>
                There are no videos available to view at the moment.
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item, index) => `${item?.id ?? index}`}
            renderItem={({ item, index }) => (
              <View style={[styles.page, { height: containerHeight }]}>
                <ShowWatchSlide
                  inviteWatch={true}
                  showResult={true}
                  video={item}
                  index={index}
                  currentlyPlayingId={currentlyPlayingId}
                  handleVideoPlay={handleVideoPlay}
                  openDropdowns={openDropdowns}
                  setOpenDropdowns={setOpenDropdowns}
                  toggleDropdown={toggleDropdown}
                  dropdownItems={dropdownItems}
                />
              </View>
            )}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            snapToAlignment="start"
            getItemLayout={(_, index) => ({
              length: containerHeight,
              offset: containerHeight * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onEndReached={() => fetchVideos(false)}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? <ActivityIndicator size="small" color="#fff" /> : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  page: {
    backgroundColor: "#000",
  },
  centerIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 999,
    width: 40,
    height: 40,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#000",
  },
  emptyCard: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#1c1c1e",
    shadowColor: "#000",
    shadowOpacity: 0.3,
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
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#aaa",
    textAlign: "center",
  },
});
