import React, { memo } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import CustomVideo from "../components/ui/CustomVideo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FullScreenVideoModalProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  positionVideo: any;
  videoUrl: any;
  isPlaying: boolean;
  onVideoPlay?: () => void;
  isBlocked?: boolean;
}

const FullScreenVideoModal = ({
  visible,
  onClose,
  videoId,
  positionVideo,
  videoUrl,
  isPlaying,
  onVideoPlay,
  isBlocked,
}: FullScreenVideoModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenContainer}>
        {!isBlocked && (
          <CustomVideo
            videoId={videoId}
            positionVideo={positionVideo}
            resizeMode={4}
            onVideoPlay={onVideoPlay}
            uri={videoUrl}
            isPlaying={isPlaying && visible}
          />
        )}
        <SafeAreaView edges={["top", "right"]} style={styles.overlayHeader}>
          <Pressable
            hitSlop={12}
            style={styles.closeFullScreenButton}
            onPress={onClose}
          >
            <Icon name="fullscreenExit" size={26} color="white" />
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default memo(FullScreenVideoModal);

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000000",
  },
  overlayHeader: {
    position: "absolute",
    top: 10,
    right: 16,
    zIndex: 20,
  },
  closeFullScreenButton: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: 22,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
