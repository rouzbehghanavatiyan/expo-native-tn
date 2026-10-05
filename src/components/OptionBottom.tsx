import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { Text, View, XStack } from "tamagui";

import { useAppTheme } from "../hook/ThemeContext";
import { addLike, removeLike } from "../services/masterServices";
import { fixNumberCount } from "../utils/fileHelper";
import { socketClient } from "../utils/socketClient";
import { Icon } from "./Icon";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type MatchResult = "Win" | "Loss" | "Draw" | null;

interface LikeInfo {
  count?: number;
  isLiked?: boolean;
}

interface VideoLikes {
  [movieId: string]: number;
}

interface OptionBottomProps {
  handleToggleComments: () => void;
  video: any;

  endTime?: boolean;
  result?: MatchResult;

  showLiked?: boolean;

  positionVideo: number;
  userIdLogin: string | null;

  countLiked?: number;
  externalIsLiked?: boolean;

  itsMatchingWithTimer: any;
  showCountLiked: any;

  inviteWatch: boolean;
  profileWatch: boolean;
  itsHome: any;

  videoLikes: VideoLikes;
}

/* -------------------------------------------------------------------------- */
/*                               Result Config                                */
/* -------------------------------------------------------------------------- */

const RESULT_STYLES: Record<
  Exclude<MatchResult, null>,
  {
    color: string;
    text: string;
  }
> = {
  Win: {
    color: "#1ec75f",
    text: "Win",
  },
  Loss: {
    color: "#f12d2d",
    text: "Loss",
  },
  Draw: {
    color: "#eab308",
    text: "Draw",
  },
};

/* -------------------------------------------------------------------------- */
/*                               Component                                    */
/* -------------------------------------------------------------------------- */

