import {
  addFollower,
  removeFollower,
  userBlock,
} from "@/src/services/masterServices";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { getImageUrl } from "../utils/fileHelper";
import { logger } from "../utils/logger";
import BaseButton from "./BaseButtom";
import Follows from "./Follows";
import { Icon } from "./Icon";
import ImageRank from "./ImageRank";

interface OptionTopProps {
  video: any;
  positionVideo: number;
  openDropdowns?: { [key: number]: boolean };
  score: any;
  onBoldPress: any;
  setOpenDropdowns?: any;
  toggleDropdown?: (position: string) => void;
  dropdownItems?: (video: any) => any[];
  userIdLogin: string | null;
  main: any;
}

const REPORT_REASONS = [
  { id: 1, label: "Bad Content", value: "bad_content" },
  { id: 2, label: "Meaningless Content", value: "meaningless_content" },
  { id: 3, label: "Illegal or 18+", value: "illegal_adult" },
  { id: 4, label: "Against starfaceoff Rules", value: "against_rules" },
];

const OptionTop: React.FC<OptionTopProps> = ({
  video,
  positionVideo,
  score,
  userIdLogin,
  main,
  onBoldPress,
}) => {
  const router = useRouter();
  const [localIsFollowed, setLocalIsFollowed] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Report Modal States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Block Modal States
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  const currentUserId = main?.userLogin?.user?.id;

  const profile =
    positionVideo === 0
      ? video?.profileInserted
        ? getImageUrl(video.profileInserted)
        : null
      : video?.profileMatched
        ? getImageUrl(video.profileMatched)
        : null;

  const userInfo =
    positionVideo === 0 ? video?.userInserted : video?.userMatched;
  const checkMyVideo =
    userInfo?.id && currentUserId ? userInfo.id !== currentUserId : false;
  const userScore =
    positionVideo === 0 ? video?.scoreInserted : video?.scoreMatched;

  useEffect(() => {
    const isFollowed =
      positionVideo === 0
        ? video?.isFollowedMeInserted
        : video?.isFollowedMeMatched;
    setLocalIsFollowed(!!isFollowed);
  }, [video, positionVideo]);

  const handleFallowClick = async () => {
    if (isLoadingFollow) return;
    const userIdFollow =
      positionVideo === 0 ? video?.userInserted?.id : video?.userMatched?.id;
    const postData = {
      userId: userIdLogin || null,
      followerId: userIdFollow || null,
    };
    try {
      setIsLoadingFollow(true);
      if (localIsFollowed) {
        await removeFollower(postData);
      } else {
        await addFollower(postData);
      }
      setLocalIsFollowed(!localIsFollowed);
    } catch (error) {
      console.error("Error in follow operation:", error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleSendMessage = () => {
    setMenuOpen(false);
    if (!userInfo?.id) return;
    router.push({
      pathname: `/chat/${userInfo.id}`,
      params: {
        userId: userInfo.id,
        userName: userInfo?.userName || "",
        score: userScore || "",
        profile: profile || "",
      },
    });
  };

  const handleOpenBlockModal = () => {
    setMenuOpen(false);
    setBlockModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    try {
      setIsSubmittingBlock(true);
      const postData = {
        blockerId: userIdLogin,
        targetUserId: userInfo?.id,
      };
      const res = await userBlock(postData);
      logger.info("res", res);
      setBlockModalOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const handleOpenReportModal = () => {
    setMenuOpen(false);
    setSelectedReason(null);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) return;
    try {
      setIsSubmittingReport(true);
      const postData = {
        reporterId: userIdLogin,
        targetUserId: userInfo?.id,
        videoId: video?.id,
        reason: selectedReason,
      };

      // TODO: Call your report API service here
      logger.info("Report Submitted:", postData);

      setReportModalOpen(false);
      setSelectedReason(null);
    } catch (error) {
      console.error("Report submission failed:", error);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getMenuItems = () => [
    { label: "Send Message", icon: "chat", onClick: handleSendMessage },
    { label: "Report", icon: "flag", onClick: handleOpenReportModal },
    { label: "Block", icon: "block", onClick: handleOpenBlockModal },
  ];

  const isTopPosition = positionVideo === 0;

  return (
    <View position="absolute" top={0} left={0} right={0} zIndex={1}>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255, 0)"]}
        style={{ width: "100%" }}
      >
        <XStack
          px="$3"
          py="$2"
          gap="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <View flex={5}>
            <ImageRank
              userInfo={video}
              positionVideo={positionVideo}
              userNameStyle={{ color: "#f3f4f6" }}
              userName={userInfo?.userName || ""}
              imgSize={40}
              imgSrc={profile}
              score={score}
            />
          </View>
          <View flex={2} alignItems="center">
            {checkMyVideo && (
              <Follows
                title={localIsFollowed ? "Unfollow" : "Follow"}
                onFollowClick={handleFallowClick}
              />
            )}
          </View>
          <Pressable
            hitSlop={10}
            style={{ paddingHorizontal: 6, paddingVertical: 4 }}
            onPress={onBoldPress}
          >
            <Icon name="fullscreen" size={26} color="white" />
          </Pressable>
          <View flex={1} alignItems="flex-end">
            {checkMyVideo && (
              <>
                <Pressable
                  hitSlop={10}
                  style={{ padding: 4 }}
                  onPress={() => setMenuOpen(true)}
                >
                  <MaterialIcons name="more-vert" size={22} color="white" />
                </Pressable>

                {/* Dropdown Menu Modal */}
                <Modal
                  visible={menuOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setMenuOpen(false)}
                >
                  <Pressable
                    style={[
                      styles.backdrop,
                      !isTopPosition && styles.backdropCenter,
                    ]}
                    onPress={() => setMenuOpen(false)}
                  >
                    <View
                      style={
                        isTopPosition
                          ? styles.menuContainerTop
                          : styles.menuContainerCenter
                      }
                    >
                      <View
                        backgroundColor="white"
                        borderRadius={10}
                        borderWidth={1}
                        borderColor="#E5E7EB"
                        w={190}
                        p="$2"
                        elevationAndroid={4}
                      >
                        {getMenuItems().map((item, index) => (
                          <View
                            key={index}
                            onPress={item.onClick}
                            p="$2"
                            pressStyle={{
                              backgroundColor: "$backgroundHover",
                            }}
                            borderRadius="$2"
                          >
                            <XStack gap="$3" alignItems="center" w="100%">
                              {item.icon && (
                                <MaterialIcons
                                  name={item.icon as any}
                                  size={18}
                                  color="#303030"
                                />
                              )}
                              <Text fontSize="$3" color="$textPrimary">
                                {item.label}
                              </Text>
                            </XStack>
                          </View>
                        ))}
                      </View>
                    </View>
                  </Pressable>
                </Modal>

                <Modal
                  visible={reportModalOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setReportModalOpen(false)}
                >
                  <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                        mb="$3"
                      >
                        <Text fontSize="$4" fontWeight="bold" color="#111">
                          Report Content
                        </Text>
                        <Pressable onPress={() => setReportModalOpen(false)}>
                          <MaterialIcons name="close" size={24} color="#666" />
                        </Pressable>
                      </XStack>

                      <Text fontSize="$2" color="#666" mb="$3" textAlign="left">
                        Please select a reason for reporting:
                      </Text>

                      <YStack gap="$2" mb="$4">
                        {REPORT_REASONS.map((reason) => {
                          const isSelected = selectedReason === reason.value;
                          return (
                            <Pressable
                              key={reason.id}
                              onPress={() => setSelectedReason(reason.value)}
                              style={[
                                styles.reasonItem,
                                isSelected && styles.reasonItemSelected,
                              ]}
                            >
                              <XStack alignItems="center" gap="$3" width="100%">
                                <MaterialIcons
                                  name={
                                    isSelected
                                      ? "radio-button-checked"
                                      : "radio-button-unchecked"
                                  }
                                  size={20}
                                  color={isSelected ? "#2563EB" : "#9CA3AF"}
                                />
                                <Text
                                  fontSize="$3"
                                  color={isSelected ? "#2563EB" : "#374151"}
                                  fontWeight={isSelected ? "bold" : "normal"}
                                >
                                  {reason.label}
                                </Text>
                              </XStack>
                            </Pressable>
                          );
                        })}
                      </YStack>

                      <BaseButton
                        colorType="primary"
                        disabled={!selectedReason || isSubmittingReport}
                        onPress={handleSubmitReport}
                        borderRadius="$3"
                      >
                        {isSubmittingReport ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text
                            color={selectedReason ? "white" : "#ffffff"}
                            fontWeight="bold"
                          >
                            Submit
                          </Text>
                        )}
                      </BaseButton>
                    </View>
                  </View>
                </Modal>

                {/* Block Confirmation Modal */}
                <Modal
                  visible={blockModalOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setBlockModalOpen(false)}
                >
                  <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                        mb="$2"
                      >
                        <Text fontSize="$4" fontWeight="bold" color="#DC2626">
                          Block User
                        </Text>
                        <Pressable onPress={() => setBlockModalOpen(false)}>
                          <MaterialIcons name="close" size={24} color="#666" />
                        </Pressable>
                      </XStack>

                      <Text
                        fontSize="$3"
                        color="#4B5563"
                        mb="$4"
                        textAlign="left"
                      >
                        Are you sure you want to block{" "}
                        {userInfo?.userName
                          ? `@${userInfo.userName}`
                          : "this user"}
                        ? You will no longer see their content or receive
                        messages from them.
                      </Text>

                      <XStack gap="$3" justifyContent="flex-end">
                        <Pressable
                          onPress={() => setBlockModalOpen(false)}
                          disabled={isSubmittingBlock}
                          style={styles.cancelButton}
                        >
                          <Text color="#4B5563" fontWeight="bold">
                            Cancel
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={handleConfirmBlock}
                          disabled={isSubmittingBlock}
                          style={[
                            styles.blockButton,
                            isSubmittingBlock && { opacity: 0.7 },
                          ]}
                        >
                          {isSubmittingBlock ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Text color="white" fontWeight="bold">
                              Block
                            </Text>
                          )}
                        </Pressable>
                      </XStack>
                    </View>
                  </View>
                </Modal>
              </>
            )}
          </View>
        </XStack>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  backdropCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainerTop: {
    position: "absolute",
    top: 50,
    right: 34,
  },
  menuContainerCenter: {
    position: "absolute",
    top: 410,
    right: 34,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    elevation: 5,
  },
  reasonItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  reasonItemSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  blockButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
});

export default OptionTop;
