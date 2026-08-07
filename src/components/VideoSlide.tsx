import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Icon } from "./Icon";
import VideoSection from "./VideoSection";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShowWatchSlide({
  video,
  currentlyPlayingId,
  inviteWatch,
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

  console.log("video?.icon", video?.icon);

  return (
    <>
      {videoSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.half}>
          <VideoSection
            inviteWatch={inviteWatch}
            score={showScore ? section?.score : null}
            result={showResult ? section?.result : null}
            showLiked={showLiked}
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
      <View style={styles.centerIcon}>
        {video?.icon ? (
          <Icon
            name={video?.icon}
            color="rgba(255, 255, 255, 0.14)"
            size={20}
          />
        ) : null}
      </View>
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
  centerIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 999,
    width: 40,
    height: 40,
    borderRadius: 32,
    // borderWidth: 1,
    // borderColor: "rgba(110, 110, 110, 0.09)",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: "rgba(0,0,0,0.25)",
  },
});
