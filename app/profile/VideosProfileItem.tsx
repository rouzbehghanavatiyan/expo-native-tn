import TimerTornoment from "@/src/components/TimerTornoment";
import VideoSection from "@/src/components/VideoSection";
import { logger } from "@/src/utils/logger";
import React, { memo, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import MatchInfoCard, { MatchResult } from "./MatchInfoCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HORIZONTAL_PADDING = 30;
const VIDEO_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2) * 0.6;
const VIDEO_HEIGHT = VIDEO_WIDTH * (345 / 200);
const ITEM_HEIGHT = VIDEO_HEIGHT * 2;

const VideosProfileItem = ({
  video,
  showCountLiked,
  itsMatchingWithTimer,
  videoLikes,
  profileWatch,
  activeVideoId,
  handleToggleComments,
  isActive = true,
  onPlay,
  onMatchExpired,
}: any) => {
  const endAt = video?.matchEndAt ?? null;
  const showTimer = !!endAt;
  logger.info("videovideovideovideovideovideovideovideovideovideovideovideo", video?.matchRemainingSeconds)
  const insertedId = video?.attachmentInserted?.attachmentId;
  const matchedId = video?.attachmentMatched?.attachmentId;

  const insertedLikes = Math.max(
    0,
    (video?.likeInserted ?? 0) + (insertedId ? (videoLikes?.[insertedId] ?? 0) : 0),
  );
  const matchedLikes = Math.max(
    0,
    (video?.likeMatched ?? 0) + (matchedId ? (videoLikes?.[matchedId] ?? 0) : 0),
  );

  const resultInserted: MatchResult =
    insertedLikes > matchedLikes ? "Win" : insertedLikes < matchedLikes ? "Loss" : "Draw";
  const resultMatched: MatchResult =
    matchedLikes > insertedLikes ? "Win" : matchedLikes < insertedLikes ? "Loss" : "Draw";

  const videoSections = useMemo(
    () => [
      {
        likeCount: insertedLikes,
        attachment: video?.attachmentInserted,
        position: 0,
        score: video?.scoreInserted,
        result: resultInserted,
        isLiked: video?.likes?.[insertedId]?.isLiked ?? false,
      },
      {
        likeCount: matchedLikes,
        attachment: video?.attachmentMatched,
        position: 1,
        score: video?.scoreMatched,
        result: resultMatched,
        isLiked: video?.likes?.[matchedId]?.isLiked ?? false,
      },
    ],
    [video, insertedLikes, matchedLikes, resultInserted, resultMatched, insertedId, matchedId],
  );

  const leftSide = {
    userName: video?.userInserted?.userName,
    profile: video?.profileInserted,
    likes: insertedLikes,
    score: video?.scoreInserted ?? 0,
    result: resultInserted,
  };
  const rightSide = {
    userName: video?.userMatched?.userName,
    profile: video?.profileMatched,
    likes: matchedLikes,
    score: video?.scoreMatched ?? 0,
    result: resultMatched,
  };

  const inviteId = video?.inviteInserted?.id ?? video?.inviteMatched?.id;
  const isAnyPlaying =
    isActive &&
    (activeVideoId === `${inviteId}-0` || activeVideoId === `${inviteId}-1`);

  return (
    <View style={styles.container}>
      <View style={styles.videosWrapper}>
        {videoSections.map((section) => {
          const videoId = `${inviteId}-${section.position}`;
          const isPlaying = isActive && activeVideoId === videoId;
          return (
            <View key={videoId} style={styles.half}>
              <VideoSection
                handleToggleComments={handleToggleComments}
                profileWatch={profileWatch}
                showCountLiked={showCountLiked}
                itsMatchingWithTimer={itsMatchingWithTimer}
                activeVideoId={activeVideoId}
                video={video}
                handleVideoPlay={onPlay}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                videoLikes={videoLikes}
                attachment={section.attachment}
                positionVideo={section.position}
                score={section.score}
                result={section.result}
                countLiked={section.likeCount}
                isLiked={section.isLiked}
                showLiked
                endTime={showTimer}
                isPlaying={isPlaying}
                onVideoPlay={() => onPlay(isPlaying ? null : videoId)}
              />
            </View>
          );
        })}
        {showTimer && (
          <View pointerEvents="box-none" style={styles.timerOverlay}>
            <View style={styles.timerBox}>
              <TimerTornoment
                endAt={endAt}
                active={isActive}
                onComplete={() => {
                  if (isAnyPlaying) onPlay(null);
                  onMatchExpired?.();
                }}
              />
            </View>
          </View>
        )}
      </View>

      <MatchInfoCard left={leftSide} right={rightSide} isLive={showTimer} />
    </View>
  );
};

export default memo(VideosProfileItem);

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  videosWrapper: {
    height: ITEM_HEIGHT,
    position: "relative",
    backgroundColor: "#000",
  },
  half: {
    height: VIDEO_HEIGHT,
    position: "relative",
  },
  timerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    alignItems: "center",
  },
  timerBox: { width: "83%", alignItems: "center", justifyContent: "center" },
});