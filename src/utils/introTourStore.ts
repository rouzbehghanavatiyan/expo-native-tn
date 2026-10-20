import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

export type TourStep = "roles" | "follow" | "fullscreen" | "menu" | null;
export type Rect = { x: number; y: number; width: number; height: number };

const STORAGE_KEY = "home_match_intro_seen_v2";
const ORDER: Exclude<TourStep, null>[] = [
  "roles",
  "follow",
  "fullscreen",
  "menu",
];

type State = {
  step: TourStep;
  rects: Partial<Record<"follow" | "fullscreen" | "menu", Rect>>;
};

let state: State = { step: null, rects: {} };
const listeners = new Set<() => void>();
let dismissed = false; // در همین session دوباره نمایش داده نشود

const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

export const introTour = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getState: () => state,

  next() {
    const i = state.step ? ORDER.indexOf(state.step) : -1;
    if (i === -1) return;
    if (i === ORDER.length - 1) return this.finish();
    set({ step: ORDER[i + 1] });
  },

  async start() {
    if (state.step || dismissed) return;
    try {
      const seen = await AsyncStorage.getItem(STORAGE_KEY);
      if (!seen && !dismissed) set({ step: "roles" });
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

  setRect(key: "follow" | "fullscreen" | "menu", rect: Rect) {
    const old = state.rects[key];
    if (
      old &&
      old.x === rect.x &&
      old.y === rect.y &&
      old.width === rect.width &&
      old.height === rect.height
    )
      return;
    set({ rects: { ...state.rects, [key]: rect } });
  },
};

export const useIntroTour = () =>
  useSyncExternalStore(
    introTour.subscribe,
    introTour.getState,
    introTour.getState,
  );
