import {
  goToStep,
  prepareVideoFileThunk,
  removeInviteThunk,
  resetVideoState,
  setMovieData,
  setMovieMeta,
  updateMovieData,
  uploadFullProcessThunk,
} from "@/src/slices/video";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
import { socketClient } from "../utils/socketClient";

export const useEditVideo = ({
  showEditMovie,
  routeVideoSrc,
  setShowEditMovie,
  allFormData,
  mode,
}: any) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    videoSrc,
    isLoading,
    currentStep,
    movieData,
    resMovieData,
    uploadStatus,
  } = useAppSelector((state) => state.video);
  const hasPrepared = useRef(false);
  const main = useAppSelector((state) => state.main);
  const userIdLogin = main?.userLogin?.user?.id;
  const gearId = main?.createTalent?.gear?.id;

  useEffect(() => {
    if (showEditMovie && allFormData?.video && !hasPrepared.current) {
      hasPrepared.current = true;
      dispatch(prepareVideoFileThunk(allFormData.video));
      if (userIdLogin) {
        dispatch(setMovieMeta({ userId: userIdLogin }));
      }
    }
  }, [showEditMovie, allFormData?.video, userIdLogin, dispatch]);

  const handleUploadVideo = useCallback(() => {
    console.log("BSDFDSFDIHSDFOHSDIUFHSDUIFH");

    dispatch(
      uploadFullProcessThunk({
        userId: userIdLogin,
        gearId,
        mode,
        allFormData,
        router,
        socketClient,
        movieMeta: movieData,
      }),
    );
  }, [
    dispatch,
    userIdLogin,
    gearId,
    mode,
    allFormData,
    socketClient,
    movieData,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      dispatch(goToStep(currentStep - 1));
    }
    if (movieData?.inviteId) {
      dispatch(removeInviteThunk(movieData.inviteId));
    }
  }, [dispatch, currentStep, movieData]);

  const handleNextStep = (trimData?: {
    startTime: number;
    endTime: number;
    originalSrc: string;
    duration: number;
  }) => {
    if (trimData) {
      dispatch(
        updateMovieData({
          trimStart: trimData.startTime,
          trimEnd: trimData.endTime,
          duration: trimData.duration,
        }),
      );
    }
    dispatch(goToStep(2));
  };

  useEffect(() => {
    if (!socketClient || !showEditMovie) return;

    const handleInviteResponse = (data: any) => {
      console.log("socketClient response received:", data);
      setShowEditMovie(false);
      dispatch(resetVideoState());
      router.push("profile");
    };

    socketClient?.on("add_invite_offline_response", handleInviteResponse);

    return () => {
      socketClient?.off("add_invite_offline_response", handleInviteResponse);
    };
  }, [socketClient, showEditMovie, navigation, setShowEditMovie, dispatch]);

  useEffect(() => {
    if (uploadStatus === "success" && mode?.typeMode === 3 && !socketClient) {
      setShowEditMovie(false);
      router.push("profile");
    }
  }, [uploadStatus, mode, socketClient, navigation, setShowEditMovie]);

  return {
    videoSrc,
    isLoadingBtn: isLoading,
    resMovieData,
    currentStep,
    movieData,
    setMovieData: (data: any) => dispatch(setMovieData(data)),
    handleUploadVideo,
    handleBack,
    updateMovieMeta: (updates: any) => dispatch(setMovieMeta(updates)),
    handleNextStep,
  };
};
