import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import VideoSection from "./VideoSection";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShowWatchSlide({
  video,
  currentlyPlayingId,
  openDropdowns,
  onVideoPlay,
  toggleDropdown,
  dropdownItems,
  setOpenDropdowns,
  handleToggleComments,
  endTime,
  showScore,
  showResult,
  showLiked,
  showCountLiked,
}: any) {
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
    <>
      {videoSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.half}>
          <VideoSection
            externalIsLiked={showLiked ? true : false}
            score={showScore ? section?.score : null}
            result={showResult ? section?.result : null}
            showLiked={showLiked ? true : false}
            countLiked={showCountLiked ? section?.likeCount : null}
            endTime={endTime}
            video={video}
            isPlaying={currentlyPlayingId === section.attachment?.attachmentId}
            onVideoPlay={() => onVideoPlay(section.attachment?.attachmentId)}
            toggleDropdown={() => toggleDropdown(section.position)}
            dropdownItems={() =>
              dropdownItems(video, section.position, section.user)
            }
            handleToggleComments={handleToggleComments}
            setOpenDropdowns={setOpenDropdowns}
            openDropdowns={openDropdowns}
            positionVideo={section.position}
            isLiked={section.isLiked}
          />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  half: {
    height: 1 / 2,
    position: "relative",
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
});
