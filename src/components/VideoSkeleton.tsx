import React from "react";
import { useWindowDimensions, View } from "react-native";
import { YStack } from "tamagui";
import VideoItemSkeleton from "./VideoItemSkeleton";

type VideoSkeletonProps = {
  count: number;
  section: string;
  isSwapper?: boolean;
};

const VideoSkeleton: React.FC<VideoSkeletonProps> = ({
  count,
  section,
  isSwapper = false,
}) => {
  const { height } = useWindowDimensions();

  if (isSwapper) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <YStack
            key={index}
            height={height}
            width="100%"
            backgroundColor="black"
            flexDirection="column"
          >
            <VideoItemSkeleton section="itsHome" />
          </YStack>
        ))}
      </>
    );
  }

  return (
    <View style={{ width: "100%" }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ width: "100%", marginBottom: 12 }}>
          <VideoItemSkeleton section={section} />
        </View>
      ))}
    </View>
  );
};

export default VideoSkeleton;
