import { useAppTheme } from "@/src/hook/ThemeContext";
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
  isDark: boolean;
};

const SkeletonBox = ({
  width = "100%",
  height,
  radius = 10,
  circle = false,
  isDark,
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

  const backgroundColor = isDark ? "#1C1C1C" : "#E8E8E8";

  const shimmerColors: [string, string, string] = isDark
    ? ["transparent", "rgba(255,255,255,0.08)", "transparent"]
    : ["transparent", "rgba(255,255,255,0.75)", "transparent"];

  return (
    <View
      style={[
        styles.box,
        {
          width,
          height,
          borderRadius: circle ? height / 2 : radius,
          backgroundColor,
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
          colors={shimmerColors}
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
  const { isDark } = useAppTheme();

  const screenBackground = isDark ? "#000000" : "#FFFFFF";

  switch (section) {
    case "itsShowWatch": {
      const heights = [
        height * 0.07,
        height * 0.42,
        height * 0.07,
        height * 0.42,
      ];

      return (
        <YStack
          flex={1}
          width="100%"
          minHeight={height}
          backgroundColor={screenBackground}
          px="$2"
          pt="$1"
          gap="$1"
        >
          {heights.map((itemHeight, index) => (
            <SkeletonBox key={index} height={itemHeight} isDark={isDark} />
          ))}
        </YStack>
      );
    }

    case "itsHome": {
      const heights = [
        height * 0.07,
        height * 0.4,
        height * 0.07,
        height * 0.4,
      ];

      return (
        <YStack
          flex={1}
          width="100%"
          minHeight={height}
          backgroundColor={screenBackground}
          px="$2"
          gap="$1"
        >
          {heights.map((itemHeight, index) => (
            <SkeletonBox key={index} height={itemHeight} isDark={isDark} />
          ))}
        </YStack>
      );
    }

    case "itsProfile": {
      const heights = [
        height * 0.06,
        height * 0.37,
        height * 0.06,
        height * 0.37,
      ];

      return (
        <YStack mx="$1" mt="$2" gap="$2" backgroundColor={screenBackground}>
          {heights.map((itemHeight, index) => (
            <SkeletonBox key={index} height={itemHeight} isDark={isDark} />
          ))}
        </YStack>
      );
    }

    case "justPic":
      return (
        <YStack gap="$1" width="100%" backgroundColor={screenBackground}>
          <SkeletonBox height={175} radius={10} isDark={isDark} />

          <SkeletonBox height={175} radius={14} isDark={isDark} />
        </YStack>
      );

    case "singleCircle":
      return <SkeletonBox width={60} height={60} circle isDark={isDark} />;

    case "filteredWatch":
      return (
        <YStack gap="$2" width="100%" backgroundColor={screenBackground}>
          <SkeletonBox height={220} radius={12} isDark={isDark} />

          <SkeletonBox width="70%" height={16} radius={8} isDark={isDark} />

          <SkeletonBox width="45%" height={14} radius={8} isDark={isDark} />
        </YStack>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  box: {
    overflow: "hidden",
  },
  gradient: {
    width: 220,
    height: "100%",
  },
});

export default VideoItemSkeleton;
