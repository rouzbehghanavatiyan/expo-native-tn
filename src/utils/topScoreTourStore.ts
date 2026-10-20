import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { View as RNView } from "react-native";

export type Rect = { x: number; y: number; width: number; height: number };
export type TopScoreTourStep = "list" | null;

const STORAGE_KEY = "top_score_intro_seen_v1";

type State = { step: TopScoreTourStep; rect?: Rect };

let state: State = { step: null };
let dismissed = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

export const topScoreTour = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getState: () => state,

  async start() {
    if (state.step || dismissed) return;
    try {
      const seen = await AsyncStorage.getItem(STORAGE_KEY);
      if (!seen && !dismissed) set({ step: "list" });
    } catch {}
  },

  async finish() {
    dismissed = true;
    set({ step: null });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "1");
    } catch {}
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

export const useTopScoreTour = () =>
  useSyncExternalStore(
    topScoreTour.subscribe,
    topScoreTour.getState,
    topScoreTour.getState,
  );

/** ref و onLayout را روی المان هدف (ردیف اول) بگذار */
export function useTopScoreTarget() {
  const ref = useRef<RNView>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        topScoreTour.setRect({ x, y, width, height });
      }
    });
  }, []);

  const schedule = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [0, 300, 800].map((ms) => setTimeout(measure, ms));
  }, [measure]);

  const { step } = useTopScoreTour();
  useEffect(() => {
    if (step) schedule();
  }, [step, schedule]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return { ref, onLayout: schedule, collapsable: false as const };
}
