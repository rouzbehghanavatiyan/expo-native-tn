import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../hook/ThemeContext";
import { useCountdown } from "../hook/useCountdown";
import { MATCH_DURATION } from "../utils/matchTimer";

interface Props {
  endAt: number | null;
  duration?: number;
  active: boolean;
  onComplete?: () => void;
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const TimerTornoment: React.FC<Props> = ({
  endAt,
  duration = MATCH_DURATION,
  active,
  onComplete,
}) => {
  const { isDark } = useAppTheme();
  const remaining = useCountdown(endAt, active, onComplete);
  const percent = Math.min((remaining / duration) * 100, 100);

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.timeText,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.06)",
            color: isDark ? "#fff" : "#1f2937",
          },
        ]}
      >
        {fmt(remaining)}
      </Text>
      <View
        style={[
          styles.track,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.12)",
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percent}%`,
              backgroundColor: isDark ? "#fff" : "#1f2937",
            },
          ]}
        />
      </View>
    </View>
  );
};

export default memo(
  TimerTornoment,
  (a, b) => a.endAt === b.endAt && a.active === b.active,
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  timeText: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "700",
  },
  track: { flex: 1, height: 4, borderRadius: 999, overflow: "hidden" },
  fill: { height: 4, borderRadius: 999 },
});
