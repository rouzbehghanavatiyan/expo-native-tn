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
  gearId: 0,
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
    { segments, mode, allFormData, movieMeta, router }: any,
    { rejectWithValue, dispatch, getState },
  ) => {
    try {
      const state = getState() as any;
      const userGender = state?.main?.userLogin?.user?.userGender;
      const userId =
        state?.main?.userLogin?.user?.id || state?.main?.userLogin?.userId;
      const currentResizeMode = state.video.selectedResize || 1;
      const targetGender = state?.video?.movieData?.targetGender;
      logger.info("state?.main?.userLogin", state?.main?.userLogin);
      logger.info("typeof targetGender", typeof targetGender);
      logger.info("typeof userId", typeof userId);
      let reqMatchToGender = 1;

      if (targetGender === "male") {
        reqMatchToGender = 1;
      } else if (targetGender === "female") {
        reqMatchToGender = 2;
      } else {
        reqMatchToGender = Math.floor(Math.random() * 5) + 1;
      }

      const postData = {
        userId: Number(userId),
        resizeMode: currentResizeMode,
        description: allFormData?.description || movieMeta?.desc || "",
        title: allFormData?.title || movieMeta?.title || "",
        subSubCategoryId: 1004,
        modeId: 3,
        userGender: userGender || 1,
        reqMatchToGender: reqMatchToGender || 94,
      };

      logger.debug("postData", postData);

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
            message: "Your video has been successfully uploaded to Match!🎉",
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
    setGearId: (state, action) => {
      state.gearId = action.payload;
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
      state.showTimeout = action.payload;
    },
    setShowDeactivatedModal(state, action: PayloadAction<boolean>) {
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
  setGearId,
  RsetIsLoading,
  updateMovieData,
  setVideoSrc,
  RsetSelectedResize,
  setShowTimeout,
  setNeedProfileRefresh,
  setShowDeactivatedModal,
} = videoSlice.actions;

export default videoSlice.reducer;

//  {
//   "main": {
//     "showTimerButtn": false,
//     "lastMatch": [],
//     "unreadMessagesCount": 0,
//     "watchVideo": {
//       "pagination": {
//         "take": 6,
//         "skip": 6,
//         "hasMore": true
//       },
//       "data": [
//         {
//           "matchRemainingSeconds": 0,
//           "inviteInserted": {
//             "id": 30224,
//             "parentId": null,
//             "userId": 5074,
//             "movieId": 80647,
//             "insertDate": -1
//           },
//           "inviteMatched": {
//             "id": 30225,
//             "parentId": 30224,
//             "userId": 5075,
//             "movieId": 80648,
//             "insertDate": -1
//           },
//           "attachmentInserted": {
//             "id": 40414,
//             "attachmentId": 80647,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80647_yv97xefbyyjb_80647_68ea44d1d08e4eebacaaac78c3538b94",
//             "ext": ".png",
//             "insertDate": "2026-09-21T11:43:41.721398"
//           },
//           "attachmentMatched": {
//             "id": 40416,
//             "attachmentId": 80648,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80648_ghf7i12jruul_80648_20272d6b69ed4875a50d6d3d3a570319",
//             "ext": ".png",
//             "insertDate": "2026-09-21T11:43:54.5670082"
//           },
//           "movieInserted": null,
//           "movieMatched": null,
//           "userInserted": {
//             "userGender": null,
//             "id": 5074,
//             "userName": "IdaBergfoth"
//           },
//           "userMatched": {
//             "userGender": null,
//             "id": 5075,
//             "userName": "antonella_cpt"
//           },
//           "likeInserted": 0,
//           "resizeModeInserted": null,
//           "resizeModeMatched": null,
//           "isBlockedInserted": false,
//           "isBlockedMatched": false,
//           "likeMatched": 0,
//           "scoreInserted": 0,
//           "scoreMatched": 0,
//           "profileInserted": null,
//           "profileMatched": null,
//           "isFinished": true,
//           "isLikedInserted": false,
//           "isLikedMatched": false,
//           "scoreMode": null,
//           "subSubCategory": "sport",
//           "isFollowedMeInserted": false,
//           "isFollowedMeMatched": false,
//           "icon": "SportsKabaddi"
//         },
//         {
//           "matchRemainingSeconds": 0,
//           "inviteInserted": {
//             "id": 30282,
//             "parentId": null,
//             "userId": 5078,
//             "movieId": 80709,
//             "insertDate": -1
//           },
//           "inviteMatched": {
//             "id": 30283,
//             "parentId": 30282,
//             "userId": 5113,
//             "movieId": 80710,
//             "insertDate": -1
//           },
//           "attachmentInserted": {
//             "id": 40554,
//             "attachmentId": 80709,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80709_dkldzl9racis_80709_98d2ae5056b74770aa8033cf123e0082",
//             "ext": ".png",
//             "insertDate": "2026-09-28T05:22:20.3332888"
//           },
//           "attachmentMatched": {
//             "id": 40570,
//             "attachmentId": 80710,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80710_e4nz46anxgjt_80710_caf2707c1c65426fb419b59a52a31f12",
//             "ext": ".png",
//             "insertDate": "2026-09-28T05:59:30.3805152"
//           },
//           "movieInserted": null,
//           "movieMatched": null,
//           "userInserted": {
//             "userGender": null,
//             "id": 5078,
//             "userName": "ariyelyu_fit"
//           },
//           "userMatched": {
//             "userGender": null,
//             "id": 5113,
//             "userName": "matheusbtl"
//           },
//           "likeInserted": 0,
//           "resizeModeInserted": null,
//           "resizeModeMatched": null,
//           "isBlockedInserted": false,
//           "isBlockedMatched": false,
//           "likeMatched": 0,
//           "scoreInserted": 0,
//           "scoreMatched": 0,
//           "profileInserted": null,
//           "profileMatched": null,
//           "isFinished": true,
//           "isLikedInserted": false,
//           "isLikedMatched": false,
//           "scoreMode": null,
//           "subSubCategory": "sport",
//           "isFollowedMeInserted": false,
//           "isFollowedMeMatched": false,
//           "icon": "SportsKabaddi"
//         },
//         {
//           "matchRemainingSeconds": 0,
//           "inviteInserted": {
//             "id": 30226,
//             "parentId": null,
//             "userId": 5074,
//             "movieId": 80649,
//             "insertDate": -1
//           },
//           "inviteMatched": {
//             "id": 30227,
//             "parentId": 30226,
//             "userId": 5075,
//             "movieId": 80650,
//             "insertDate": -1
//           },
//           "attachmentInserted": {
//             "id": 40418,
//             "attachmentId": 80649,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80649_2pwtzz9ja6b8_80649_fffc67637452426c808f5e133bfae821",
//             "ext": ".png",
//             "insertDate": "2026-09-21T11:44:53.2393559"
//           },
//           "attachmentMatched": {
//             "id": 40420,
//             "attachmentId": 80650,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80650_11cclpnxvlnj_80650_2aab1a9d21774481bc15f279fd818eeb",
//             "ext": ".png",
//             "insertDate": "2026-09-21T11:45:07.7990029"
//           },
//           "movieInserted": null,
//           "movieMatched": null,
//           "userInserted": {
//             "userGender": null,
//             "id": 5074,
//             "userName": "IdaBergfoth"
//           },
//           "userMatched": {
//             "userGender": null,
//             "id": 5075,
//             "userName": "antonella_cpt"
//           },
//           "likeInserted": 0,
//           "resizeModeInserted": null,
//           "resizeModeMatched": null,
//           "isBlockedInserted": false,
//           "isBlockedMatched": false,
//           "likeMatched": 0,
//           "scoreInserted": 0,
//           "scoreMatched": 0,
//           "profileInserted": null,
//           "profileMatched": null,
//           "isFinished": true,
//           "isLikedInserted": false,
//           "isLikedMatched": false,
//           "scoreMode": null,
//           "subSubCategory": "sport",
//           "isFollowedMeInserted": false,
//           "isFollowedMeMatched": false,
//           "icon": "SportsKabaddi"
//         },
//         {
//           "matchRemainingSeconds": 0,
//           "inviteInserted": {
//             "id": 30290,
//             "parentId": null,
//             "userId": 5092,
//             "movieId": 80717,
//             "insertDate": -1
//           },
//           "inviteMatched": {
//             "id": 30291,
//             "parentId": 30290,
//             "userId": 5114,
//             "movieId": 80718,
//             "insertDate": -1
//           },
//           "attachmentInserted": {
//             "id": 40584,
//             "attachmentId": 80717,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80717_ca80n3wdj251_80717_05850d6d44ea467eabe6122b1e0b7848",
//             "ext": ".png",
//             "insertDate": "2026-10-05T21:56:24.5691515"
//           },
//           "attachmentMatched": {
//             "id": 40586,
//             "attachmentId": 80718,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80718_ylnzfqoji168_80718_57e9ce329a954742b8bca6d16e4b993a",
//             "ext": ".png",
//             "insertDate": "2026-10-05T21:56:57.1953029"
//           },
//           "movieInserted": null,
//           "movieMatched": null,
//           "userInserted": {
//             "userGender": null,
//             "id": 5092,
//             "userName": "tabonefitness"
//           },
//           "userMatched": {
//             "userGender": null,
//             "id": 5114,
//             "userName": "mickmovements"
//           },
//           "likeInserted": 1,
//           "resizeModeInserted": null,
//           "resizeModeMatched": null,
//           "isBlockedInserted": false,
//           "isBlockedMatched": false,
//           "likeMatched": 0,
//           "scoreInserted": 10,
//           "scoreMatched": 10,
//           "profileInserted": null,
//           "profileMatched": null,
//           "isFinished": true,
//           "isLikedInserted": false,
//           "isLikedMatched": false,
//           "scoreMode": null,
//           "subSubCategory": "sport",
//           "isFollowedMeInserted": false,
//           "isFollowedMeMatched": false,
//           "icon": "SportsKabaddi"
//         },
//         {
//           "matchRemainingSeconds": 0,
//           "inviteInserted": {
//             "id": 30252,
//             "parentId": null,
//             "userId": 5102,
//             "movieId": 80677,
//             "insertDate": -1
//           },
//           "inviteMatched": {
//             "id": 30253,
//             "parentId": 30252,
//             "userId": 5084,
//             "movieId": 80678,
//             "insertDate": -1
//           },
//           "attachmentInserted": {
//             "id": 40470,
//             "attachmentId": 80677,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80677_x869ed2f9c01_80677_bf0c10af24ef425bb719c7df2bae5d4e",
//             "ext": ".png",
//             "insertDate": "2026-09-27T23:25:38.3409091"
//           },
//           "attachmentMatched": {
//             "id": 40472,
//             "attachmentId": 80678,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80678_eemzkd0lwjkj_80678_6bbdc0192e1b48ee8dd3f0be2fed8c19",
//             "ext": ".png",
//             "insertDate": "2026-09-27T23:27:20.4451197"
//           },
//           "movieInserted": null,
//           "movieMatched": null,
//           "userInserted": {
//             "userGender": null,
//             "id": 5102,
//             "userName": "jasonbjarnson"
//           },
//           "userMatched": {
//             "userGender": null,
//             "id": 5084,
//             "userName": "litvinovfit"
//           },
//           "likeInserted": 0,
//           "resizeModeInserted": null,
//           "resizeModeMatched": null,
//           "isBlockedInserted": false,
//           "isBlockedMatched": false,
//           "likeMatched": 0,
//           "scoreInserted": 0,
//           "scoreMatched": 0,
//           "profileInserted": null,
//           "profileMatched": null,
//           "isFinished": true,
//           "isLikedInserted": false,
//           "isLikedMatched": false,
//           "scoreMode": null,
//           "subSubCategory": "sport",
//           "isFollowedMeInserted": false,
//           "isFollowedMeMatched": false,
//           "icon": "SportsKabaddi"
//         },
//         {
//           "matchRemainingSeconds": 0,
//           "inviteInserted": {
//             "id": 30238,
//             "parentId": null,
//             "userId": 5092,
//             "movieId": 80663,
//             "insertDate": -1
//           },
//           "inviteMatched": {
//             "id": 30239,
//             "parentId": 30238,
//             "userId": 5080,
//             "movieId": 80664,
//             "insertDate": -1
//           },
//           "attachmentInserted": {
//             "id": 40442,
//             "attachmentId": 80663,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80663_h0mtcj0bubrv_80663_40f7eee1ca034a6888fbe1cf78790b03",
//             "ext": ".png",
//             "insertDate": "2026-09-27T01:50:06.7350218"
//           },
//           "attachmentMatched": {
//             "id": 40444,
//             "attachmentId": 80664,
//             "attachmentType": "mo",
//             "attachmentName": "movies",
//             "fileName": "cover_80664_jlc0z28yxvj8_80664_b7db577f519a41b08922ad1906d0d4e5",
//             "ext": ".png",
//             "insertDate": "2026-09-27T03:28:27.5785458"
//           },
//           "movieInserted": null,
//           "movieMatched": null,
//           "userInserted": {
//             "userGender": null,
//             "id": 5092,
//             "userName": "tabonefitness"
//           },
//           "userMatched": {
//             "userGender": null,
//             "id": 5080,
//             "userName": "growingannanas"
//           },
//           "likeInserted": 0,
//           "resizeModeInserted": null,
//           "resizeModeMatched": null,
//           "isBlockedInserted": false,
//           "isBlockedMatched": false,
//           "likeMatched": 0,
//           "scoreInserted": 10,
//           "scoreMatched": 0,
//           "profileInserted": null,
//           "profileMatched": null,
//           "isFinished": true,
//           "isLikedInserted": false,
//           "isLikedMatched": false,
//           "scoreMode": null,
//           "subSubCategory": "sport",
//           "isFollowedMeInserted": false,
//           "isFollowedMeMatched": false,
//           "icon": "SportsKabaddi"
//         }
//       ]
//     },
//     "homeMatch": {
//       "pagination": {
//         "take": 6,
//         "skip": 0,
//         "hasMore": true
//       },
//       "data": []
//     },
//     "showWatchMatch": {
//       "pagination": {
//         "take": 6,
//         "skip": 0,
//         "hasMore": true
//       },
//       "data": []
//     },
//     "profileVideo": [],
//     "followingLength": {
//       "count": 0
//     },
//     "followerLength": {
//       "count": 0
//     },
//     "allFollowerList": [],
//     "allFollowingList": [],
//     "category": [
//       {
//         "id": 1,
//         "name": "solo",
//         "icon": "Person"
//       },
//       {
//         "id": 2,
//         "name": "group",
//         "icon": "Groups"
//       },
//       {
//         "id": 1002,
//         "name": "cup",
//         "icon": "EmojiEvents"
//       }
//     ],
//     "categoryCache": {},
//     "selectedSteps": {
//       "arenaId": null,
//       "skillId": null,
//       "gearId": null
//     },
//     "userLogin": {
//       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQXJtYW5kbyIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiNTExOSIsImp0aSI6IjUxNGU4M2ZlLTIxZDAtNDQ0MS05NGFjLWJlMzUzZTkxN2ZjMyIsIlVzZXJJZCI6IjUxMTkiLCJleHAiOjE3OTEzMDU5MjYsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NzE0MiIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NzE0MiJ9.hSdzI-oJCJ46gaYc5aPurTjAsWm38r1DNna8SeHqvPM",
//       "userId": 5119
//     },
//     "userId": 5119,
//     "socketConfig": {
//       "socketId": "SSf0KSKm9GyUuwLcAAAw",
//       "connected": true
//     },
//     "userOnlines": null
//   },
//   "video": {
//     "videoSrc": "file:///data/user/0/clashtalent.com/cache/ImagePicker/b30c7679-464a-4fa5-a680-20bf28dfeb67.mp4",
//     "videoFile": {
//       "uri": "file:///data/user/0/clashtalent.com/cache/ImagePicker/b30c7679-464a-4fa5-a680-20bf28dfeb67.mp4",
//       "name": "video_1791293937291.mp4",
//       "type": "video/mp4"
//     },
//     "showTimeout": false,
//     "isLoading": true,
//     "selectedResize": 1,
//     "error": null,
//     "gearId": 0,
//     "needProfileRefresh": false,
//     "showDeactivatedModal": false,
//     "currentStep": 1,
//     "isWaitingForMatch": false,
//     "uploadStatus": "idle",
//     "resMovieData": null,
//     "movieData": {
//       "parentId": null,
//       "userId": null,
//       "movieId": null,
//       "status": null,
//       "inviteId": null,
//       "title": "",
//       "desc": "",
//       "trimStart": 0,
//       "trimEnd": 0,
//       "duration": 0,
//       "targetGender": "female"
//     }
//   },
//   "chat": {
//     "users": [],
//     "loaded": false
//   }
// }
