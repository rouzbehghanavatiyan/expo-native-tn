import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { OnLoadData, OnProgressData, VideoRef } from "react-native-video";
import { Spinner, Text, View, XStack } from "tamagui";
import { RsetShowTimerButtn } from "../slices/main";
import { goToStep, removeInviteThunk } from "../slices/video";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
import BaseButton from "./BaseButtom";
import { Icon } from "./Icon";
import { ButtonTimer } from "./ui/ButtonTimer";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type MatchGender = "random" | "male" | "female";

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
  const [selectedGender, setSelectedGender] = useState<MatchGender>("random");
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
      targetGender: selectedGender,
    });

    dispatch(goToStep(2));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const genderOptions: { label: string; value: MatchGender }[] = [
    { label: "Male", value: "male" },
    { label: "Random", value: "random" },
    { label: "Female", value: "female" },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#1f2937" }}
      edges={["left", "right"]}
    >
      <View flex={1} justifyContent="space-between">
        <View flex={1} width="100%" alignItems="center">
          {!!coverImage && (
            <View width="100%" flex={1} alignItems="center">
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
              />

              <View
                flex={1}
                width="100%"
                alignItems="center"
                justifyContent="space-evenly"
                paddingVertical="$2"
                borderBottomWidth={0.5}
                borderBottomColor="rgba(251, 6, 6, 0.82)"
              >
                <View
                  height={110}
                  justifyContent="center"
                  alignItems="center"
                  {...(!showTimerButtn && {
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    style: { elevation: 2 },
                  })}
                >
                  {showTimerButtn ? (
                    <ButtonTimer show={showTimerButtn} startTime={120} />
                  ) : (
                    <Icon size={50} name="Question" color="white" />
                  )}
                </View>
                <XStack alignItems="center" justifyContent="center">
                  <Text
                    color="#9CA3AF"
                    fontSize={10}
                    fontWeight="600"
                    marginRight="$3"
                    textTransform="uppercase"
                  >
                    Request a match with:
                  </Text>
                  <XStack
                    backgroundColor="#111827"
                    borderRadius={10}
                    padding={4}
                    borderWidth={1}
                    borderColor="rgba(255, 255, 255, 0.08)"
                    alignItems="center"
                    gap="$1"
                    opacity={showTimerButtn ? 0.6 : 1}
                    pointerEvents={showTimerButtn ? "none" : "auto"}
                  >
                    {genderOptions.map((item) => {
                      const isSelected = selectedGender === item.value;
                      return (
                        <View
                          key={item.value}
                          pressStyle={{ opacity: 0.8 }}
                          onPress={() => setSelectedGender(item.value)}
                          backgroundColor={
                            isSelected ? "$greenMain" : "transparent"
                          }
                          paddingVertical={8}
                          paddingHorizontal={18}
                          borderRadius={10}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text
                            fontSize={10}
                            fontWeight={isSelected ? "700" : "500"}
                            color={isSelected ? "#ffffff" : "#9ca3af"}
                          >
                            {item.label}
                          </Text>
                        </View>
                      );
                    })}
                  </XStack>
                </XStack>
              </View>
            </View>
          )}
        </View>

        {/* دکمه‌های پایین صفحه */}
        <View
          shadowColor="#000000"
          shadowOffset={{ width: 0, height: -8 }}
          shadowOpacity={0.25}
          shadowRadius={12}
          borderTopWidth={0.5}
          borderTopColor="rgba(255, 255, 255, 0.08)"
          paddingHorizontal={20}
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
              onPress={() => {
                onAccept(selectedGender);
              }}
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