const OptionBottom: React.FC<OptionBottomProps> = ({
  handleToggleComments,
  video,
  inviteWatch,
  showCountLiked,
  itsMatchingWithTimer,
  endTime,
  result,
  showLiked,
  videoLikes,
  positionVideo,
  profileWatch,
  userIdLogin,
  countLiked,
  externalIsLiked,
  itsHome,
}) => {
  const { isDark } = useAppTheme();

  /* ------------------------------------------------------------------------ */
  /*                                  State                                   */
  /* ------------------------------------------------------------------------ */

  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);

  /* ------------------------------------------------------------------------ */
  /*                              Derived Values                              */
  /* ------------------------------------------------------------------------ */

  const movieId = useMemo(() => {
    if (!video) {
      return null;
    }

    return positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;
  }, [video, positionVideo]);

  const canLike = useMemo(() => {
    return Boolean(endTime && (inviteWatch || profileWatch));
  }, [endTime, inviteWatch, profileWatch]);

  const shouldShowLikeCount = useMemo(() => {
    return Boolean(endTime && (itsHome || profileWatch));
  }, [endTime, itsHome, profileWatch]);

  const shouldShowWaitingLike = useMemo(() => {
    return Boolean(!endTime && (inviteWatch || profileWatch || itsHome));
  }, [endTime, inviteWatch, profileWatch, itsHome]);

  const likeInfo: LikeInfo | undefined = useMemo(() => {
    if (!movieId || !video?.likes) {
      return undefined;
    }

    return video.likes[movieId];
  }, [video, movieId]);

  /* ------------------------------------------------------------------------ */
  /*                              Result Style                                */
  /* ------------------------------------------------------------------------ */

  const resultStyle = useMemo(() => {
    if (!result) {
      return null;
    }

    return RESULT_STYLES[result];
  }, [result]);

  /* ------------------------------------------------------------------------ */
  /*                              Like Count                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let baseCount = 0;

    if (countLiked !== undefined) {
      baseCount = countLiked;
    } else if (video && movieId) {
      if (likeInfo) {
        baseCount = likeInfo.count ?? 0;
      } else {
        baseCount =
          positionVideo === 0
            ? (video?.likeInserted ?? 0)
            : (video?.likeMatched ?? 0);
      }
    }

    const socketDelta =
      movieId && videoLikes?.[movieId] ? videoLikes[movieId] : 0;

    setLocalLikeCount(Math.max(0, baseCount + socketDelta));
  }, [countLiked, video, positionVideo, movieId, videoLikes, likeInfo]);

  /* ------------------------------------------------------------------------ */
  /*                              Like Status                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!movieId || !video) {
      return;
    }

    if (likeInfo) {
      setIsLiked(Boolean(likeInfo.isLiked));
      return;
    }

    const initialLikeStatus =
      positionVideo === 0 ? video?.isLikedInserted : video?.isLikedMatched;

    setIsLiked(Boolean(initialLikeStatus));
  }, [video, positionVideo, movieId, likeInfo]);

  /* ------------------------------------------------------------------------ */
  /*                         External Like Status                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (externalIsLiked !== undefined) {
      setIsLiked(externalIsLiked);
    }
  }, [externalIsLiked]);

  /* ------------------------------------------------------------------------ */
  /*                              Like Handler                                */
  /* ------------------------------------------------------------------------ */

  const handleLikeClick = useCallback(async () => {
    if (!movieId || !userIdLogin) {
      return;
    }

    const previousLikeStatus = isLiked;
    const newLikeStatus = !previousLikeStatus;

    setIsLiked(newLikeStatus);

    setLocalLikeCount((prev) => {
      return newLikeStatus ? prev + 1 : Math.max(0, prev - 1);
    });

    const postData = {
      userId: userIdLogin,
      movieId,
    };

    try {
      if (previousLikeStatus) {
        const response = await removeLike(postData);

        if (response?.data?.status !== 0) {
          throw new Error(response?.data?.message || "Remove like failed");
        }

        socketClient?.emit("remove_liked", postData);

        return;
      }

      const response = await addLike(postData);

      if (response?.data?.status !== 0) {
        throw new Error(response?.data?.message || "Add like failed");
      }

      socketClient?.emit("add_liked", postData);
    } catch (error: any) {
      console.error(
        "❌ Like update error:",
        error?.response?.data || error?.message || error,
      );

      Alert.alert("Error", "Failed to update like status");

      setIsLiked(previousLikeStatus);

      setLocalLikeCount((prev) => {
        return previousLikeStatus ? prev + 1 : Math.max(0, prev - 1);
      });
    }
  }, [isLiked, movieId, userIdLogin]);

  // رنگ‌های متناسب با تم
  const iconColor = isDark ? "#ffffff" : "#1f2937";
  const disabledIconColor = isDark
    ? "rgba(255, 255, 255, 0.45)"
    : "rgba(31, 41, 55, 0.45)";

  return (
    <View position="absolute" bottom={10} left={0} right={0} zIndex={10}>
      <XStack
        gap={2}
        justifyContent="space-between"
        alignItems="center"
        px={12}
      >
        <View flex={1} alignItems="flex-start">
          <TouchableOpacity onPress={handleToggleComments}>
            <Icon size={20} name="chat-bubble-outline" color={iconColor} />
          </TouchableOpacity>
        </View>

        {shouldShowWaitingLike && (
          <View flex={1} alignItems="center">
            <View px={2} marginTop={50} py={1} borderRadius="$3">
              <Text
                color={resultStyle?.color}
                fontSize="$3"
                padding="$1"
                fontWeight="bold"
              >
                {resultStyle?.text}
              </Text>
            </View>
          </View>
        )}

        <View flex={1} alignItems="flex-end">
          <XStack gap={2} alignItems="center">
            {canLike && (
              <TouchableOpacity
                onPress={handleLikeClick}
                style={{
                  padding: 8,
                  zIndex: 999,
                }}
              >
                <Icon
                  name={isLiked ? "thumb-up" : "thumb-up-off-alt"}
                  size={20}
                  color={iconColor}
                />
              </TouchableOpacity>
            )}

            {shouldShowLikeCount && (
              <XStack gap={1} alignItems="center">
                <Text margin={2} pt={1} color="$textSecondary" fontSize="$3">
                  {fixNumberCount(localLikeCount)}
                </Text>
              </XStack>
            )}

            {shouldShowWaitingLike && (
              <XStack gap={5} alignItems="center">
                <Text marginTop={3} color="$textSecondary" fontSize="$3">
                  {fixNumberCount(localLikeCount)}
                </Text>
                <Icon name="thumb-up" color={disabledIconColor} size={20} />
              </XStack>
            )}
          </XStack>
        </View>
      </XStack>
    </View>
  );
};

export default React.memo(OptionBottom);
