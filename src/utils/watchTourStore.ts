import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

export type WatchTourStep = "card" | null;
export type Rect = { x: number; y: number; width: number; height: number };

const STORAGE_KEY = "watch_intro_seen_v2";

type State = {
  step: WatchTourStep;
  rect?: Rect;
};

let state: State = { step: null };
let dismissed = false; // در همین session دوباره نمایش داده نشود
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

export const watchTour = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getState: () => state,

  async start() {
    if (state.step || dismissed) return;
    try {
      const seen = await AsyncStorage.getItem(STORAGE_KEY);
      if (!seen && !dismissed) set({ step: "card" });
    } catch {}
  },

  async finish() {
    dismissed = true;
    set({ step: null });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  },

  async reset() {
    dismissed = false;
    set({ step: null });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await this.start();
    } catch (e) {
      console.log("Reset Tour Error:", e);
    }
  },

  setRect(rect: Rect) {
    const old = state.rect;
    if (
      old &&
      old.x === rect.x &&
      old.y === rect.y &&
      old.width === rect.width &&
      old.height === rect.height
    )
      return;
    set({ rect });
  },
};

export const useWatchTour = () =>
  useSyncExternalStore(
    watchTour.subscribe,
    watchTour.getState,
    watchTour.getState,
  );
