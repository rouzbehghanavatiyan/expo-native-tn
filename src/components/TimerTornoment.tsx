import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { addScoure } from "../services/masterServices";
import { socketClient } from "../utils/socketClient";
import { Icon } from "./Icon";

interface TimerTornomentProps {
  startTime: number;
  duration: number;
  active: boolean;
  className?: string;
  onComplete?: () => void;
  video: any;
}

const TimerTornoment: React.FC<TimerTornomentProps> = ({
  startTime,
  video,
  duration = 3600,
  active,
  onComplete,
}) => {
  const [winnerInfo, setWinnerInfo] = useState<any>();
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    Math.max(duration - (startTime || 0), 0),
  );

  const formatTime = (seconds: number) => {
    const safe = Math.max(seconds, 0);
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddScoure = async (payload: {
    userId: number | null;
    movieId: number | null;
  }) => {
    socketClient.emit("get_winner", payload);
    const res = await addScoure(payload);
    console.log(res);
  };

  const handleGetWinner = () => {
    if (video?.likeInserted > video?.likeMatched) {
      const payload = {
        userId: video?.userInserted?.id ?? null,
        movieId: video?.attachmentInserted?.attachmentId ?? null,
      };
      setWinnerInfo(payload);
      handleAddScoure(payload);
    } else if (video?.likeInserted < video?.likeMatched) {
      const payload = {
        userId: video?.userMatched?.id ?? null,
        movieId: video?.attachmentMatched?.attachmentId ?? null,
      };
      setWinnerInfo(payload);
      handleAddScoure(payload);
    }
  };

  useEffect(() => {
    if (
      !active ||
      startTime === null ||
      startTime === undefined ||
      startTime === -1
    ) {
      return;
    }

    const initialRemaining = Math.max(duration - startTime, 0);
    setRemainingSeconds(initialRemaining);

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;

        if (next <= 0) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, startTime, duration, onComplete]);

  useEffect(() => {
    if (startTime === -1) {
      handleGetWinner();
    }

    return () => {
      socketClient.off("add_invite_offline_response");
    };
  }, [startTime]);

  const progressPercent = Math.max(
    0,
    Math.min((remainingSeconds / duration) * 100, 100),
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.left}>
        {/* <Icon name="hour-glass-top" size={16} color="#ffffff" /> */}
        <Text style={styles.timeText}>{formatTime(remainingSeconds)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

export default TimerTornoment;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: 4,
  },
  timeText: {
    backgroundColor: "#ffffff1a",
    padding: 2,
    borderRadius: 5,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#7e7e7ea1",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#ffffff",
    borderRadius: 999,
  },
});
