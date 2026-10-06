import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export function useMatchOpen(
  endAt: number | null | undefined,
  onExpire?: () => void,
) {
  const [open, setOpen] = useState(() => !!endAt && endAt > Date.now());
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!endAt) {
      setOpen(false);
      return;
    }
    const ms = endAt - Date.now();
    if (ms <= 0) {
      setOpen(false);
      return;
    }
    setOpen(true);

    const expire = () => {
      setOpen(false);
      onExpireRef.current?.();
    };
    const t = setTimeout(expire, ms + 50);

    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active" && endAt <= Date.now()) {
        clearTimeout(t);
        expire();
      }
    });

    return () => {
      clearTimeout(t);
      sub.remove();
    };
  }, [endAt]);

  return open;
}
