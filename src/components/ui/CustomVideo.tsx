import { useIsFocused } from "@react-navigation/native";
import { VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CustomVideo = ({ player }: any) => {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const isFocused = useIsFocused();

  const barWidth = SCREEN_WIDTH;

  // useEffect(() => {
  //   if (!player) return;

  //   const sub = player.addListener("timeUpdate", (e: any) => {
  //     setPosition(e.currentTime);
  //     setDuration(e.duration || 1);
  //   });

  //   return () => {
  //     sub.remove();
  //   };
  // }, [player]);

  useEffect(() => {
    if (!player) return;

    if (!isFocused) {
      player.pause();
    }
  }, [isFocused, player]);

  const togglePlay = () => {
    if (!player) return;

    if (player.playing) player.pause();
    else player.play();
  };

  const seek = (x: number) => {
    const percent = Math.max(0, Math.min(1, x / barWidth));
    const time = percent * duration;
    player.currentTime = time;
    setPosition(time);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        seek(e.nativeEvent.locationX);
      },

      onPanResponderMove: (e) => {
        seek(e.nativeEvent.locationX);
      },
    }),
  ).current;

  const progress = (position / duration) * 100;

  return (
    <View style={styles.container}>
      <Pressable style={styles.video} onPress={togglePlay}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          contentFit="contain"
        />
      </Pressable>

      <View style={styles.progressContainer} {...panResponder.panHandlers}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
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

  progressContainer: {
    position: "absolute",
    bottom: 0,
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.45)",
  },

  progress: {
    height: 6,
    backgroundColor: "#fff",
  },
});
