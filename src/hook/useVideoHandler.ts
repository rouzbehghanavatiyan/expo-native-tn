import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useState } from "react";
import { Platform } from "react-native";

import { prepareVideoFileThunk } from "../slices/video";
import { useAppDispatch } from "../store/reduxHookType";

export const useVideoHandler = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [coverImage, setCoverImage] = useState<string>("");
  const [videoFile, setVideoFile] = useState<any>(null);
  const [showEditMovie, setShowEditMovie] = useState<boolean>(false);
  const [allFormData, setAllFormData] = useState<any>();
  const [videoError, setVideoError] = useState<string | null>(null);

  const triggerVideoUpload = async (modeData?: any) => {
    setVideoError(null);

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setVideoError("Gallery access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      videoMaxDuration: 30,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];

    const maxDurationMs = 30 * 1000;

    if (asset.duration && asset.duration > maxDurationMs) {
      setVideoError("Dear user, your video should not exceed 30 seconds.");
      return;
    }

    setVideoFile(asset);

    dispatch(prepareVideoFileThunk(asset));

    try {
      let thumbnailUri = "";

      if (Platform.OS !== "web") {
        const timeMs = asset.duration ? Math.floor(asset.duration / 2) : 1000;

        const thumbnailResult = await VideoThumbnails.getThumbnailAsync(
          asset.uri,
          {
            time: timeMs,
          },
        );

        thumbnailUri = thumbnailResult.uri;
      } else {
        thumbnailUri = asset.uri;
      }

      setCoverImage(thumbnailUri);

      const formData = {
        imageCover: {
          uri: thumbnailUri,
          name: allFormData?.imageCover?.name || "cover.jpg",
          type: allFormData?.imageCover?.type || "image/jpeg",
        },
        video: {
          uri: asset.uri,
          name: allFormData?.video?.name || "video.mp4",
          type: allFormData?.video?.type || "video/mp4",
        },
      };

      setAllFormData(formData);

      router.push({
        pathname: "/editVideo",
        params: {
          coverImage: thumbnailUri,
          allFormData: JSON.stringify(formData),
          videoSrc: asset.uri,
          ...(modeData ? { mode: JSON.stringify(modeData) } : {}),
        },
      });
    } catch (e) {
      console.error("Thumbnail Error Details:", e);
      setVideoError("Error loading video file...");
    }
  };

  return {
    coverImage,
    videoFile,
    showEditMovie,
    allFormData,
    setShowEditMovie,
    setAllFormData,
    triggerVideoUpload,
    videoError,
  };
};
