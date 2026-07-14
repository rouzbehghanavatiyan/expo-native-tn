import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { forwardRef, useCallback } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { addAttachment, profileAttachment } from "../services/masterServices";
import { RsetUserLogin } from "../slices/main";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
import ImageRank from "./ImageRank";

interface ProfileHeaderProps {
  userImage?: string;
  userName?: string;
  followersCount?: number;
  followingCount?: number;
  score?: number;
  setProfileImage?: (image: string) => void;
}

const ProfileHeader = forwardRef(
  (
    {
      userImage,
      userName,
      score,
      followersCount,
      followingCount,
      setProfileImage,
    }: ProfileHeaderProps,
    ref: React.ForwardedRef<any>,
  ) => {
    const dispatch = useAppDispatch();
    const main = useAppSelector((state) => state?.main);
    const userId = main?.userLogin?.user?.id;
    const router = useRouter();

    const handleImageProfileUpload = useCallback(async () => {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert("You've refused to allow this app to access your photos!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const imageUri = result.assets[0].uri;

      setProfileImage?.(imageUri);

      try {
        const fileToUpload = {
          uri: imageUri,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any;

        const formData = new FormData();
        formData.append("formFile", fileToUpload);
        formData.append("attachmentId", String(userId));
        formData.append("attachmentType", "pf");
        formData.append("attachmentName", "profile");

        const resAttachment = await addAttachment(formData);
        const { status: attachmentStatus } = resAttachment?.data || {};

        if (attachmentStatus === 0) {
          const resProfileAttachment = await profileAttachment(userId);
          const { status, data } = resProfileAttachment?.data || {};

          if (status === 0) {
            dispatch(RsetUserLogin(data));
          }
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
      }
    }, [userId, dispatch, setProfileImage]);

    return (
      <View px="$2" ref={ref} position="relative" w="100%">
        <XStack h={128}>
          <View onPress={handleImageProfileUpload} cursor="pointer">
            <ImageRank
              iconClass="text-gray-200"
              score={score}
              imgSrc={userImage}
              imgSize={100}
            />
          </View>

          <YStack ml="$2" gap="$2" justifyContent="center">
            <Text fontSize="$6" fontWeight="bold" color="$textPrimary">
              {userName}
            </Text>

            <XStack gap="$4">
              <View
                onPress={() => router.push("/(social)/followers")}
                alignItems="center"
                px="$2"
                py="$1"
                cursor="pointer"
              >
                <Text fontWeight="bold" color="$textPrimary" fontSize="$3">
                  {followersCount || 0}
                </Text>
                <Text fontWeight="bold" color="$textSecondary" fontSize="$3">
                  Followers
                </Text>
              </View>

              <View
                onPress={() => router.push("/(social)/following")}
                alignItems="center"
                px="$2"
                py="$1"
                cursor="pointer"
              >
                <Text fontWeight="bold" color="$textPrimary" fontSize="$3">
                  {followingCount || 0}
                </Text>
                <Text fontWeight="bold" color="$textSecondary" fontSize="$3">
                  Following
                </Text>
              </View>
            </XStack>
          </YStack>
        </XStack>
      </View>
    );
  },
);

ProfileHeader.displayName = "ProfileHeader";

export default ProfileHeader;
