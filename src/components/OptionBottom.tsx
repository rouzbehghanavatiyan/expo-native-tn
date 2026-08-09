import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { Text, View, XStack } from "tamagui";
import { addLike, removeLike } from "../services/masterServices";
import { useAppDispatch } from "../store/reduxHookType";
import { fixNumberCount } from "../utils/fileHelper";
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
  itsMatchingWithTimer: any;
  showCountLiked: any;
  inviteWatch: boolean;
  profileWatch: boolean;
  videoLikes: any;
}

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
}) => {
  const dispatch = useAppDispatch();
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  // console.log(
  //   "Top Video:",
  //   video?.inviteInserted?.id,
  //   "Botton Video:",
  //   video?.inviteMatched?.id,
  // );
  // console.log(
  //   "itsMatchingWithTimer:",
  //   itsMatchingWithTimer,
  //   "inviteWatch:",
  //   inviteWatch,
  //   "endTime:",
  //   endTime,
  //   "showLiked:",
  //   showLiked,
  //   "profileWatch",
  //   profileWatch,
  //   "inviteWatch",
  //   inviteWatch,
  // );

  const movieId = useMemo(() => {
    if (!video) return null;
    return positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;
  }, [video, positionVideo]);

  useEffect(() => {
    let baseCount = 0;

    if (countLiked !== undefined) {
      baseCount = countLiked;
    } else if (video && movieId) {
      if (video?.likes?.[movieId]) {
        const likeInfo = video.likes[movieId];
        baseCount = likeInfo.count || 0;
      } else {
        baseCount =
          positionVideo === 0
            ? video?.likeInserted || 0
            : video?.likeMatched || 0;
      }
    }

    const socketDelta =
      videoLikes && movieId && videoLikes[movieId] ? videoLikes[movieId] : 0;

    setLocalLikeCount(baseCount + socketDelta);
  }, [countLiked, video, positionVideo, movieId, videoLikes]);

  useEffect(() => {
    if (!movieId || !video) return;

    if (video?.likes?.[movieId]) {
      setIsLiked(video.likes[movieId].isLiked || false);
    } else {
      const initialLikeStatus =
        positionVideo === 0 ? video?.isLikedInserted : video?.isLikedMatched;
      setIsLiked(initialLikeStatus || false);
    }
  }, [video, positionVideo, movieId]);

  // useEffect(() => {
  //   if (countLiked !== undefined) {
  //     setLocalLikeCount(countLiked);
  //   } else if (video && movieId) {
  //     if (video?.likes?.[movieId]) {
  //       const likeInfo = video.likes[movieId];
  //       setLocalLikeCount(likeInfo.count || 0);
  //     } else {
  //       const baseCount =
  //         positionVideo === 0
  //           ? video?.likeInserted || 0
  //           : video?.likeMatched || 0;
  //       setLocalLikeCount(baseCount);
  //     }
  //   }
  // }, [countLiked, video, positionVideo, movieId]);

  useEffect(() => {
    if (externalIsLiked !== undefined) {
      setIsLiked(externalIsLiked);
    }
  }, [externalIsLiked]);

  const handleLikeClick = useCallback(async () => {
    const newLikeStatus = !isLiked;

    setIsLiked(newLikeStatus);

    if (newLikeStatus) {
      setLocalLikeCount((prev) => {
        console.log("like count before +:", prev);
        return prev + 1;
      });
    } else {
      setLocalLikeCount((prev) => {
        console.log("like count before -:", prev);
        return Math.max(0, prev - 1);
      });
    }

    const postData = {
      userId: userIdLogin || null,
      movieId: movieId,
    };

    try {
      if (isLiked) {
        const removeRes = await removeLike(postData);
        if (removeRes?.data?.status !== 0) {
          throw new Error(removeRes?.data?.message || "Remove like failed");
        }
        socketClient?.emit("remove_liked", postData);
      } else {
        const addRes = await addLike(postData);
        if (addRes?.data?.status !== 0) {
          throw new Error(addRes?.data?.message || "Add like failed");
        }
        socketClient?.emit("add_liked", postData);
      }
    } catch (error: any) {
      console.log("error:", error);
      console.log("error message:", error?.message);
      console.log("error status:", error?.response?.status);
      console.log("error data:", error?.response?.data);
      console.log("error headers:", error?.response?.headers);

      Alert.alert("Error", "Failed to update like status");

      setIsLiked(isLiked);

      if (isLiked) {
        setLocalLikeCount((prev) => prev - 1);
      } else {
        setLocalLikeCount((prev) => prev + 1);
      }
    } finally {
      console.log("====== LIKE CLICK END ======");
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

  const resultStyle: any = getResultStyle();

  console.log(
    " result result result result result result result result result",
    result,
  );

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
              <Icon size={20} name="chat-bubble-outline" color="white" />
            </TouchableOpacity>
          </View>
          {result && (
            <View flex={1} alignItems="center">
              <View px={2} py={1} borderRadius="$3">
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
              {(inviteWatch || itsMatchingWithTimer) && (
                <TouchableOpacity
                  onPress={handleLikeClick}
                  style={{ padding: 8, zIndex: 999 }}
                >
                  {isLiked ? (
                    <Icon name="thumb-up" size={20} color="#ffffff" />
                  ) : (
                    <Icon name="thumb-up-off-alt" size={20} color="white" />
                  )}
                </TouchableOpacity>
              )}
              {true && (
                <XStack gap={1} alignItems="center">
                  <Text margin={2} pt={1} color="$grey300" fontSize="$3">
                    {fixNumberCount(localLikeCount)}
                  </Text>
                  <Icon name="thumb-up" color="#b4b4b485" size={15} />
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
