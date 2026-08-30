import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Alert } from "react-native";
import {
  startMatchTimer,
  stopMatchTimer,
} from "../components/TimerForFindMatch";
import {
  addAttachment,
  addInvite,
  addMovie,
  removeInvite,
} from "../services/masterServices";
import { sendUserNotif } from "../services/notificationService";
import { logger } from "../utils/logger";
import { socketClient } from "../utils/socketClient";
import { RsetShowTimerButtn } from "./main";
import { VideoState } from "./type";

const initialState: VideoState = {
  videoSrc: null,
  videoFile: null,
  showTimeout: false,
  isLoading: false,
  selectedResize: 1,
  error: null,
  needProfileRefresh: false,
  showDeactivatedModal: false,
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
  async (inviteId: number, { dispatch }) => {
    const res = await removeInvite(inviteId);

    if (res?.data?.status === 0) {
      dispatch(setShowDeactivatedModal(true));
    }

    return inviteId;
  },
);

export const uploadFullProcessThunk = createAsyncThunk(
  "video/uploadFullProcess",
  async (
    { userId, gearId, segments, mode, allFormData, movieMeta, router }: any,
    { rejectWithValue, dispatch, getState },
  ) => {
    try {
      const state = getState() as any;
      const gearIdStorage = await AsyncStorage.getItem("gearId");
      console.log(
        "gearIdgearIdgearIdgearIdgearIdgearIdgearIdgearIdgearId",
        gearId,
      );
      const currentResizeMode = state.video.selectedResize || 1;
      const postData = {
        userId: Number(userId),
        resizeMode: currentResizeMode,
        description: allFormData?.description || movieMeta?.desc || "",
        title: allFormData?.title || movieMeta?.title || "",
        // subSubCategoryId: Number(
        //   allFormData?.subSubCategoryId || gearId || gearIdStorage,
        // ),
        subSubCategoryId: 1,
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
      logger.info("allFormData", allFormData);
      if (allFormData?.imageCover) {
        formData.append("FormFile", {
          uri: allFormData.imageCover.uri,
          name: allFormData.imageCover.name || "cover.png",
          type: allFormData.imageCover.type || "image/png",
        } as any);
      }
      formData.append("attachmentId", String(movieDataRes?.id));
      formData.append("attachmentType", "mo");
      formData.append("attachmentName", "movies");

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
      dispatch(setNeedProfileRefresh(true));
      dispatch(RsetIsLoading(false));
      dispatch(RsetShowTimerButtn(true));
      socketClient.emit("register_user", userId);
      socketClient.emit("add_invite_offline", {
        ...inviteData,
        senderUserId: userId,
      });
      const currentUserId = Number(userId);
      const notifyMatchedUser = async (rawReceiverId: any) => {
        const receiverUserId = Number(rawReceiverId);
        if (!receiverUserId || receiverUserId === currentUserId) {
          logger.warn(
            "⚠️ Could not resolve receiver userId for match notification",
            rawReceiverId,
          );
          return;
        }
        try {
          const res = await sendUserNotif({
            userId: receiverUserId,
            message: "شما یک مچ جدید پیدا کردید! 🎉",
          });
          logger.info("✅ Match notification sent", res?.data);
        } catch (error) {
          logger.error("❌ Error sending match notification", error);
        }
      };
      const handleReceiveInvite = async (data: any) => {
        logger.info("✅ Match found!", {
          senderUserId: data?.senderUserId,
          userId: data?.userId,
        });
        stopMatchTimer();
        dispatch(RsetShowTimerButtn(false));

        const receiverUserId =
          Number(data?.senderUserId) === currentUserId
            ? Number(data?.userId)
            : Number(data?.senderUserId);

        await notifyMatchedUser(receiverUserId);

        socketClient.off("receive_invite", handleReceiveInvite);
        router.replace("/(tabs)/profile");
      };

      socketClient.once("receive_invite", handleReceiveInvite);

      if (inviteData?.userId !== 0) {
        stopMatchTimer();
        router.replace("/(tabs)/profile");
        dispatch(RsetShowTimerButtn(false));
        await notifyMatchedUser(inviteData?.userId);

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

      if (error?.response) {
        console.log("❌ Server Error Status:", error.response.status);
        console.log(
          "❌ Server Error Data:",
          JSON.stringify(error.response.data, null, 2),
        );
      } else if (error?.request) {
        console.log(
          "❌ Network / Timeout Error (No response received):",
          error.message,
        );
      } else {
        console.log("❌ Code/Runtime/Custom Error Message:", error.message);
        console.log("❌ Error Stack Trace:", error.stack);
      }

      const errorMessage =
        error.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        "Upload failed";

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
      state.movieData = action?.payload;
    },
    RsetSelectedResize(state, action: PayloadAction<any>) {
      state.selectedResize = action?.payload;
    },
    setNeedProfileRefresh: (state, action) => {
      state.needProfileRefresh = action.payload;
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
    setShowDeactivatedModal(state, action: PayloadAction<boolean>) {
      // 👈 ردیوسر جدید اضافه شد
      state.showDeactivatedModal = action.payload;
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
        const movieData = action.payload?.movieData;
        const inviteData = action.payload?.inviteData;

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
  RsetSelectedResize,
  setShowTimeout,
  setNeedProfileRefresh,
  setShowDeactivatedModal,
} = videoSlice.actions;

export default videoSlice.reducer;
