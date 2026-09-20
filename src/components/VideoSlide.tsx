import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Icon } from "./Icon";
import VideoSection from "./VideoSection";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShowWatchSlide({
  video,
  currentlyPlayingId,
  itsHome,
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
  const findeVideoInTournomentTop = video?.attachmentMatched?.insertDate;
  const findeVideoInTournomentBott = video?.attachmentInserted?.insertDate;
  const getTimeNow = new Date();

  const getTimestamp = (dateString: any) => {
    if (!dateString) return 0;
    let fixedDate = dateString;
    if (!fixedDate.endsWith("Z") && fixedDate.indexOf("+") === -1) {
      fixedDate = `${fixedDate}+03:30`;
    }
    return new Date(fixedDate).getTime();
  };

  const timeTop = getTimestamp(findeVideoInTournomentTop);
  const timeBott = getTimestamp(findeVideoInTournomentBott);

  const latestTime = Math.max(timeTop, timeBott);

  const isTimeUp =
    latestTime > 0 ? new Date().getTime() - latestTime >= 120000 : false;

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
          itsHome={itsHome}
          inviteWatch={inviteWatch}
          score={showScore ? video?.scoreInserted : null}
          result={showResult || isTimeUp ? resultInserted : null}
          showLiked={showLiked}
          countLiked={showCountLiked ? video?.likeInserted : null}
          endTime={isTimeUp ? false : true}
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
      {video?.icon ? (
        <View style={styles.centerIcon}>
          <Icon
            name={video?.icon}
            color="rgba(255, 255, 255, 0.14)"
            size={20}
          />
        </View>
      ) : null}
      <View style={styles.half}>
        <VideoSection
          itsHome={itsHome}
          inviteWatch={inviteWatch}
          score={showScore ? video?.scoreMatched : null}
          result={showResult || isTimeUp ? resultMatched : null}
          showLiked={showLiked}
          countLiked={showCountLiked ? video?.likeMatched : null}
          endTime={isTimeUp ? false : true}
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
