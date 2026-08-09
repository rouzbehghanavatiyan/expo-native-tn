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
  handleVideoPlay,
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

  return (
    <>
      <View style={styles.half}>
        <VideoSection
          inviteWatch={inviteWatch}
          score={showScore ? video?.scoreInserted : null}
          result={showResult ? resultInserted : null}
          showLiked={showLiked}
          countLiked={showCountLiked ? video?.likeInserted : null}
          endTime={endTime}
          video={video}
          isPlaying={
            currentlyPlayingId === video?.attachmentInserted?.attachmentId
          }
          handleVideoPlay={handleVideoPlay}
          toggleDropdown={() => toggleDropdown(0)}
          dropdownItems={() => dropdownItems(video, 0, video?.userInserted)}
          handleToggleComments={handleToggleComments}
          setOpenDropdowns={setOpenDropdowns}
          openDropdowns={openDropdowns}
          positionVideo={0}
          isLiked={
            video?.likes?.[video?.attachmentInserted?.attachmentId]?.isLiked ||
            false
          }
        />
      </View>

      <View style={styles.half}>
        <VideoSection
          inviteWatch={inviteWatch}
          score={showScore ? video?.scoreMatched : null}
          result={showResult ? resultMatched : null}
          showLiked={showLiked}
          countLiked={showCountLiked ? video?.likeMatched : null}
          endTime={endTime}
          video={video}
          isPlaying={
            currentlyPlayingId === video?.attachmentMatched?.attachmentId
          }
          handleVideoPlay={handleVideoPlay}
          toggleDropdown={() => toggleDropdown(1)}
          dropdownItems={() => dropdownItems(video, 1, video?.userMatched)}
          handleToggleComments={handleToggleComments}
          setOpenDropdowns={setOpenDropdowns}
          openDropdowns={openDropdowns}
          positionVideo={1}
          isLiked={
            video?.likes?.[video?.attachmentMatched?.attachmentId]?.isLiked ||
            false
          }
        />
      </View>

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
    height: "50%",
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
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: "rgba(0,0,0,0.25)",
  },
});
