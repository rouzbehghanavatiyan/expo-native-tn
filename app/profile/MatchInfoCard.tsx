import { Icon } from "@/src/components/Icon";
import { fixNumberCount, getImageUrl } from "@/src/utils/fileHelper";
import React, { memo } from "react";
import { Image, StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export type MatchResult = "Win" | "Loss" | "Draw";

export interface MatchSide {
  userName?: string;
  profile?: any;
  likes: number;
  score: number; // درصد رنکی که بک‌اند به این کاربر داده
  result: MatchResult;
}

interface Props {
  left: MatchSide;
  right: MatchSide;
  isLive: boolean;
}

const RESULT_COLORS: Record<MatchResult, string> = {
  Win: "#1ec75f",
  Loss: "#f12d2d",
  Draw: "#eab308",
};

const SideInfo = memo(
  ({ side, isLive }: { side: MatchSide; isLive: boolean }) => {
    const color = RESULT_COLORS[side.result];
    const uri = side.profile ? getImageUrl(side.profile) : null;
    const initial = (side.userName || "?").charAt(0).toUpperCase();
    const hasReward = !isLive && side.score > 0;

    return (
      <YStack
        shadowColor="#000000"
        shadowOffset={{ width: 0, height: 0 }}
        shadowOpacity={0.4}
        shadowRadius={14}
        elevation={5}
        flex={1}
        ai="center"
        gap={6}
      >
        <YStack>
          {uri ? (
            <Image
              source={{ uri }}
              style={[styles.avatar, { borderColor: color }]}
            />
          ) : (
            <YStack
              style={[styles.avatar, { borderColor: color }]}
              bg="$backgroundHover"
              ai="center"
              jc="center"
            >
              <Text fontWeight="700" color="$color">
                {initial}
              </Text>
            </YStack>
          )}
        </YStack>

        <Text
          fontSize={13}
          fontWeight="600"
          color="$color"
          numberOfLines={1}
          maxWidth={110}
        >
          {side.userName || "—"}
        </Text>

        {!isLive && (
          <XStack
            px={10}
            py={2}
            borderRadius={20}
            style={{ backgroundColor: color + "22" }}
          >
            <Text fontSize={11} fontWeight="700" style={{ color }}>
              {side.result}
            </Text>
          </XStack>
        )}

        <XStack ai="center" gap={4}>
          <Icon name="thumb-up" size={13} color="#9CA3AF" />
          <Text fontSize={12} color="$colorMuted">
            {fixNumberCount(side.likes)}
          </Text>
        </XStack>

        {/* {hasReward && (
          <XStack
            ai="center"
            gap={4}
            px={8}
            py={3}
            borderRadius={12}
            style={{ backgroundColor: "#1ec75f22" }}
          >
            <Ionicons name="trending-up" size={13} color="#1ec75f" />
            <Text fontSize={11} fontWeight="700" style={{ color: "#1ec75f" }}>
              +{side.score}% Rank
            </Text>
          </XStack>
        )} */}
      </YStack>
    );
  },
);

SideInfo.displayName = "SideInfo";

const MatchInfoCard = ({ left, right, isLive }: Props) => {
  return (
    <YStack
      bg="$backgroundPaper"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={16}
      mx={10}
      my={10}
      px={10}
      py={14}
    >
      <XStack ai="flex-start">
        <SideInfo side={left} isLive={isLive} />

        <YStack ai="center" jc="center" px={8} pt={10} gap={6}>
          <XStack
            ai="center"
            gap={4}
            px={8}
            py={2}
            borderRadius={10}
            style={{ backgroundColor: isLive ? "#f12d2d22" : "#81818122" }}
          >
            <YStack
              width={6}
              height={6}
              borderRadius={3}
              style={{ backgroundColor: isLive ? "#f12d2d" : "#9CA3AF" }}
            />
            <Text fontSize={10} fontWeight="700" color="$colorMuted">
              {isLive ? "LIVE" : "FINISHED"}
            </Text>
          </XStack>
        </YStack>

        <SideInfo side={right} isLive={isLive} />
      </XStack>
    </YStack>
  );
};

MatchInfoCard.displayName = "MatchInfoCard";

export default memo(MatchInfoCard);

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  crown: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#eab308",
    alignItems: "center",
    justifyContent: "center",
  },
});
