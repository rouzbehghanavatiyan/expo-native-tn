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
}

const initialState: ChatListState = { users: [], loaded: false };

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
  },
});

export const { setChatUsers, markSenderAsRead, incrementSenderUnread } =
  chatSlice.actions;
export default chatSlice.reducer;
