import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../hook/ThemeContext";
import { getColors } from "../hook/themeColors";
import { useMatchOpen } from "../hook/useMatchOpen";
import { logger } from "../utils/logger";
import { Icon } from "./Icon";
import VideoSection from "./VideoSection";
const ONE_HOUR_MS = 60 * 60 * 1000; // 3,600,000 میلی‌ثانیه (۱ ساعت)

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
  showScore,
  showResult,
  showLiked,
  showCountLiked,
}: any) {
  const findeVideoInTournomentTop = video?.attachmentMatched?.insertDate;
  const findeVideoInTournomentBott = video?.attachmentInserted?.insertDate;
  const { isDark } = useAppTheme();
  const colors = getColors(isDark);
  const isOpen = useMatchOpen(video?.matchEndAt);
  const votingOpen = isOpen && !video?.isFinished;

  const styles = useMemo(() => createStyles(colors), [isDark]);
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
    latestTime > 0 ? new Date().getTime() - latestTime >= 3600000 : false;

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

  logger.info("vvvvvvvvvvvvvvvvvvvvvvvvvvvvv", video);

  return (
    <>
      <View style={styles.half}>
        <VideoSection
          itsHome={itsHome}
          inviteWatch={inviteWatch}
          score={showScore ? video?.scoreInserted : null}
          result={showResult || !votingOpen ? resultInserted : null} // پایینی: resultMatched
          endTime={votingOpen}
          showLiked={showLiked}
          countLiked={showCountLiked ? video?.likeInserted : null}
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
          <Icon name={video?.icon} color={colors.centerIconColor} size={20} />
        </View>
      ) : null}
      <View style={styles.half}>
        <VideoSection
          result={showResult || !votingOpen ? resultInserted : null}
          endTime={votingOpen}
          itsHome={itsHome}
          inviteWatch={inviteWatch}
          score={showScore ? video?.scoreMatched : null}
          showLiked={showLiked}
          countLiked={showCountLiked ? video?.likeMatched : null}
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

const createStyles = (c: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    half: {
      height: "50%",
      position: "relative",
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: c.divider,
      backgroundColor: c.videoBg,
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
      backgroundColor: c.centerIconBg,
    },
  });
