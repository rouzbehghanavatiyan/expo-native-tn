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

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.uri) {
      setVideoError("Video file is not available.");
      return;
    }

    setVideoFile(asset);
    dispatch(prepareVideoFileThunk(asset));

    let thumbnailUri = "";

    if (Platform.OS !== "web") {
      const timeMs = asset.duration ? Math.floor(asset.duration / 2) : 1000;

      const thumbnailResult = await VideoThumbnails.getThumbnailAsync(
        asset.uri,
        { time: timeMs },
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
    console.error("Video picker error:", e);
    setVideoError("Error selecting video.");
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
