// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatSenderData {
  sender: any;
  unreadCount?: number;
  isReadChat?: boolean;
  [key: string]: any;
}

interface ChatListState {
  users: ChatSenderData[];
  loaded: boolean;
  skip: number;
  hasMore: boolean;
}

const initialState: ChatListState = {
  users: [],
  loaded: false,
  skip: 0,
  hasMore: true,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatUsers(state, action: PayloadAction<ChatSenderData[]>) {
      state.users = action.payload;
      state.loaded = true;
    },
    markSenderAsRead(state, action: PayloadAction<string>) {
      const senderStr = String(action.payload);
      const user = state.users.find((u) => String(u.sender) === senderStr);
      if (user) {
        user.isReadChat = true;
        user.unreadCount = 0;
      }
    },
    incrementSenderUnread(state, action: PayloadAction<string>) {
      const senderStr = String(action.payload);
      const index = state.users.findIndex(
        (u) => String(u.sender) === senderStr,
      );
      if (index > -1) {
        const user = { ...state.users[index] };
        user.unreadCount = (user.unreadCount || 0) + 1;
        user.isReadChat = false;
        state.users.splice(index, 1);
        state.users.unshift(user);
      }
    },
    setChatUsersPage: (
      state,
      action: PayloadAction<{ data: any[]; hasMore: boolean; reset?: boolean }>,
    ) => {
      const { data, hasMore, reset } = action.payload;

      if (reset) {
        state.users = data;
        state.skip = data.length;
      } else {
        const existing = new Set(state.users.map((u) => String(u.sender)));
        const fresh = data.filter((u) => !existing.has(String(u.sender)));
        state.users.push(...fresh);
        state.skip += data.length;
      }

      state.hasMore = hasMore;
      state.loaded = true;
    },
  },
});

export const {
  setChatUsers,
  markSenderAsRead,
  setChatUsersPage,
  incrementSenderUnread,
} = chatSlice.actions;
export default chatSlice.reducer;
