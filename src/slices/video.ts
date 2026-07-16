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

const initialState: VideoState = {
  videoSrc: null,
  videoFile: null,
  showTimeout: false,
  isLoading: false,
  error: null,
  currentStep: 1,
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
    { userId, gearId, mode, allFormData, movieMeta, router }: any,
    { rejectWithValue, dispatch },
  ) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

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

      // const formData = new FormData();
      // formData.append("formFile", allFormData?.video);
      // formData.append("formFile", allFormData?.imageCover);
      // formData.append("attachmentId", movieDataRes?.id);
      // formData.append("attachmentType", "mo");
      // formData.append("attachmentName", "movies");
      // formData.append("width", "300");
      // formData.append("height", "300");
      const formData = new FormData();
      formData.append("AttachmentId", String(movieDataRes?.id ?? ""));
      formData.append("AttachmentType", "mo");
      formData.append("AttachmentName", "movies");
      formData.append("width", "300");
      formData.append("height", "300");
      formData.append("FormFile", {
        uri: allFormData?.video?.uri,
        name: allFormData?.video?.name || "video.mp4",
        type: allFormData?.video?.type || "video/mp4",
      } as any);

      if (allFormData?.imageCover) {
        formData.append("CoverImage", {
          uri: allFormData.imageCover.uri,
          name: allFormData.imageCover.name || "cover.jpg",
          type: allFormData.imageCover.type || "image/jpeg",
        } as any);
      }
      const attachRes = await addAttachment(formData);
      logger.info("attachRes attachRes attachRes", attachRes);

      if (attachRes?.data?.status !== 0) {
        throw new Error("Error uploading attachments");
      }

      const requestData = {
        parentId: null,
        userId: Number(userId),
        movieId: Number(movieDataRes?.id),
        status: 0,
      };

      const inviteRes = await addInvite(requestData);
      const inviteData = inviteRes?.data?.data;
      logger.info("inviteRes inviteRes inviteRes", inviteRes);
      dispatch(RsetIsLoading(false));
      dispatch(RsetShowTimerButtn(true));
      socketClient.emit("register_user", userId);
      socketClient.emit("add_invite_offline", {
        ...inviteData,
        senderUserId: userId,
      });
      socketClient.once("receive_invite", (matchData: any) => {
        console.log("✅✅✅✅✅✅✅ Match found!", timeoutId, matchData);
        if (timeoutId) clearTimeout(timeoutId);
        dispatch(RsetShowTimerButtn(false));
        router.replace("/(tabs)/profile");
      });

      let isMatched = false;

      const handleReceiveInvite = (data: any) => {
        console.log("✅ Match created:", data);
        isMatched = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        dispatch(RsetShowTimerButtn(false));
        socketClient.off("receive_invite", handleReceiveInvite);
      };
      socketClient.once("receive_invite", handleReceiveInvite);
      timeoutId = setTimeout(() => {
        if (isMatched) return;
        socketClient.off("receive_invite", handleReceiveInvite);
        dispatch(RsetShowTimerButtn(false));
        Alert.alert(
          "No Match Found",
          "Unfortunately, no tournament match was found.",
        );

        router.replace("/(tabs)/watch");
      }, 120000);

      return {
        modeType: mode?.typeMode,
        movieData: movieDataRes,
        inviteData,
      };
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      dispatch(RsetIsLoading(false));
      dispatch(RsetShowTimerButtn(false));

      console.log("❌ Upload error:", error);
      Alert.alert("Error", error?.message || "Upload failed");

      return rejectWithValue(error.message || "Upload failed");
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
    // clearVideo(state) {
    //   state.videoSrc = "";
    //   state.movieData = null;
    // },
    resetVideoState: () => initialState,

    setMovieMeta: (state, action) => {
      state.movieData.title = action.payload.title ?? state.movieData.title;
      state.movieData.desc = action.payload.desc ?? state.movieData.desc;
      state.movieData.userId = action.payload.userId ?? state.movieData.userId;
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
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
        state.isLoading = false; // اضافه شد تا لودینگ متوقف شود

        const { movieData, inviteData, modeType } = action.payload;

        state.resMovieData = movieData;
        state.movieData.movieId = movieData?.id;

        if (inviteData) {
          state.movieData.inviteId = inviteData.id;
        }

        if (modeType === 4) {
          state.currentStep = 3;
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
} = videoSlice.actions;

export default videoSlice.reducer;
