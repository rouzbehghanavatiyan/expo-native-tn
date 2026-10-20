import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { View as RNView } from "react-native";

export type ProfileTourKey = "match" | "rank";
export type ProfileTourStep = ProfileTourKey | null;
export type Rect = { x: number; y: number; width: number; height: number };

const STORAGE_KEY = "profile_intro_seen_v2";
// جابجایی استپ ۱ و ۴
export const ORDER: ProfileTourKey[] = ["match", "rank"];

type State = {
  step: ProfileTourStep;
  rects: Partial<Record<ProfileTourKey, Rect>>;
};

let state: State = { step: null, rects: {} };
let dismissed = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

export const profileTour = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getState: () => state,

  async start() {
    if (state.step || dismissed) return;
    try {
      const seen = await AsyncStorage.getItem(STORAGE_KEY);
      if (!seen && !dismissed) set({ step: ORDER[0] });
    } catch {}
  },

  next() {
    const i = state.step ? ORDER.indexOf(state.step) : -1;
    if (i === -1) return;
    if (i === ORDER.length - 1) return this.finish();
    set({ step: ORDER[i + 1] });
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
  setRect(key: ProfileTourKey, rect: Rect) {
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

export const useProfileTour = () =>
  useSyncExternalStore(
    profileTour.subscribe,
    profileTour.getState,
    profileTour.getState,
  );

export function useTourTarget(key: ProfileTourKey) {
  const ref = useRef<RNView>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        profileTour.setRect(key, { x, y, width, height });
      }
    });
  }, [key]);

  const schedule = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [0, 300, 800].map((ms) => setTimeout(measure, ms));
  }, [measure]);

  const { step } = useProfileTour();
  useEffect(() => {
    if (step === key) schedule();
  }, [step, key, schedule]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return { ref, onLayout: schedule, collapsable: false as const };
}
