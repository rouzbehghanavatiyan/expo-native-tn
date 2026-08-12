import React, { memo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useAppSelector } from "../store/reduxHookType";
import { getImageUrl } from "../utils/fileHelper";
import OptionBottom from "./OptionBottom";
import OptionTop from "./OptionTop";
import CustomVideo from "./ui/CustomVideo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VideoSection = ({
  score,
  profileWatch,
  handleVideoPlay,
  showCountLiked,
  itsMatchingWithTimer,
  videoLikes,
  isFollowed: externalIsFollowed,
  endTime,
  video,
  inviteWatch,
  showLiked,
  setOpenDropdowns,
  result,
  toggleDropdown,
  dropdownItems,
  openDropdowns,
  isPlaying,
  positionVideo,
  handleToggleComments,
  itsHome,
}: any) => {
  const main = useAppSelector((state) => state.main);
  const userIdLogin = main?.userLogin?.user?.id;
  const socket = main?.socketConfig;

  const videoId =
    positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;

  const videoUrl =
    positionVideo === 0
      ? getImageUrl(video?.attachmentInserted)
      : getImageUrl(video?.attachmentMatched);

  if (!videoUrl) {
    return <View style={styles.placeholder} />;
  }
  return (
    <View style={styles.container}>
      <OptionTop
        main={main}
        video={video}
        userIdLogin={userIdLogin}
        positionVideo={positionVideo}
        openDropdowns={openDropdowns}
        score={score}
        setOpenDropdowns={setOpenDropdowns}
        toggleDropdown={toggleDropdown}
        dropdownItems={dropdownItems}
      />
      <View style={styles.videoContainer}>
        <View style={styles.videoCenter}>
          <CustomVideo
            videoId={videoId}
            positionVideo={positionVideo}
            onVideoPlay={() => handleVideoPlay(videoId)}
            uri={videoUrl}
            isPlaying={isPlaying}
          />
          <OptionBottom
            itsHome={itsHome}
            videoLikes={videoLikes}
            profileWatch={profileWatch}
            inviteWatch={inviteWatch}
            showCountLiked={showCountLiked}
            itsMatchingWithTimer={itsMatchingWithTimer}
            userIdLogin={userIdLogin}
            video={video}
            endTime={endTime}
            result={result}
            showLiked={showLiked}
            positionVideo={positionVideo}
            countLiked={
              positionVideo === 0 ? video?.likeInserted : video?.likeMatched
            }
            handleToggleComments={() =>
              handleToggleComments(video, positionVideo)
            }
          />
        </View>
      </View>
    </View>
  );
};

export default memo(VideoSection); // ✅ اینجا memo اضافه شد

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    position: "relative",
    flexDirection: "column",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  videoCenter: {
    position: "relative",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1900ff",
    overflow: "hidden",
  },
  video: { width: SCREEN_WIDTH, height: "100%" },
  placeholder: {
    width: SCREEN_WIDTH,
    height: "100%",
    backgroundColor: "#00ff0d",
  },
});
