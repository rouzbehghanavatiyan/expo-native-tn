import { Icon } from "@/src/components/Icon";
import VideoSkeleton from "@/src/components/VideoSkeleton";
import ShowWatchSlide from "@/src/components/VideoSlide";
import { getThemeColor } from "@/src/hook/getThemeColor";
import { useShowWatch } from "@/src/hook/useShowWatch";
import { followerAttachmentList } from "@/src/services/masterServices";
import {
  appendHomeMatch,
  resetHomeMatch,
  setPaginationHomeMatch,
} from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import HomeHelper from "@/src/utils/HomeHelper";
import { logger } from "@/src/utils/logger";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { RefreshControl, useWindowDimensions } from "react-native";
import {
  Button,
  Paragraph,
  ScrollView,
  Text,
  useTheme,
  View,
  YStack
} from "tamagui";
import Comments from "../comments";

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const hasFetchedOnce = useRef(false);
  const main = useAppSelector((state) => state.main);
  const { pagination, data: reduxData } = main.homeMatch;

  const userIdLogin = main?.userLogin?.user?.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [containerHeight, setContainerHeight] = useState(0);
  const primaryColor = getThemeColor(theme.primary, "#4F46E5");

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
        logger.info("res?.data?.data", res?.data?.data);

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
    <View flex={1} bg="$background">
      {showInitialLoader ? (
        <VideoSkeleton count={1} section="itsHome" isSwapper={false} />
      ) : showEmptyState ? (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
        >
          <YStack flex={1} ai="center" jc="center" px="$6" w="100%">
            <YStack
              w="100%"
              maxWidth={360}
              bg="$backgroundPaper"
              borderRadius={50}
              py="$6"
              px="$6"
              ai="center"
            >
              <View
                w={80}
                h={80}
                borderRadius={40}
                bg="$primaryLight"
                ai="center"
                jc="center"
                mb="$5"
              >
                <View
                  w={60}
                  h={60}
                  borderRadius={30}
                  bg="$primaryHover"
                  ai="center"
                  jc="center"
                >
                  <Icon name="locationSearching" size={32} color={primaryColor} />
                </View>
              </View>

              <Text
                fontSize="$5"
                fontWeight="700"
                color="$color"
                mb="$2"
                textAlign="center"
                letterSpacing={-0.3}
              >
                No Content Available
              </Text>

              <Paragraph
                fontSize="$3"
                lineHeight={22}
                color="$colorMuted"
                textAlign="center"
                mb="$6"
              >
                There are no posts from your followers right now. Visit the Watch
                page to discover new content and creators!
              </Paragraph>

              <YStack w="100%" gap="$3">
                {/* دکمه Watch */}
                <Button
                  w="100%"
                  h={48}
                  bg="$indigoLight"
                  pressStyle={{ opacity: 0.8 }}
                  borderRadius="$4"
                  p={0}
                  position="relative"
                  jc="center"
                  ai="center"
                  onPress={handleRedirectWatch}
                  shadowColor="$primary"
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={0.25}
                  shadowRadius={8}
                  elevation={3}
                >
                  <View position="absolute" left={16} jc="center" ai="center">
                    <Icon name="start" color="$backgroundPaper" size={20} />
                  </View>
                  <Text
                    fontSize={15}
                    fontWeight="600"
                    color="$backgroundPaper"
                    textAlign="center"
                    includeFontPadding={false}
                  >
                    Watch
                  </Text>
                </Button>

                {/* دکمه Refresh */}
                <Button
                  w="100%"
                  h={48}
                  bg="transparent"
                  borderWidth={1}
                  borderColor="$borderColor"
                  pressStyle={{ opacity: 0.7, bg: "$backgroundHover" }}
                  borderRadius="$4"
                  p={0}
                  position="relative"
                  jc="center"
                  ai="center"
                  disabled={refreshing}
                  onPress={onRefresh}
                >
                  <View position="absolute" left={16} jc="center" ai="center">
                    <Icon name="refresh" size={18} color="$color" />
                  </View>
                  <Text
                    fontSize={15}
                    fontWeight="600"
                    color="$color"
                    textAlign="center"
                    includeFontPadding={false}
                  >
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </Text>
                </Button>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      ) : (
        <View
          flex={1}
          width={width}
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            if (h > 0 && h !== containerHeight) setContainerHeight(h);
          }}
        >
          {containerHeight > 0 && (
            <FlashList
              data={data || []}
              extraData={[currentlyPlayingId, containerHeight]}
              keyExtractor={(item: any, index) => item?.id?.toString() || index.toString()}
              pagingEnabled
              snapToInterval={containerHeight}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum
              refreshing={refreshing}
              onRefresh={onRefresh}
              showsVerticalScrollIndicator={false}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={onViewableItemsChanged}
              renderItem={({ item, index }) => (
                <View width={width} height={containerHeight}>
                  <ShowWatchSlide
                    itemHeight={containerHeight}
                    showLiked={false}
                    showScore
                    showResult
                    itsHome
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
          )}
          <HomeHelper enabled={data.length > 0} />
        </View>
      )}
      {showComments && (
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={9999}
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

export default HomeScreen;