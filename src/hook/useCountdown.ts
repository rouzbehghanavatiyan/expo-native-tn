import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const calc = (endAt: number | null) =>
  endAt ? Math.max(Math.ceil((endAt - Date.now()) / 1000), 0) : 0;

export function useCountdown(
  endAt: number | null,
  active = true,
  onExpire?: () => void,
) {
  const [remaining, setRemaining] = useState(() => calc(endAt));
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!active || !endAt) {
      setRemaining(0);
      return;
    }
    const wasRunning = calc(endAt) > 0;
    let fired = false;

    const tick = () => {
      const left = calc(endAt);
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        if (wasRunning && !fired) {
          fired = true;
          onExpireRef.current?.();
        }
      }
    };

    const id = setInterval(tick, 1000);
    tick();
    // وقتی اپ از بک‌گراند برگشت، فوراً همگام شود
    const sub = AppState.addEventListener(
      "change",
      (s) => s === "active" && tick(),
    );

    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [endAt, active]);

  return remaining;
}
