import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { forwardRef, useCallback } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { addAttachment, profileAttachment } from "../services/masterServices";
import { RsetUserLogin } from "../slices/main";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
import { getImageUrl } from "../utils/fileHelper";
import ImageRank from "./ImageRank";
import Follows from "./ui/Follows";

interface ProfileHeaderProps {
  userImage?: string;
  userName?: string;
  followersCount?: number;
  followingCount?: number;
  score?: number;
  isMyProfile: boolean;
  setProfileImage?: (image: string) => void;
  currentProfile?: any;
  onFollowToggle?: () => void;
  isFollowLoading?: boolean;
}

const ProfileHeader = forwardRef(
  (
    {
      currentProfile,
      isMyProfile,
      userImage,
      userName,
      score,
      followersCount,
      followingCount,
      setProfileImage,

      onFollowToggle,
      isFollowLoading = false,
    }: ProfileHeaderProps,
    ref: React.ForwardedRef<any>,
  ) => {
    const dispatch = useAppDispatch();
    const main = useAppSelector((state) => state?.main);
    const userId = main?.userLogin?.user?.id;
    const router = useRouter();

    const handleImageProfileUpload = useCallback(async () => {
      if (!isMyProfile) return;

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
          name: "profile.png",
          type: "image/png",
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
    }, [userId, dispatch, setProfileImage, isMyProfile]);

    const handleFallowClick = async () => {
      // const userIdFollow =
      //   positionVideo === 0 ? video?.userInserted?.id : video?.userMatched?.id;
      // const postData = {
      //   userId: userIdLogin || null,
      //   followerId: userIdFollow || null,
      // };
      // try {
      //   setIsLoadingFollow(true);
      //   if (localIsFollowed) {
      //     await removeFollower(postData);
      //   } else {
      //     await addFollower(postData);
      //   }
      //   setLocalIsFollowed(!localIsFollowed);
      // } catch (error) {
      //   console.error("Error in follow operation:", error);
      // } finally {
      //   setIsLoadingFollow(false);
      // }
    };

    const handleSendMessage = () => {
      const targetUserId = currentProfile?.user?.id || currentProfile?.id;

      if (!targetUserId) {
        console.warn("User ID not found for chat navigation");
        return;
      }

      router.push({
        pathname: "/chat/[id]",
        params: {
          id: targetUserId,
          userName:
            currentProfile?.user?.userName ?? currentProfile?.userName ?? "",
          profile: getImageUrl(currentProfile?.profile) ?? "",
          score: String(currentProfile?.score ?? 0),
        },
      });
    };

    return (
      <View px="$2" ref={ref} position="relative" w="100%">
        <XStack h={128} alignItems="center">
          <View
            onPress={isMyProfile ? handleImageProfileUpload : undefined}
            cursor={isMyProfile ? "pointer" : "default"}
            pressStyle={isMyProfile ? { opacity: 0.8 } : undefined}
            pointerEvents={isMyProfile ? "box-only" : "none"}
            zIndex={100}
          >
            <YStack
              border=".5px solid"
              borderColor={"$grey300"}
              borderRadius={"$round"}
              ml="$2"
              justifyContent="center"
            >
              <ImageRank
                iconClass="text-gray-200"
                score={score}
                imgSrc={userImage}
                imgSize={100}
              />
            </YStack>
          </View>

          <YStack ml="$3" gap="$2" justifyContent="center" flex={1}>
            <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
              {userName}
            </Text>

            {isMyProfile ? (
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
            ) : (
              <XStack
                width="100%"
                justifyContent="center"
                alignItems="center"
                mt="$1"
              >
                <View
                  onPress={onFollowToggle}
                  cursor="pointer"
                  borderRadius="$4"
                  minWidth={100}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Follows
                    onFollowClick={handleFallowClick}
                    title={
                      currentProfile?.isFollowedByMe ? "Unfollow" : "Follow"
                    }
                  />
                </View>
                <View
                  onPress={() => handleSendMessage(currentProfile)}
                  cursor="pointer"
                  borderRadius="$4"
                  minWidth={100}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    bg="$backgroundPaper"
                    color="$textPrimary"
                    px={10}
                    py={6}
                    borderRadius={5}
                    fontSize={11}
                    shadowColor="#000000"
                    shadowOpacity={0.2}
                    shadowRadius={10}
                    elevation={1}
                  >
                    Send message
                  </Text>
                </View>
              </XStack>
            )}
          </YStack>
        </XStack>
      </View>
    );
  },
);

ProfileHeader.displayName = "ProfileHeader";

export default React.memo(ProfileHeader);
