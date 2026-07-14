import { Icon } from "@/src/components/Icon";
import ShowWatchSlide from "@/src/components/VideoSlide";
import { attachmentListByInviteId } from "@/src/services/masterServices";
import {
  RsetShowWatch,
  appendShowWatch,
  resetShowWatchState,
  setPaginationShowWatch,
} from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { logger } from "@/src/utils/logger";
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
  Dimensions,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShowWatchScreen() {
  const { inviteId } = useLocalSearchParams<{ inviteId: string }>();
  const dispatch = useAppDispatch();
  const { data, pagination } = useAppSelector(
    (state) => state.main.showWatchMatch,
  );
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
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
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [inviteId, dispatch],
  );

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    dispatch(resetShowWatchState());
    paginationRef.current = { take: 6, skip: 0, hasMore: true };
    fetchVideos(true);
  }, [inviteId, fetchVideos]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const visibleIndex = viewableItems[0]?.index ?? 0;
      setCurrentIndex(visibleIndex);
    }
  }).current;

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80,
    }),
    [],
  );

  logger.info("datadatadatadatadatadatadata", data?.icon);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item?.id ?? index}`}
          renderItem={({ item, index }) => (
            <View style={styles.page}>
              <ShowWatchSlide
                showLiked={true}
                video={item}
                endTime
                index={index}
                isActive={currentIndex === index}
              />
              <View style={styles.centerIcon}>
                <Icon
                  name={item?.icon}
                  color="rgba(255,255,255,0.45)"
                  size={20}
                />
              </View>
            </View>
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="start"
          getItemLayout={(_, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
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
    height: SCREEN_HEIGHT,
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

    backgroundColor: "rgba(0,0,0,0.25)", // اختیاری
  },
});
