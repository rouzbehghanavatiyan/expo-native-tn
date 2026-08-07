import TimerTornoment from "@/src/components/TimerTornoment";
import VideoSection from "@/src/components/VideoSection";
import React, { memo, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

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
  isActive = true,
  onPlay,
}: any) => {
  const matchedInsertDate = video?.inviteMatched?.insertDate;
  const insertedInsertDate = video?.inviteInserted?.insertDate;

  const startTime = matchedInsertDate ?? insertedInsertDate;

  const hasValidInsertDate = (value: unknown) =>
    value !== undefined && value !== null && value !== -1 && value !== "";

  const showTimer =
    hasValidInsertDate(matchedInsertDate) ||
    hasValidInsertDate(insertedInsertDate);

  const resultInserted =
    video?.likeInserted > video?.likeMatched
      ? "Win"
      : video?.likeInserted < video?.likeMatched
        ? "Loss"
        : "Draw";

  const resultMatched =
    video?.likeMatched > video?.likeInserted
      ? "Win"
      : video?.likeMatched < video?.likeInserted
        ? "Loss"
        : "Draw";

  const videoSections = useMemo(
    () => [
      {
        likeCount: video?.likeInserted ?? 0,
        attachment: video?.attachmentInserted,
        position: 0,
        score: video?.scoreInserted,
        user: video?.userInserted,
        isLiked:
          video?.likes?.[video?.attachmentInserted?.attachmentId]?.isLiked ??
          false,
        result: resultInserted,
      },
      {
        likeCount: video?.likeMatched ?? 0,
        attachment: video?.attachmentMatched,
        position: 1,
        score: video?.scoreMatched,
        user: video?.userMatched,
        isLiked:
          video?.likes?.[video?.attachmentMatched?.attachmentId]?.isLiked ??
          false,
        result: resultMatched,
      },
    ],
    [video, resultInserted, resultMatched],
  );

  return (
    <View style={styles.container}>
      {videoSections.map((section) => {
        console.log("section", section);

        const inviteId = video?.inviteInserted?.id ?? video?.inviteMatched?.id;
        const videoId = `${inviteId}-${section.position}`;
        const isPlaying = isActive && activeVideoId === videoId;

        return (
          <View key={videoId} style={styles.half}>
            <VideoSection
              profileWatch={profileWatch}
              showCountLiked={showCountLiked}
              itsMatchingWithTimer={itsMatchingWithTimer}
              activeVideoId={activeVideoId}
              video={video}
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
              onVideoPlay={() => {
                onPlay(isPlaying ? null : videoId);
              }}
            />

            {showTimer && startTime && (
              <View pointerEvents="box-none" style={styles.timerOverlay}>
                <View style={styles.timerBox}>
                  <TimerTornoment
                    video={video}
                    startTime={startTime}
                    duration={3600}
                    active={isActive}
                    onComplete={() => {
                      if (isPlaying) {
                        onPlay(null);
                      }
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default memo(VideosProfileItem);

const styles = StyleSheet.create({
  container: { height: ITEM_HEIGHT, backgroundColor: "#000", marginTop: 10 },
  half: { height: VIDEO_HEIGHT, position: "relative" },
  timerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 4,
    zIndex: 50,
    alignItems: "center",
  },
  timerBox: { width: "83%", alignItems: "center", justifyContent: "center" },
});
