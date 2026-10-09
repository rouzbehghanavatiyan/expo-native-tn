import { useCachedVideo } from "@/src/hook/useCatchedVideo";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Video, {
  OnLoadData,
  OnProgressData,
  VideoRef,
} from "react-native-video";
import { Icon } from "../components/Icon";

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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const FullScreenVideoModal = ({
  visible,
  onClose,
  videoUrl,
  isPlaying: initialIsPlaying,
  isBlocked,
}: FullScreenVideoModalProps) => {
  const videoRef = useRef<VideoRef>(null);
  const { url: cachedUri, isLoading: isCacheLoading } =
    useCachedVideo(videoUrl);

  const [isPlaying, setIsPlaying] = useState(initialIsPlaying);
  const [duration, setDuration] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const durationRef = useRef(1);
  const currentTimeRef = useRef(0);
  const timelineWidthRef = useRef(1);

  useEffect(() => {
    if (visible) {
      setIsPlaying(initialIsPlaying);
      resetControlsTimeout();
    }
  }, [visible, initialIsPlaying]);

  const resetControlsTimeout = () => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setShowControls(true);

    hideControlsTimer.current = setTimeout(() => {
      if (!isDragging) {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }
    }, 3500);
  };

  const toggleControls = () => {
    if (showControls) {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    } else {
      resetControlsTimeout();
    }
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
    resetControlsTimeout();
  };

  const handleLoad = (data: OnLoadData) => {
    const dur = data.duration || 1;
    setDuration(dur);
    durationRef.current = dur;
    setIsPlayerReady(true);
  };

  const handleProgress = (data: OnProgressData) => {
    if (!isDragging) {
      setCurrentTime(data.currentTime);
      currentTimeRef.current = data.currentTime;
    }
  };

  const seek = (locationX: number) => {
    const width = timelineWidthRef.current;
    const percent = Math.max(0, Math.min(1, locationX / width));
    const targetTime = percent * durationRef.current;
    setCurrentTime(targetTime);
    currentTimeRef.current = targetTime;
    return targetTime;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
        seek(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        seek(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        videoRef.current?.seek(currentTimeRef.current);
        setIsDragging(false);
        resetControlsTimeout();
      },
      onPanResponderTerminate: () => {
        videoRef.current?.seek(currentTimeRef.current);
        setIsDragging(false);
        resetControlsTimeout();
      },
    }),
  ).current;

  const isVideoLoading =
    !videoUrl || isCacheLoading || !cachedUri || !isPlayerReady;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* لودینگ ویدیو */}
        {isVideoLoading && (
          <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}

        {/* پلیر ویدیو */}
        {!!cachedUri && !isBlocked && (
          <Video
            ref={videoRef}
            source={{ uri: cachedUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            repeat
            paused={!isPlaying}
            onLoad={handleLoad}
            onReadyForDisplay={() => setIsPlayerReady(true)}
            onProgress={handleProgress}
            progressUpdateInterval={250}
          />
        )}

        {/* لایه لمس کلی صفحه برای نمایش/مخفی کردن کنترل‌ها */}
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleControls} />

        {/* کنترل‌های روی صفحه */}
        <Animated.View
          pointerEvents={showControls ? "box-none" : "none"}
          style={[styles.controlsOverlay, { opacity: controlsOpacity }]}
        >
          {/* هدر: دکمه بستن فول‌اسکرین */}
          <SafeAreaView edges={["top", "right"]} style={styles.header}>
            <Pressable hitSlop={12} style={styles.iconButton} onPress={onClose}>
              <Icon name="fullscreenExit" size={24} color="#ffffff" />
            </Pressable>
          </SafeAreaView>

          {/* دکمه وسط صفحه: پخش / توقف */}
          <View style={styles.centerPlayButtonContainer}>
            <Pressable style={styles.playButton} onPress={togglePlayPause}>
              <FontAwesome5
                name={isPlaying ? "pause" : "play"}
                size={26}
                color="#ffffff"
                style={!isPlaying ? { marginLeft: 4 } : undefined}
              />
            </Pressable>
          </View>

          {/* فوتر چسبیده به پایین صفحه */}
          <SafeAreaView edges={["bottom"]} style={styles.footerContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

              {/* نوار پیشرفت / اسکرول بار */}
              <View
                style={styles.timelineArea}
                onLayout={(e) => {
                  timelineWidthRef.current = e.nativeEvent.layout.width;
                }}
                {...panResponder.panHandlers}
              >
                <View style={styles.timelineTrack}>
                  <View
                    style={[
                      styles.timelineProgress,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.timelineThumb,
                      { left: `${progressPercent}%` },
                      isDragging && styles.timelineThumbActive,
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default memo(FullScreenVideoModal);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    zIndex: 5,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: 10,
    right: 16,
    zIndex: 20,
  },
  iconButton: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: 22,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  centerPlayButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "box-none",
  },
  playButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    minWidth: 38,
    textAlign: "center",
  },
  timelineArea: {
    flex: 1,
    height: 36,
    justifyContent: "center",
  },
  timelineTrack: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    position: "relative",
    justifyContent: "center",
  },
  timelineProgress: {
    height: "100%",
    backgroundColor: "#FF7A00",
    borderRadius: 2,
  },
  timelineThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ffffff",
    marginLeft: -7,
  },
  timelineThumbActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
  },
});
