import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { Text, View, XStack } from "tamagui";
import { addLike, removeLike } from "../services/masterServices";
import { useAppDispatch } from "../store/reduxHookType";
import { socketClient } from "../utils/socketClient";
import { Icon } from "./Icon";

interface OptionBottomProps {
  handleToggleComments: () => void;
  video: any;
  endTime?: boolean;
  result?: "Win" | "Loss" | "Draw" | null;
  showLiked?: boolean;
  positionVideo: number;
  userIdLogin: string | null;
  countLiked?: number;
  externalIsLiked?: boolean;
}

const OptionBottom: React.FC<OptionBottomProps> = ({
  handleToggleComments,
  video,
  endTime,
  result,
  showLiked = true,
  positionVideo,
  userIdLogin,
  countLiked,
  externalIsLiked,
}) => {
  const dispatch = useAppDispatch();
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);

  // محاسبه movieId بر اساس positionVideo
  const movieId = useMemo(() => {
    if (!video) return null;
    return positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;
  }, [video, positionVideo]);

  // محاسبه وضعیت اولیه لایک برای این movieId خاص
  useEffect(() => {
    if (!movieId || !video) return;

    // اگر video.likes داریم و این movieId در آن وجود دارد
    if (video?.likes?.[movieId]) {
      setIsLiked(video.likes[movieId].isLiked || false);
    } else {
      // اگر ساختار قدیمی داریم (isLikedInserted/isLikedMatched)
      const initialLikeStatus =
        positionVideo === 0 ? video?.isLikedInserted : video?.isLikedMatched;
      setIsLiked(initialLikeStatus || false);
    }
  }, [video, positionVideo, movieId]);

  // محاسبه تعداد لایک‌ها
  useEffect(() => {
    if (countLiked !== undefined) {
      setLocalLikeCount(countLiked);
    } else if (video && movieId) {
      // اول از video.likes چک کن
      if (video?.likes?.[movieId]) {
        const likeInfo = video.likes[movieId];
        setLocalLikeCount(likeInfo.count || 0);
      } else {
        // اگر video.likes نبود، از ساختار قدیمی استفاده کن
        const baseCount =
          positionVideo === 0
            ? video?.likeInserted || 0
            : video?.likeMatched || 0;
        setLocalLikeCount(baseCount);
      }
    }
  }, [countLiked, video, positionVideo, movieId]);

  // اگر externalIsLiked تغییر کرد، state را آپدیت کن
  useEffect(() => {
    if (externalIsLiked !== undefined) {
      setIsLiked(externalIsLiked);
    }
  }, [externalIsLiked]);

  const handleLikeClick = useCallback(async () => {
    if (!movieId) return;

    // وضعیت جدید (معکوس وضعیت فعلی)
    const newLikeStatus = !isLiked;

    // فوراً UI را آپدیت کن
    setIsLiked(newLikeStatus);

    // آپدیت موقت تعداد لایک
    if (newLikeStatus) {
      setLocalLikeCount((prev) => prev + 1);
    } else {
      setLocalLikeCount((prev) => Math.max(0, prev - 1));
    }

    const postData = {
      userId: userIdLogin || null,
      movieId: movieId,
    };

    try {
      if (isLiked) {
        // اگر قبلاً لایک کرده، حالا آنلایک می‌کند
        await removeLike(postData);
        if (socketClient) {
          socketClient.emit("remove_liked", postData);
        }
      } else {
        // اگر قبلاً لایک نکرده، حالا لایک می‌کند
        await addLike(postData);
        if (socketClient) {
          socketClient.emit("add_liked", postData);
        }
      }

      // dispatch(
      //   updateLikeStatus({
      //     movieId,
      //     isLiked: newLikeStatus,
      //     positionVideo,
      //   }),
      // );
    } catch (error) {
      console.error("Error in like operation:", error);
      Alert.alert("Error", "Failed to update like status");
      // در صورت خطا، UI را به حالت قبلی برگردان
      setIsLiked(isLiked);
      if (isLiked) {
        setLocalLikeCount((prev) => prev - 1);
      } else {
        setLocalLikeCount((prev) => prev + 1);
      }
    }
  }, [isLiked, movieId, userIdLogin, socketClient, dispatch, positionVideo]);

  const getResultStyle = () => {
    switch (result) {
      case "Win":
        return { color: "#10b981", text: "Win", borderColor: "#10b981" };
      case "Loss":
        return { color: "#ef4444", text: "Loss", borderColor: "#ef4444" };
      case "Draw":
        return { color: "#eab308", text: "Draw", borderColor: "#eab308" };
      default:
        return null;
    }
  };

  const resultStyle = getResultStyle();

  return (
    <View position="absolute" bottom={0} left={0} right={0} zIndex={10}>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.5)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={{ width: "100%" }}
      >
        <XStack
          gap={2}
          justifyContent="space-between"
          alignItems="center"
          px={10}
          pb={8}
        >
          <View flex={1} alignItems="flex-start">
            <TouchableOpacity onPress={handleToggleComments}>
              <Icon name="chat-bubble-outline" color="white" />
            </TouchableOpacity>
          </View>
          {!endTime && resultStyle && (
            <View flex={1} alignItems="center">
              <View
                // borderWidth={1}
                // borderColor={resultStyle.borderColor}
                px={2}
                py={1}
                borderRadius="$3"
              >
                <Text
                  color={resultStyle.color}
                  fontSize="$4"
                  padding="$1"
                  fontWeight="bold"
                >
                  {resultStyle.text}
                </Text>
              </View>
            </View>
          )}
          <View flex={1} alignItems="flex-end">
            <XStack gap={2} alignItems="center">
              {showLiked && movieId && (
                <TouchableOpacity onPress={handleLikeClick}>
                  {isLiked ? (
                    <Icon name="thumb-up" color="#3b82f6" />
                  ) : (
                    <Icon name="thumb-up-off-alt" color="white" />
                  )}
                </TouchableOpacity>
              )}
              {endTime === undefined && (
                <XStack gap={1} alignItems="center">
                  <Text margin={2} pt={1} color="gray" fontSize="$5">
                    {localLikeCount}
                  </Text>
                  <Icon name="thumb-up" color="gray" size={20} />
                </XStack>
              )}
            </XStack>
          </View>
        </XStack>
      </LinearGradient>
    </View>
  );
};

export default OptionBottom;
