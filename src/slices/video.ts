import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Alert } from "react-native";
import {
  addAttachment,
  addInvite,
  addMovie,
  removeInvite,
} from "../services/masterServices";
import { logger } from "../utils/logger";
import { socketClient } from "../utils/socketClient";
import { RsetShowTimerButtn } from "./main";
import { VideoState } from "./type";
import {
  startMatchTimer,
  stopMatchTimer,
} from "../components/TimerForFindMatch";

const initialState: VideoState = {
  videoSrc: null,
  videoFile: null,
  showTimeout: false, // 👈 برای کنترل مودال خطا و عدم یافتن حریف
  isLoading: false,
  error: null,
  currentStep: 1,
  isWaitingForMatch: false,
  uploadStatus: "idle",
  resMovieData: null,
  movieData: {
    parentId: null,
    userId: null,
    movieId: null,
    status: null,
    inviteId: null,
    title: "",
    desc: "",
    trimStart: 0,
    trimEnd: 0,
    duration: 0,
  },
};

export const prepareVideoFileThunk = createAsyncThunk(
  "video/prepareFile",
  async (fileAsset: any) => {
    const src = fileAsset.uri;
    return { file: fileAsset, src };
  },
);

export const removeInviteThunk = createAsyncThunk(
  "video/removeInvite",
  async (inviteId: number) => {
    await removeInvite(inviteId);
    return inviteId;
  },
);

export const uploadFullProcessThunk = createAsyncThunk(
  "video/uploadFullProcess",
  async (
    { userId, gearId, segments, mode, allFormData, movieMeta, router }: any,
    { rejectWithValue, dispatch },
  ) => {
    try {
      const gearIdStorage = await AsyncStorage.getItem("gearId");

      const postData = {
        userId,
        description: allFormData?.description || movieMeta?.desc || "",
        title: allFormData?.title || movieMeta?.title || "",
        subSubCategoryId:
          allFormData?.subSubCategoryId || gearId || gearIdStorage,
        modeId: 3,
      };

      const movieRes = await addMovie(postData);
      const movieDataRes = movieRes?.data?.data;

      if (movieRes?.data?.status !== 0) {
        throw new Error("Error in recording initial movie information");
      }

      const formData = new FormData();

      if (allFormData?.video) {
        formData.append("FormFile", {
          uri: allFormData.video.uri,
          name: allFormData.video.name || "video.mp4",
          type: allFormData.video.type || "video/mp4",
        } as any);
      }

      if (allFormData?.imageCover) {
        formData.append("CoverImage", {
          uri: allFormData.imageCover.uri,
          name: allFormData.imageCover.name || "cover.jpg",
          type: allFormData.imageCover.type || "image/jpeg",
        } as any);
      }
      formData.append("AttachmentId", String(movieDataRes?.id ?? ""));
      formData.append("attachmentType", "pf");
      formData.append("attachmentName", "profile");

      const attachRes = await addAttachment(formData);
      if (attachRes?.status !== 0) {
        throw new Error("Error uploading attachments");
      }

      const requestData = {
        parentId: null,
        userId: Number(userId),
        movieId: Number(movieDataRes?.id),
        status: 0,
      };

      console.log("Test rerender from: video sliceee");
      const inviteRes = await addInvite(requestData);
      const inviteData = inviteRes?.data?.data;
      logger.info("inviteRes inviteRes inviteRes", inviteRes?.data);

      dispatch(RsetIsLoading(false));
      dispatch(RsetShowTimerButtn(true));
      socketClient.emit("register_user", userId);
      socketClient.emit("add_invite_offline", {
        ...inviteData,
        senderUserId: userId,
      });

      const handleReceiveInvite = (data: any) => {
        console.log("✅✅✅✅✅✅✅ Match found!", data);
        stopMatchTimer();
        dispatch(RsetShowTimerButtn(false));
        socketClient.off("receive_invite", handleReceiveInvite);
        router.replace("/(tabs)/profile");
      };

      socketClient.once("receive_invite", handleReceiveInvite);

      if (inviteData?.userId !== 0) {
        stopMatchTimer();
        router.replace("/(tabs)/profile");
        dispatch(RsetShowTimerButtn(false));
        socketClient.off("receive_invite", handleReceiveInvite);
      } else {
        startMatchTimer(() => {
          socketClient.off("receive_invite", handleReceiveInvite);
          dispatch(RsetShowTimerButtn(false));
          dispatch(setShowTimeout(true));

          router.replace("/(tabs)/watch");
        });
      }

      return {
        modeType: 3,
        movieData: movieDataRes,
        inviteData,
      };
    } catch (error: any) {
      stopMatchTimer();
      dispatch(RsetIsLoading(false));
      dispatch(RsetShowTimerButtn(false));

      if (error.isAxiosError && error.response) {
        console.log(
          "❌ Axios Error Response Data:",
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.log("❌ Generic Upload error:", error);
      }

      const errorMessage =
        error.response?.data?.message || error?.message || "Upload failed";
      Alert.alert("Error", errorMessage);

      return rejectWithValue(errorMessage);
    }
  },
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    RsetIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setVideoSrc(state, action: PayloadAction<string>) {
      state.videoSrc = action.payload;
    },
    setMovieData(state, action: PayloadAction<VideoState["movieData"]>) {
      state.movieData = action.payload;
    },
    updateMovieData(
      state,
      action: PayloadAction<Partial<VideoState["movieData"]>>,
    ) {
      state.movieData = { ...state.movieData, ...action.payload };
    },
    resetVideoState: () => initialState,
    setMovieMeta: (state, action) => {
      state.movieData.title = action.payload.title ?? state.movieData.title;
      state.movieData.desc = action.payload.desc ?? state.movieData.desc;
      state.movieData.userId = action.payload.userId ?? state.movieData.userId;
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setWaitingForMatch(state, action: PayloadAction<boolean>) {
      state.isWaitingForMatch = action.payload;
    },
    setShowTimeout(state, action: PayloadAction<boolean>) {
      // 👈 اضافه شد
      state.showTimeout = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(prepareVideoFileThunk.fulfilled, (state, action) => {
        state.videoFile = action.payload.file;
        state.videoSrc = action.payload.src;
      })
      .addCase(uploadFullProcessThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadStatus = "idle";
      })
      .addCase(uploadFullProcessThunk.fulfilled, (state, action) => {
        state.uploadStatus = "success";
        state.isLoading = false;
        const { movieData, inviteData } = action.payload;
        state.resMovieData = movieData;
        state.movieData.movieId = movieData?.id;
        if (inviteData) {
          state.movieData.inviteId = inviteData.id;
        }
      })
      .addCase(uploadFullProcessThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.uploadStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(removeInviteThunk.fulfilled, (state) => {
        state.movieData.inviteId = null;
      });
  },
});

export const {
  resetVideoState,
  setMovieData,
  setMovieMeta,
  goToStep,
  RsetIsLoading,
  updateMovieData,
  setVideoSrc,
  setShowTimeout,
} = videoSlice.actions;

export default videoSlice.reducer;
