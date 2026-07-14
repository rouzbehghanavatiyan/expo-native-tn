import React, { useEffect, useState } from "react";
import { Spinner, Text, XStack } from "tamagui";

interface TimerProps {
  show: boolean;
  startTime?: number;
}

export const ButtonTimer: React.FC<TimerProps> = ({
  startTime = 120,
  show,
}) => {
  const [seconds, setSeconds] = useState(startTime);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (show) {
      setSeconds(startTime);

      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [show, startTime]);

  const formatTime = (total: number) => {
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!show) return null;

  return (
    <XStack alignItems="center" gap="$2">
      <Text color="white">{formatTime(seconds)}</Text>

      <XStack alignItems="center" gap="$2">
        <Text color="white" opacity={0.8}>
          Matching
        </Text>

        <Spinner size="small" color="white" />
      </XStack>
    </XStack>
  );
};
