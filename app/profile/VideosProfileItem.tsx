import TimerTornoment from "@/src/components/TimerTornoment";
import VideoSection from "@/src/components/VideoSection";
import { logger } from "@/src/utils/logger";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_WIDTH = (SCREEN_WIDTH - 30 * 2) * 0.6;
const VIDEO_HEIGHT = VIDEO_WIDTH * (345 / 200);
const ITEM_HEIGHT = VIDEO_HEIGHT * 2;

export default function VideosProfileItem({
  video,showCountLiked,
  itsMatchingWithTimer,
  videoLikes,
  activeVideoId,
  isActive = true,
  onPlay,
}: any) {
  const [playingPosition, setPlayingPosition] = React.useState<number>(-1);

  const startTime = video?.inviteMatched?.insertDate;

  const endTime =
    video?.inviteMatched?.insertDate !== -1 ||
    video?.inviteInserted?.insertDate !== -1;

  const resultInserted =
    video?.likeInserted > video?.likeMatched
      ? "Win"
      : video?.likeInserted < video?.likeMatched
        ? "Loss"
        : "Draw";

  const resultMatched =
    video?.likeInserted < video?.likeMatched
      ? "Win"
      : video?.likeInserted > video?.likeMatched
        ? "Loss"
        : "Draw";

  const videoSections = [
    {
      likeCount: video?.likeInserted,
      attachment: video?.attachmentInserted,
      position: 0,
      score: video?.scoreInserted,
      user: video?.userInserted,
      isLiked:
        video?.likes?.[video?.attachmentInserted?.attachmentId]?.isLiked ||
        false,
      result: resultInserted,
    },
    {
      likeCount: video?.likeMatched,
      attachment: video?.attachmentMatched,
      position: 1,
      score: video?.scoreMatched,
      user: video?.userMatched,
      isLiked:
        video?.likes?.[video?.attachmentMatched?.attachmentId]?.isLiked ||
        false,
      result: resultMatched,
    },
  ];

  console.log(endTime,videoLikes);

  return (
    <View style={styles.container}>
      {videoSections.map((section, index) => {
        const videoId = `${video?.inviteInserted?.id ?? video?.inviteMatched?.id}-${section.position}`;
        const isPlaying = activeVideoId === videoId;

        return (
          <View key={index} style={styles.half}>
            <VideoSection
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
              endTime
              isPlaying={isActive && playingPosition === section.position}
              onVideoPlay={() => {
                if (isPlaying) {
                  onPlay(null);
                } else {
                  onPlay(videoId);
                }
              }}
            />

            {endTime && (
              <View style={styles.timerOverlay}>
                <View style={styles.timerBox}>
                  <TimerTornoment
                    video={video}
                    startTime={startTime}
                    duration={3600}
                    active={true}
                    onComplete={() => {}}
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
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
    top: "97%",
    zIndex: 50,
    alignItems: "center",
  },
  timerBox: {
    width: "83%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
