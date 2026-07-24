import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Video, {
  OnLoadData,
  OnProgressData,
  VideoRef,
} from "react-native-video";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TOUCH_AREA_HEIGHT = 28;
const BAR_HEIGHT = 3;
const BAR_HEIGHT_ACTIVE = 5;

interface CustomVideoProps {
  uri: string;
  isPlaying: boolean;
  onVideoPlay?: () => void;
}

const CustomVideo = ({ uri, isPlaying, onVideoPlay }: CustomVideoProps) => {
  const videoRef = useRef<VideoRef>(null);
  const isFocused = useIsFocused();

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);

  const positionRef = useRef(0);
  const wasPlayingRef = useRef(false);

  const barWidth = SCREEN_WIDTH;

  // اگه از بیرون آیتم عوض بشه، حالت پاز دستی رو ریست کن
  useEffect(() => {
    setManuallyPaused(false);
  }, [uri]);

  const handleLoad = (data: OnLoadData) => {
    setDuration(data.duration || 1);
  };

  const handleProgress = (data: OnProgressData) => {
    if (isDragging) return; // حین درگ کاربر، آپدیت خودکار رو نادیده بگیر
    setPosition(data.currentTime);
    positionRef.current = data.currentTime;
  };

  const togglePlay = () => {
    setManuallyPaused((prev) => !prev);
    onVideoPlay?.();
  };

  const seek = (x: number) => {
    const percent = Math.max(0, Math.min(1, x / barWidth));
    const time = percent * duration;
    setPosition(time);
    positionRef.current = time;
    return time;
  };

  console.log("Test rerender from custom video");

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        wasPlayingRef.current = isPlaying && !manuallyPaused;
        setIsDragging(true);
        seek(e.nativeEvent.locationX);
      },

      onPanResponderMove: (e) => {
        seek(e.nativeEvent.locationX);
      },

      onPanResponderRelease: () => {
        videoRef.current?.seek(positionRef.current);
        setIsDragging(false);
      },

      onPanResponderTerminate: () => {
        videoRef.current?.seek(positionRef.current);
        setIsDragging(false);
      },
    }),
  ).current;

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const shouldPlay = isPlaying && isFocused && !manuallyPaused && !isDragging;

  return (
    <View style={styles.container}>
      <Pressable style={styles.video} onPress={togglePlay}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode="stretch"
          repeat
          paused={!shouldPlay}
          onLoad={handleLoad}
          onProgress={handleProgress}
          progressUpdateInterval={250}
          playInBackground={false}
          playWhenInactive={false}
        />
      </Pressable>

      <View
        style={styles.touchArea}
        hitSlop={{ top: 15, bottom: 15 }}
        {...panResponder.panHandlers}
      >
        <View
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
};

export default CustomVideo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  video: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  touchArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TOUCH_AREA_HEIGHT,
    justifyContent: "flex-end",
    elevation: 999,
  },
  progressContainer: {
    height: BAR_HEIGHT,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressContainerActive: {
    height: BAR_HEIGHT_ACTIVE,
  },
  progress: {
    height: "100%",
    backgroundColor: "#fff",
  },
  thumb: {
    position: "absolute",
    top: "50%",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginLeft: -6,
    marginTop: -6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
