import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";
import Video, {
  OnLoadData,
  OnProgressData,
  ResizeMode,
  VideoRef,
} from "react-native-video";
import { Text, View, XStack } from "tamagui";
import { goToStep } from "../slices/video";
import { useAppDispatch } from "../store/reduxHookType";
import BaseButton from "./BaseButtom";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoPreviewStepProps {
  videoSrc: string;
  movieData: any;
  onMovieDataChange: (data: any) => void;
  onCancel?: () => void;
  handleNextStep?: (trimData?: any) => void;
}

const VideoPreviewStep: React.FC<VideoPreviewStepProps> = ({
  videoSrc,
  movieData,
  onMovieDataChange,
  handleNextStep,
}) => {
  const videoRef = useRef<VideoRef>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(0);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [videoLayout, setVideoLayout] = useState({
    width: SCREEN_WIDTH - 32,
    height: 300,
  });

  const router = useRouter();
  const dispatch = useAppDispatch();
  const MAX_DURATION = 60;

  const handleSliderChange = (values: number[]) => {
    let start = values[0];
    let end = values[1];

    if (end - start > MAX_DURATION) {
      end = start + MAX_DURATION;
    }

    setTrimRange([start, end]);
    videoRef.current?.seek(start);
  };

  const handleVideoLoad = (data: OnLoadData) => {
    if (data.duration) {
      const secs = data.duration;
      setDuration(secs);
      setTrimRange([0, Math.min(secs, MAX_DURATION)]);
    }

    if (data.naturalSize) {
      const { width: natW, height: natH } = data.naturalSize;
      if (natW > 0 && natH > 0) {
        const videoRatio = natW / natH;
        const maxWidth = SCREEN_WIDTH - 32;
        const maxHeight = SCREEN_HEIGHT * 0.55;
        const containerRatio = maxWidth / maxHeight;

        let finalWidth: number;
        let finalHeight: number;

        if (videoRatio > containerRatio) {
          finalWidth = maxWidth;
          finalHeight = maxWidth / videoRatio;
        } else {
          finalHeight = maxHeight;
          finalWidth = maxHeight * videoRatio;
        }

        setVideoLayout({ width: finalWidth, height: finalHeight });
      }
    }
  };

  const handleProgress = (data: OnProgressData) => {
    if (trimRange[1] === 0) return;

    const currentSecs = data.currentTime;

    if (currentSecs >= trimRange[1]) {
      videoRef.current?.seek(trimRange[0]);
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNextPress = () => {
    const selectedDuration = trimRange[1] - trimRange[0];

    onMovieDataChange({
      trimStart: trimRange[0],
      trimEnd: trimRange[1],
      duration: selectedDuration,
    });

    dispatch(goToStep(2));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View flex={1} backgroundColor="#000000">
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal={16}
      >
        <View
          style={{
            width: videoLayout.width,
            height: videoLayout.height,
            backgroundColor: "black",
            overflow: "hidden",
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={togglePlay}>
            <Video
              ref={videoRef}
              source={{ uri: videoSrc }}
              resizeMode={ResizeMode.CONTAIN}
              style={StyleSheet.absoluteFillObject}
              onLoad={handleVideoLoad}
              onProgress={handleProgress}
              paused={!isPlaying}
              repeat={false}
              muted={false}
            />
          </Pressable>
        </View>
      </View>

      <View padding={20} paddingBottom={62} backgroundColor="#1f2937">
        {duration > 0 ? (
          <>
            <XStack justifyContent="space-between" marginTop={8}>
              <Text color="#9ca3af">{formatTime(trimRange[0])}</Text>
              <Text color="#10b981">
                {formatTime(trimRange[1] - trimRange[0])} / 1:00
              </Text>
              <Text color="#9ca3af">{formatTime(trimRange[1])}</Text>
            </XStack>

            <View alignItems="center" marginBottom={16}>
              <MultiSlider
                values={[trimRange[0], trimRange[1]]}
                min={0}
                max={duration}
                step={0.5}
                sliderLength={SCREEN_WIDTH - 80}
                onValuesChange={handleSliderChange}
                selectedStyle={{ backgroundColor: "#10b981" }}
                unselectedStyle={{ backgroundColor: "#4b5563" }}
                markerStyle={{
                  backgroundColor: "#059669",
                  height: 24,
                  width: 24,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                trackStyle={{ height: 6, borderRadius: 3 }}
              />
            </View>
          </>
        ) : (
          <Text textAlign="center" color="#9ca3af" marginBottom={16}>
            Loading...
          </Text>
        )}

        <XStack justifyContent="space-between" alignItems="center" gap="$2">
          <BaseButton
            flex={1}
            size="$3"
            bg="$greenMain"
            chromeless
            onPress={handleNextPress}
          >
            Next
          </BaseButton>
          <BaseButton
            flex={1}
            size="$3"
            bg="transparent"
            chromeless
            onPress={() => router.back()}
          >
            Cancel
          </BaseButton>
        </XStack>
      </View>
    </View>
  );
};

export default VideoPreviewStep;
