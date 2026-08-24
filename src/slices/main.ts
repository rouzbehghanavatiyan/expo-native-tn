import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Pagination {
  take: number;
  skip: number;
  hasMore: boolean;
}

interface DataState<T = any> {
  pagination: Pagination;
  data: T[];
}

interface MainState {
  showTimerButtn: boolean;
  lastMatch: any[];
  unreadMessagesCount: number;
  watchVideo: DataState;
  homeMatch: DataState;
  showWatchMatch: DataState;
}

const initialPagination: Pagination = {
  take: 6,
  skip: 0,
  hasMore: true,
};

const initialDataState: DataState = {
  pagination: { ...initialPagination },
  data: [],
};

const initialState: any = {
  showTimerButtn: false,
  lastMatch: [],
  unreadMessagesCount: 0,
  watchVideo: { ...initialDataState },
  homeMatch: {
    pagination: {
      take: 6,
      skip: 0,
      hasMore: true,
    },
    data: [],
  },
  showWatchMatch: {
    pagination: {
      take: 6,
      skip: 0,
      hasMore: true,
    },
    data: [],
  },
  profileVideo: [],
  followingLength: 0,
  followerLength: 0,
  allFollowerList: [],
  allFollowingList: [],
  category: [],
  categoryCache: {},
  selectedSteps: {
    arenaId: null,
    skillId: null,
    gearId: null,
  },
  userLogin: {},
  userId: 0,
  socketConfig: null,
  userOnlines: null,
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setPaginationWatch: (state, action: PayloadAction<Pagination>) => {
      state.watchVideo.pagination = action.payload;
    },
    setWatchData: (state, action: PayloadAction<any[]>) => {
      state.watchVideo.data = action.payload;
    },
    RsetProfileVideo: (state, action: PayloadAction<any[]>) => {
      state.profileVideo = action.payload;
    },
    appendWatchData: (state, action: PayloadAction<any[]>) => {
      state.watchVideo.data = [...state.watchVideo.data, ...action.payload];
    },
    RsetAllFollowerList: (state, action: PayloadAction<any[]>) => {
      state.allFollowerList = action.payload;
    },
    RsetAllFollowingList: (state, action: PayloadAction<any[]>) => {
      state.allFollowingList = action.payload;
    },
    RsetFollowingLength: (state, action: PayloadAction<any[]>) => {
      state.followingLength = action.payload;
    },
    RsetFollowerLength: (state, action: PayloadAction<any[]>) => {
      state.followerLength = action.payload;
    },
    RsetLastMatch: (state, action: PayloadAction<any[]>) => {
      state.lastMatch = action.payload;
    },
    RsetCategory: (
      state,
      action: PayloadAction<any[] | { parentId: number | string; data: any[] }>,
    ) => {
      if (Array.isArray(action.payload)) {
        state.category = action.payload;
      } else {
        const { parentId, data } = action.payload;
        if (!state.categoryCache) {
          state.categoryCache = {};
        }
        state.categoryCache[parentId] = data;
      }
    },
    setSelectedStep: (
      state,
      action: PayloadAction<{
        step: "arenaId" | "skillId" | "gearId";
        id: number | null;
      }>,
    ) => {
      const { step, id } = action.payload;
      if (!state.selectedSteps) {
        state.selectedSteps = { arenaId: null, skillId: null, gearId: null };
      }
      state.selectedSteps[step] = id;
    },

    resetSelectedSteps: (state) => {
      state.selectedSteps = { arenaId: null, skillId: null, gearId: null };
    },
    RsetUserLogin: (state, action: PayloadAction<any>) => {
      state.userLogin = action.payload;
    },
    RsetUserId: (state, action: PayloadAction<any>) => {
      state.userId = action.payload;
    },
    RsetSocketConfig: (state, action: PayloadAction<any>) => {
      state.socketConfig = action.payload;
    },
    RsetGiveUserOnlines: (state, action: PayloadAction<any>) => {
      state.userOnlines = action.payload;
    },
    setPaginationHome: (state, action: PayloadAction<Pagination>) => {
      state.homeMatch.pagination = action.payload;
    },
    setHomeData: (state, action: PayloadAction<any[]>) => {
      state.homeMatch.data = action.payload;
    },
    RsetFollowerList: (state, action: PayloadAction<any[]>) => {
      state.followerList.data = action.payload;
    },
    RsetShowWatch: (state, action) => {
      state.showWatchMatch.data = action.payload;
    },
    appendHomeData: (state, action: PayloadAction<any[]>) => {
      state.homeMatch.data = [...state.homeMatch.data, ...action.payload];
    },
    setPaginationShowWatch: (state, action: PayloadAction<Pagination>) => {
      state.showWatchMatch.pagination = action.payload;
    },
    RsetShowTimerButtn: (state, action: PayloadAction<boolean>) => {
      state.showTimerButtn = action.payload;
    },
    setPaginationHomeMatch: (
      state,
      action: PayloadAction<{ take: number; skip: number; hasMore: boolean }>,
    ) => {
      state.homeMatch.pagination = action.payload;
    },
    setShowWatchData: (state, action: PayloadAction<any[]>) => {
      state.showWatchMatch.data = action.payload;
    },
    resetHomeMatch: (state) => {
      state.homeMatch.data = [];
      state.homeMatch.pagination = {
        skip: 0,
        take: 6,
        hasMore: true,
      };
    },
    appendHomeMatch: (state, action) => {
      state.homeMatch.data = [...state.homeMatch.data, ...action.payload];
    },
    appendShowWatch: (state, action) => {
      state.showWatchMatch.data = [
        ...state.showWatchMatch.data,
        ...action.payload,
      ];
    },
    RsetHomeMatch: (state, action: PayloadAction<any[]>) => {
      if (Array.isArray(action.payload)) {
        state.homeMatch.data = [...state.homeMatch.data, ...action.payload];
      }
    },
    setUnreadMessagesCount: (state, action: PayloadAction<number>) => {
      state.unreadMessagesCount = action.payload;
    },

    // 🟢 اضافه شدن اکشن برای افزایش تعداد پیام‌های خوانده نشده
    incrementUnreadCount: (state) => {
      state.unreadMessagesCount += 1;
    },

    // 🟢 اضافه شدن اکشن برای صفر کردن شمارنده
    clearUnreadCount: (state) => {
      state.unreadMessagesCount = 0;
    },

    setLastMatch: (state, action: PayloadAction<any[]>) => {
      state.lastMatch = action.payload;
    },
    setShowTimerButton: (state, action: PayloadAction<boolean>) => {
      state.showTimerButtn = action.payload;
    },
    resetWatchState: (state) => {
      state.watchVideo = { ...initialDataState };
    },
    resetProfileVideo: (state) => {
      state.profileVideo = [];
    },
    resetHomeState: (state) => {
      state.homeMatch = { ...initialDataState };
    },
    resetShowWatchState: (state) => {
      state.showWatchMatch = {
        data: [],
        pagination: {
          take: 6,
          skip: 0,
          hasMore: true,
        },
      };
    },
    resetAllFeeds: (state) => {
      state.watchVideo = { ...initialDataState };
      state.homeMatch = { ...initialDataState };
      state.showWatchMatch = { ...initialDataState };
    },
  },
});

export const {
  // watch
  setPaginationWatch,
  setWatchData,
  appendWatchData,

  // home
  setPaginationHome,
  setHomeData,
  appendHomeData,

  // showWatch
  setPaginationShowWatch,
  setShowWatchData,
  appendShowWatch,
  RsetProfileVideo,

  // other
  setUnreadMessagesCount,
  incrementUnreadCount, // 🟢 اضافه شد
  clearUnreadCount, // 🟢 اضافه شد
  setSelectedStep,
  resetSelectedSteps,
  setLastMatch,
  setShowTimerButton,
  RsetHomeMatch,
  setPaginationHomeMatch,
  RsetUserId,
  resetWatchState,
  resetProfileVideo,
  resetHomeState,
  RsetFollowerLength,
  RsetFollowingLength,
  resetShowWatchState,
  resetAllFeeds,
  RsetAllFollowerList,
  RsetAllFollowingList,
  RsetCategory,
  RsetUserLogin,
  RsetSocketConfig,
  RsetGiveUserOnlines,
  RsetShowWatch,
  appendHomeMatch,
  resetHomeMatch,
  RsetShowTimerButtn,
} = mainSlice.actions;

export default mainSlice.reducer;
