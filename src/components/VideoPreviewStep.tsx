<<<<<<< HEAD
import { AVPlaybackStatus, Video } from "expo-av";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, Image, ImageStyle, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, View, XStack } from "tamagui";
import { RsetShowTimerButtn } from "../slices/main";
import { goToStep, removeInviteThunk } from "../slices/video";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
=======
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
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786
import BaseButton from "./BaseButtom";
import { Icon } from "./Icon";
import { ButtonTimer } from "./ui/ButtonTimer";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoPreviewStepProps {
  videoSrc: string;
  movieData: any;
  onMovieDataChange: (data: any) => void;
<<<<<<< HEAD
  onCancel: () => void;
  coverImage?: string;
  handleNextStep?: any;
  onAccept: any;
  isLoading: any;
=======
  onCancel?: () => void;
  handleNextStep?: (trimData?: any) => void;
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786
}

const VideoPreviewStep: React.FC<VideoPreviewStepProps> = ({
  videoSrc,
  isLoading,
  movieData,
  onMovieDataChange,
<<<<<<< HEAD
  coverImage,
=======
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786
  handleNextStep,
  onAccept,
}) => {
<<<<<<< HEAD
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 0]);
  const showTimerButtn = useAppSelector((state) => state.main.showTimerButtn);

  const [selectedIcon, setSelectedIcon] = useState<
    "AspectRatio" | "CheckBoxOutlineBlank" | null
  >("CheckBoxOutlineBlank");

=======
  const videoRef = useRef<VideoRef>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(0);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786
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

<<<<<<< HEAD
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
=======
  const handleVideoLoad = (data: OnLoadData) => {
    if (data.duration) {
      const secs = data.duration;
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786
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
<<<<<<< HEAD

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || trimRange[1] === 0) return;
=======
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786

  const handleProgress = (data: OnProgressData) => {
    if (trimRange[1] === 0) return;

    const currentSecs = data.currentTime;

    if (currentSecs >= trimRange[1]) {
      videoRef.current?.seek(trimRange[0]);
    }
  };
<<<<<<< HEAD

  const togglePlay = async () => {
    if (!videoRef.current) return;
=======
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };
<<<<<<< HEAD

  const dispatch = useAppDispatch();
=======
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786

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
<<<<<<< HEAD
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
=======
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
>>>>>>> c50d918774475bced2a26c602a6d4789d0df2786
  );
};

export default VideoPreviewStep;
