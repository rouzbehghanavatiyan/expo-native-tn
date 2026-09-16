import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { OnLoadData, OnProgressData, VideoRef } from "react-native-video";
import { Spinner, View, XStack } from "tamagui";
import { RsetShowTimerButtn } from "../slices/main";
import { goToStep, removeInviteThunk } from "../slices/video";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
import BaseButton from "./BaseButtom";
import { Icon } from "./Icon";
import { ButtonTimer } from "./ui/ButtonTimer";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoPreviewStepProps {
  videoSrc: any;
  movieData: any;
  onMovieDataChange: (data: any) => void;
  coverImage?: string;
  handleNextStep?: any;
  onAccept: any;
  isLoading: any;
  onCancel?: () => void;
}

const VideoPreviewStep: React.FC<VideoPreviewStepProps> = ({
  videoSrc,
  isLoading,
  movieData,
  onMovieDataChange,
  coverImage,
  handleNextStep,
  onAccept,
}) => {
  const insets = useSafeAreaInsets();
  const videoRef = useRef<VideoRef>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 0]);
  const showTimerButtn = useAppSelector((state) => state.main.showTimerButtn);
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

  const handleCanceled = async () => {
    router.replace("/(tabs)/watch");
    console.log("showTimerButtn", showTimerButtn);
    await dispatch(removeInviteThunk(movieData?.inviteId));
    dispatch(RsetShowTimerButtn(false));
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#1f2937" }}
      edges={["left", "right"]}
    >
      <View flex={1} justifyContent="space-between">
        <View flex={1} width="100%" alignItems="center">
          {!!coverImage && (
            <View width="100%" alignItems="center">
              <View
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT * 0.5}
                backgroundColor="black"
                overflow="hidden"
                justifyContent="center"
                alignItems="center"
              >
                <Image
                  style={StyleSheet.absoluteFillObject}
                  source={{ uri: coverImage }}
                  alt="Video Cover"
                  resizeMode="contain"
                />
              </View>
              <View
                width={SCREEN_WIDTH - 32}
                height={1}
                backgroundColor="#374151"
                marginTop="$1"
                marginBottom="$5"
              />

              {showTimerButtn ? (
                <View marginTop={90}>
                  <ButtonTimer show={showTimerButtn} startTime={120} />
                </View>
              ) : (
                <View
                  shadowColor="#000000"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.15}
                  shadowRadius={4}
                  style={{ elevation: 2 }}
                >
                  <Icon size={110} name="Question" color="white" />
                </View>
              )}
            </View>
          )}
        </View>

        <View
          shadowColor="#000000"
          shadowOffset={{ width: 0, height: -8 }}
          shadowOpacity={0.25}
          shadowRadius={12}
          borderTopWidth={0.5}
          borderTopColor="rgba(255, 255, 255, 0.08)"
          paddingHorizontal={20}
          paddingTop={16}
          paddingBottom={insets.bottom > 13 ? insets.bottom - 30 : 3}
          backgroundColor="#1f2937"
          width="100%"
        >
          <XStack justifyContent="space-between" alignItems="center" gap="$2">
            <BaseButton
              flex={1}
              size="$3"
              bg="$greenMain"
              chromeless
              loading={isLoading}
              disabled={!!showTimerButtn}
              onPress={onAccept}
            >
              {showTimerButtn ? (
                <Spinner size="small" color="white" />
              ) : (
                "Start"
              )}
            </BaseButton>
            <BaseButton
              flex={1}
              size="$3"
              variant="outlined"
              chromeless
              onPress={handleCanceled}
            >
              Cancel
            </BaseButton>
          </XStack>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VideoPreviewStep;
