import { CoverConfirmStep } from "@/src/components/CoverConfirmStep";
import VideoPreviewStep from "@/src/components/VideoPreviewStep";
import { useEditVideo } from "@/src/hook/useEditVideo";
import { setVideoSrc, updateMovieData } from "@/src/slices/video";
import { useAppDispatch } from "@/src/store/reduxHookType";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { YStack } from "tamagui";

export default function EditVideoScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();

  const mode = params.mode ? JSON.parse(params.mode as string) : null;
  const allFormData = params.allFormData
    ? JSON.parse(params.allFormData as string)
    : null;
  const coverImage = (params.coverImage as string) || "";
  const routeVideoSrc = (params.videoSrc as string) || "";

  useEffect(() => {
    if (routeVideoSrc) {
      dispatch(setVideoSrc(routeVideoSrc));
    }
  }, [routeVideoSrc, dispatch]);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const {
    videoSrc,
    isLoadingBtn,
    currentStep,
    movieData,
    updateMovieMeta,
    handleUploadVideo,
    handleBack,
    handleNextStep,
  } = useEditVideo({
    showEditMovie: true,
    setShowEditMovie: handleClose,
    allFormData,
    mode,
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return videoSrc ? (
          <VideoPreviewStep
            videoSrc={videoSrc}
            movieData={movieData}
            onMovieDataChange={(data) => dispatch(updateMovieData(data))}
            onCancel={handleBack}
            onNext={handleNextStep} // ← این باید trimData دریافت کند
          />
        ) : null;
      case 2:
        return (
          <CoverConfirmStep
            coverImage={coverImage}
            onBack={handleBack}
            onAccept={handleUploadVideo}
            isLoading={isLoadingBtn}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Edit Video", headerShown: false }} />
      <YStack w="100%" flex={1} bg="#111827">
        {renderStepContent()}
      </YStack>
    </>
  );
}
