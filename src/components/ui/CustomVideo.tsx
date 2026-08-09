import { useCachedVideo } from "@/src/hook/useCatchedVideo";
import { useIsFocused, useRoute } from "@react-navigation/native";
import React, { memo, useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Video, {
  OnLoadData,
  OnProgressData,
  VideoRef,
} from "react-native-video";

const TOUCH_AREA_HEIGHT = 85;
const BAR_HEIGHT = 3;
const BAR_HEIGHT_ACTIVE = 5;

interface CustomVideoProps {
  videoId: string;
  uri: string;
  isPlaying: boolean;
  onVideoPlay?: () => void;
  positionVideo: any;
}

const CustomVideo = memo(
  ({
    videoId,
    uri,
    isPlaying,
    onVideoPlay,
    positionVideo,
  }: CustomVideoProps) => {
    const videoRef = useRef<VideoRef>(null);
    const isFocused = useIsFocused();

    const [duration, setDuration] = useState(1);
    const [position, setPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const route = useRoute();

    const videoSource = useCachedVideo(uri);

    console.log(
      `custom video on route: [${route.name}]                , position:${position} ,          uri:${uri}`,
    );

    const isDraggingRef = useRef(false);
    const durationRef = useRef(1);
    const positionRef = useRef(0);
    const timelineWidthRef = useRef(1); // فقط عرض نوار پیشرفت را نیاز داریم

    const updatePosition = (newPos: number) => {
      setPosition(newPos);
      positionRef.current = newPos;
    };

    const handleLoad = (data: OnLoadData) => {
      setDuration(data.duration || 1);
      durationRef.current = data.duration || 1;
    };

    const handleProgress = (data: OnProgressData) => {
      if (!isDraggingRef.current) {
        updatePosition(data.currentTime);
      }
    };

    const togglePlay = () => {
      console.log(
        `[Video ${positionVideo}] 🎬 Tap on Video Body -> Toggle Play`,
      );
      onVideoPlay?.();
    };

    const seek = (locationX: number) => {
      // محاسبه درصد بر اساس عرض نوار پایینی (نه کل صفحه)
      const width = timelineWidthRef.current;
      const percent = Math.max(0, Math.min(1, locationX / width));
      const newTime = percent * durationRef.current;
      updatePosition(newTime);
      return newTime;
    };

    // PanResponder فقط و فقط برای نوار پیشرفت پایین صفحه
    const timelineResponder = useRef(
      PanResponder.create({
        // هرگونه تاچ روی این لایه، توسط همین لایه جذب شود (و به Pressable زیرین نرسد)
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (evt) => {
          isDraggingRef.current = true;
          setIsDragging(true);
          const targetTime = seek(evt.nativeEvent.locationX);
          console.log(
            `[Video ${positionVideo}] 📍 Timeline Touched! Target: ${targetTime.toFixed(2)}s`,
          );
        },

        onPanResponderMove: (evt) => {
          if (isDraggingRef.current) {
            seek(evt.nativeEvent.locationX);
          }
        },

        onPanResponderRelease: () => {
          console.log(
            `[Video ${positionVideo}] ✅ Drag Released, seeking to: ${positionRef.current.toFixed(2)}s`,
          );
          videoRef.current?.seek(positionRef.current);
          isDraggingRef.current = false;
          setIsDragging(false);
        },

        onPanResponderTerminate: () => {
          videoRef.current?.seek(positionRef.current);
          isDraggingRef.current = false;
          setIsDragging(false);
        },
      }),
    ).current;

    const progress = duration > 0 ? (position / duration) * 100 : 0;
    const shouldPlay = isPlaying && isFocused && !isDragging;

    return (
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={{ uri: videoSource || uri }}
          style={StyleSheet.absoluteFill as ViewStyle}
          resizeMode="stretch"
          repeat
          paused={!shouldPlay}
          onLoad={handleLoad}
          onProgress={handleProgress}
          progressUpdateInterval={250}
        />
        <Pressable style={styles.playPauseOverlay} onPress={togglePlay} />
        <View
          style={styles.progressArea}
          onLayout={(e) => {
            timelineWidthRef.current = e.nativeEvent.layout.width;
          }}
          {...timelineResponder.panHandlers}
        >
          <View
            pointerEvents="none"
            style={[
              styles.progressContainer,
              isDragging && styles.progressContainerActive,
            ]}
          >
            <View style={[styles.progress, { width: `${progress}%` }]} />
            {isDragging && (
              <View style={[styles.thumb, { left: `${progress}%` }]} />
            )}
          </View>
        </View>
      </View>
    );
  },
);

export default CustomVideo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "black",
  },
  playPauseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: TOUCH_AREA_HEIGHT,
    zIndex: 5,
    elevation: 5,
    backgroundColor: "transparent",
  },
  progressArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TOUCH_AREA_HEIGHT,
    justifyContent: "flex-end",
    zIndex: 10,
    elevation: 10,
    backgroundColor: "transparent",
  },
  progressContainer: {
    height: BAR_HEIGHT,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
  },
  progressContainerActive: {
    height: BAR_HEIGHT_ACTIVE,
  },
  progress: {
    height: "100%",
    backgroundColor: "#ffffff",
  },
  thumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    marginLeft: -7,
  },
});
