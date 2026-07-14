import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
import { YStack } from "tamagui";

type SectionType =
  | "itsShowWatch"
  | "itsHome"
  | "itsProfile"
  | "justPic"
  | "filteredWatch"
  | "singleCircle";

type PropsType = {
  section?: SectionType | string;
};

type SkeletonBoxProps = {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  circle?: boolean;
};

const SkeletonBox = ({
  width = "100%",
  height,
  radius = 10,
  circle = false,
}: SkeletonBoxProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 220],
  });

  return (
    <View
      style={[
        styles.box,
        {
          width,
          height,
          borderRadius: circle ? height / 2 : radius,
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.16)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const VideoItemSkeleton: React.FC<PropsType> = ({ section }) => {
  const { height } = useWindowDimensions();

  switch (section) {
    case "itsShowWatch":
    case "itsHome":
      const heights = [
        height * 0.06,
        height * 0.38,
        height * 0.06,
        height * 0.38,
      ];

      return (
        <YStack
          flex={1}
          width="100%"
          minHeight={height}
          backgroundColor="#000"
          px="$1"
          pt="$2"
          gap="$2"
        >
          {heights.map((itemHeight, index) => (
            <SkeletonBox key={index} height={itemHeight} />
          ))}
        </YStack>
      );
    case "itsProfile": {
      const heights = [
        height * 0.06,
        height * 0.37,
        height * 0.06,
        height * 0.37,
      ];

      return (
        <YStack mx="$1" mt="$2" gap="$2">
          {heights.map((itemHeight, index) => (
            <SkeletonBox key={index} height={itemHeight} />
          ))}
        </YStack>
      );
    }

    case "justPic":
      return (
        <YStack gap="$1" width="100%">
          <SkeletonBox height={175} radius={10} />
          <SkeletonBox height={175} radius={14} />
        </YStack>
      );

    case "singleCircle":
      return <SkeletonBox width={60} height={60} circle />;

    case "filteredWatch":
      return (
        <YStack gap="$2" width="100%">
          <SkeletonBox height={220} radius={12} />
          <SkeletonBox width="70%" height={16} radius={8} />
          <SkeletonBox width="45%" height={14} radius={8} />
        </YStack>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  box: {
    overflow: "hidden",
    backgroundColor: "#5252523a",
  },
  gradient: {
    width: 220,
    height: "100%",
  },
});

export default VideoItemSkeleton;
