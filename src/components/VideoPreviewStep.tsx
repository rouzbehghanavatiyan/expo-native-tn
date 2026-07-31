import { AVPlaybackStatus, Video } from "expo-av";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, Image, ImageStyle, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, View, XStack } from "tamagui";
import { RsetShowTimerButtn } from "../slices/main";
import { goToStep, removeInviteThunk } from "../slices/video";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
import BaseButton from "./BaseButtom";
import { Icon } from "./Icon";
import { ButtonTimer } from "./ui/ButtonTimer";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoPreviewStepProps {
  videoSrc: string;
  movieData: any;
  onMovieDataChange: (data: any) => void;
  onCancel: () => void;
  coverImage?: string;
  handleNextStep?: any;
  onAccept: any;
  isLoading: any;
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
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 0]);
  const showTimerButtn = useAppSelector((state) => state.main.showTimerButtn);

  const [selectedIcon, setSelectedIcon] = useState<
    "AspectRatio" | "CheckBoxOutlineBlank" | null
  >("CheckBoxOutlineBlank");

  const [videoLayout, setVideoLayout] = useState({
    width: SCREEN_WIDTH - 32,
    height: 300,
  });
  const router = useRouter();
  const MAX_DURATION = 60;

  const handleSliderChange = (values: number[]) => {
    let start = values[0];
    let end = values[1];

    if (end - start > MAX_DURATION) {
      end = start + MAX_DURATION;
    }

    setTrimRange([start, end]);
    videoRef.current?.setPositionAsync(start * 1000);
  };

  const handleCanceled = async () => {
    router.replace("/(tabs)/watch");
    console.log("showTimerButtn showTimerButtn", showTimerButtn);
    // if (true) {
    // } else {
    // }
    await dispatch(removeInviteThunk(movieData?.inviteId));
    dispatch(RsetShowTimerButtn(false));
  };

  const handleVideoLoad = (status: any) => {
    if (!status.isLoaded) return;

    if (status.durationMillis) {
      const secs = status.durationMillis / 1000;
      setDuration(secs);
      setTrimRange([0, secs]);
    }

    if (status.naturalSize) {
      const { width: natW, height: natH } = status.naturalSize;
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
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || trimRange[1] === 0) return;

    const currentSecs = status.positionMillis / 1000;

    if (currentSecs >= trimRange[1]) {
      videoRef.current?.setPositionAsync(trimRange[0] * 1000);
    }
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }

    setIsPlaying(!isPlaying);
  };

  const dispatch = useAppDispatch();

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

  // تعیین استایل و resizeMode بر اساس آیکون انتخاب شده
  const imageStyle: ImageStyle = {
    width: selectedIcon === "AspectRatio" ? SCREEN_WIDTH : SCREEN_WIDTH - 32, // تمام عرض یا با حاشیه
    height: SCREEN_HEIGHT * 0.5,
    resizeMode: selectedIcon === "AspectRatio" ? "stretch" : "contain", // تغییر resizeMode
    backgroundColor: "black",
    borderRadius: selectedIcon === "AspectRatio" ? 0 : 12, // حذف حاشیه گرد در حالت تمام‌عرض (اختیاری)
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View flex={1}>
        <View flex={1} justifyContent="center" alignItems="center">
          <View
            flex={1}
            justifyContent="flex-start"
            alignItems="center"
            paddingHorizontal={0}
            width="100%"
          >
            {!!coverImage && (
              <View width="100%" alignItems="center">
                <View width="100%" alignItems="center" backgroundColor="black">
                  <Image
                    source={{ uri: coverImage }}
                    alt="Video Cover"
                    style={imageStyle}
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
                  <View marginTop={60}>
                    <ButtonTimer show={showTimerButtn} startTime={120} />
                  </View>
                ) : (
                  <Icon size={110} name="Question" color="white" />
                )}
              </View>
            )}
          </View>
        </View>
        <View padding={20} paddingBottom={22} backgroundColor="#1f2937">
          <XStack
            justifyContent="center"
            alignItems="center"
            gap="$6"
            marginBottom="$4"
          >
            <Pressable
              onPress={() => setSelectedIcon("AspectRatio")}
              style={{
                borderWidth: selectedIcon === "AspectRatio" ? 1 : 0,
                borderColor:
                  selectedIcon === "AspectRatio" ? "#22c55e" : "transparent",
                borderRadius: 12,
                padding: 4,
              }}
            >
              <Icon size={45} name="CheckBoxOutlineBlank" color="white" />
            </Pressable>
            <Pressable
              onPress={() => setSelectedIcon("CheckBoxOutlineBlank")}
              style={{
                borderWidth: selectedIcon === "CheckBoxOutlineBlank" ? 1 : 0,
                borderColor:
                  selectedIcon === "CheckBoxOutlineBlank"
                    ? "#22c55e"
                    : "transparent",
                borderRadius: 12,
                padding: 4,
              }}
            >
              <Icon size={45} name="AspectRatio" color="white" />
            </Pressable>
          </XStack>
          <XStack justifyContent="space-between" alignItems="center" gap="$2">
            <BaseButton
              flex={1}
              size="$3"
              bg="$greenMain"
              chromeless
              loading={isLoading}
              disabled={showTimerButtn && true}
              // onPress={handleNextPress}
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
              bg="transparent"
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
