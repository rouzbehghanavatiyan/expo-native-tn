import { ResizeMode, Video, VideoProps } from "expo-av";
import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";

interface VideoBaseProps extends Omit<VideoProps, "source"> {
  uri: string;
}

const VideoBase = forwardRef<Video, VideoBaseProps>(
  (
    { uri, style, isLooping = true, resizeMode = ResizeMode.CONTAIN, ...props },
    ref,
  ) => {
    return (
      <Video
        ref={ref}
        source={{ uri }}
        style={[styles.video, style]}
        resizeMode={resizeMode} // تغییر به CONTAIN برای جلوگیری از بریده شدن ویدیو
        isLooping={isLooping}
        useNativeControls={false}
        {...props}
      />
    );
  },
);

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: "100%",
  },
});

export default VideoBase;
