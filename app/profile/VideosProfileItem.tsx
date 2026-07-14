import VideoSection from "@/src/components/VideoSection";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const VIDEO_WIDTH = 200;
const VIDEO_HEIGHT = 500;
const ITEM_HEIGHT = VIDEO_HEIGHT * 2;

export default function VideosProfileItem({
  endTime,
  video,
  videoLikes,
  activeVideoId,
  isActive = true,
  onPlay,
}: any) {
  const [playingPosition, setPlayingPosition] = React.useState<number>(-1);

  const handleVideoPlay = (position: number) => {
    setPlayingPosition((prev) => (prev === position ? -1 : position));
  };

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

  return (
    <View style={styles.container}>
      {videoSections.map((section, index) => {
        const uniqueId = `${video.id}-${section.position}`;
        const isCurrentlyPlaying = activeVideoId === uniqueId;
        const videoId = `${video.inviteInserted.id}-${section.position}`;
        const isPlaying = activeVideoId === videoId;
        return (
          <View key={index} style={styles.half}>
            <VideoSection
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
    // برای جلوگیری از بهم خوردن سایز به خاطر border، بهتر است از مرز داخلی یا عدم استفاده از آن در حالت مربع استفاده کنید
    // borderBottomWidth: 1,
    // borderBottomColor: "#111",
  },
});
`1`;
