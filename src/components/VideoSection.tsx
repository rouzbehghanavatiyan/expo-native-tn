import React, { memo, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import BlockedVideo from "../common/BlockedVideo";
import { useAppSelector } from "../store/reduxHookType";
import { getImageUrl } from "../utils/fileHelper";
import { Icon } from "./Icon";
import OptionBottom from "./OptionBottom";
import OptionTop from "./OptionTop";
import CustomVideo from "./ui/CustomVideo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const VideoSection = ({
  score,
  onVideoPlay,
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
  const [isFullScreen, setIsFullScreen] = useState(false);

  const isBlocked =
    positionVideo === 0
      ? Boolean(video?.isBlockedInserted)
      : Boolean(video?.isBlockedMatched);

  const blockedUser =
    positionVideo === 0 ? video?.userInserted : video?.userMatched;

  const videoId =
    positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;

  const videoUrl =
    positionVideo === 0
      ? getImageUrl(video?.attachmentInserted)
      : getImageUrl(video?.attachmentMatched);

  if (!videoUrl && !isBlocked) {
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
        onBoldPress={() => setIsFullScreen(true)}
      />

      <View style={styles.videoContainer}>
        <View style={styles.videoCenter}>
          {!isBlocked && (
            <CustomVideo
              videoId={videoId}
              positionVideo={positionVideo}
              onVideoPlay={() => {
                if (onVideoPlay) {
                  onVideoPlay();
                } else if (handleVideoPlay) {
                  handleVideoPlay(videoId);
                }
              }}
              uri={videoUrl}
              isPlaying={isPlaying}
            />
          )}

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

      {isBlocked && (
        <BlockedVideo
          userName={blockedUser}
          userIdLogin={userIdLogin}
          onUnblockSuccess={() => {
            if (positionVideo === 0) {
              video.isBlockedInserted = false;
            } else {
              video.isBlockedMatched = false;
            }
          }}
        />
      )}
      <Modal
        visible={isFullScreen}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          {!isBlocked && (
            <CustomVideo
              videoId={videoId}
              positionVideo={positionVideo}
              onVideoPlay={() => {
                if (onVideoPlay) {
                  onVideoPlay();
                } else if (handleVideoPlay) {
                  handleVideoPlay(videoId);
                }
              }}
              uri={videoUrl}
              isPlaying={isPlaying && isFullScreen}
            />
          )}
          <Pressable
            hitSlop={10}
            style={styles.closeFullScreenButton}
            onPress={() => setIsFullScreen(false)}
          >
            <Icon name="fullscreenExit" size={26} color="white" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

export default memo(VideoSection);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    position: "relative",
    flexDirection: "column",
    overflow: "hidden",
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
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  video: { width: SCREEN_WIDTH, height: "100%" },
  placeholder: {
    width: SCREEN_WIDTH,
    height: "100%",
    backgroundColor: "#000000",
  },
  fullScreenContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000000",
  },
  closeFullScreenButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
});
