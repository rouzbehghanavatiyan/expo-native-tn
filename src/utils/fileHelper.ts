import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const getImageUrl = (attachment: any) => {
  if (!attachment) return null;
  const res = `${BASE_URL}/${attachment.attachmentType}/${attachment.fileName}${attachment.ext}`;
  return res;
};

export const fixNumberCount = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "0";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return "0";
  return numberValue.toLocaleString("en-US");
};

export const mergeUniqueMessages = (items: any[]) => {
  const map = new Map<string, any>();

  for (const item of items) {
    const key =
      item.id != null
        ? `id-${item.id}`
        : item.tempId
          ? `temp-${item.tempId}`
          : "";
    if (!key) continue;
    map.set(key, item);
  }

  return Array.from(map.values());
};

export const handlePickMedia = async () => {
  const router = useRouter();
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];

      router.push({
        pathname: "/(tabs)/clashTalent",
        params: {
          mediaUri: selectedAsset.uri,
          mediaType:
            selectedAsset.type ??
            (selectedAsset.uri.endsWith(".mp4") ? "video" : "image"),
          duration: selectedAsset.duration ?? 0,
        },
      });
    }
  } catch (error) {
    console.error("Error picking media: ", error);
  }
};
