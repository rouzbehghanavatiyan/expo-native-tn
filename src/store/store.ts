import mainReducer from "@/src/slices/main";
import videoSlice from "@/src/slices/video";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    video: videoSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
