// app/edit-video.tsx

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { YStack } from "tamagui";

import { CoverConfirmStep } from "../components/CoverConfirmStep";
import VideoPreviewStep from "../components/VideoPreviewStep";
import { useEditVideo } from "../hook/useEditVideo";
import { logger } from "../utils/logger";

const EditVideoRoute = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const mode = params.mode ? JSON.parse(params.mode as string) : null;
  const allFormData = params.allFormData
    ? JSON.parse(params.allFormData as string)
    : null;

  const coverImage = (params.coverImage as string) || "";

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
    resMovieData,
    currentStep,
    movieData,
    updateMovieMeta,
    handleUploadVideo,
    handleBack,
    // handleNextStep,
  } = useEditVideo({
    showEditMovie: true,
    setShowEditMovie: handleClose,
    allFormData,
    mode,
  });

  console.log("EDIT VIF");

  const getModalTitle = () => {
    switch (mode?.typeMode) {
      case 3:
        return "Offline";
      default:
        return "Edit Video";
    }
  };

  const handleNextStep = () => {
    logger.info("src video ", videoSrc);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VideoPreviewStep
            videoSrc={videoSrc}
            movieData={movieData}
            onMovieDataChange={updateMovieMeta}
            onCancel={handleClose}
            handleNextStep={handleNextStep}
          />
        );

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
      <Stack.Screen
        options={{
          title: getModalTitle(),
          headerShown: true,
        }}
      />

      <YStack flex={1} w="100%" bg="white">
        {renderStepContent()}
      </YStack>
    </>
  );
};

export default EditVideoRoute;
