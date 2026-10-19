import {
  addFollower,
  removeFollower,
  reportVideo,
  userBlock,
} from "@/src/services/masterServices";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import { getImageUrl } from "../utils/fileHelper";
import { logger } from "../utils/logger";
import BaseButton from "./BaseButtom";
import BaseInput from "./BaseInput";
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
  { id: 1, label: "Spam or Meaningless Content", value: "spam_meaningless" },
  { id: 2, label: "Illegal or Adult (18+) Content", value: "illegal_adult" },
  { id: 3, label: "Cheating or Unfair Play", value: "cheating_unfair_play" },
  { id: 4, label: "Irrelevant to the Request Topic", value: "off_topic" },
  { id: 5, label: "Violation of Clash Talent Rules", value: "rule_violation" },
  { id: 6, label: "Other", value: "other" },
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
  const [description, setDescription] = useState("");
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Report Modal States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [reportSuccessModalOpen, setReportSuccessModalOpen] = useState(false);

  // Block Modal States// Success Report Modal State
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);
  const [reportResult, setReportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
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

  const getMovieId = (): number | null => {

    const id = positionVideo === 0
      ? video?.inviteInserted?.movieId
      : video?.inviteMatched?.movieId;
    const n = Number(id);
    logger.info("movie IDDDDDDDDDDDDDDDDDDDD", video)

    return Number.isFinite(n) && n > 0 ? n : null;
  };

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

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvt, (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


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

  const runAfterMenuClose = (action: () => void) => {
    setMenuOpen(false);
    setTimeout(action, Platform.OS === "ios" ? 350 : 0);
  };

  const handleOpenBlockModal = () => {
    runAfterMenuClose(() => setBlockModalOpen(true));
  };

  const handleOpenReportModal = () => {
    runAfterMenuClose(() => {
      setDescription("");
      setSelectedReason(null);
      setReportResult(null);
      setReportModalOpen(true);
    });
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    setDescription("");
    setReportResult(null);
    setSelectedReason(null);
  };



  const handleSubmitReport = async () => {
    if (!selectedReason || isSubmittingReport) return;

    const movieId = getMovieId();
    logger.info("movieId:", movieId);

    if (!movieId || !userInfo?.id) {
      setReportResult({
        success: false,
        message: "Unable to identify this video. Please try again.",
      });
      return;
    }

    try {
      setIsSubmittingReport(true);

      const postData = {
        targetUserId: userInfo.id,
        movieId,
        reason: selectedReason,
        description: selectedReason === 6 ? description.trim() : null,
      };
      const res = await reportVideo(postData);

      if (res?.data?.status === 0) {
        setReportResult({
          success: true,
          message:
            "Thank you! Your report has been submitted and will be reviewed shortly.",
        });
      } else {
        setReportResult({
          success: false,
          message: res?.data?.message || "Failed to submit the report.",
        });
      }
    } catch (error: any) {
      console.error("Report submission failed:", error);
      setReportResult({
        success: false,
        message:
          error?.response?.data?.message ||
          "Something went wrong. Please check your connection and try again.",
      });
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
                  onRequestClose={handleCloseReportModal}
                >
                  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <ScrollView
                      contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 20,
                        paddingBottom: 10 + keyboardHeight,
                      }}
                      keyboardShouldPersistTaps="handled"
                      keyboardDismissMode="none"
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={styles.modalContainer}>
                        {reportResult ? (
                          <YStack ai="center" gap="$3" py="$2">
                            <View
                              backgroundColor={reportResult.success ? "#ECFDF5" : "#FEF2F2"}
                              p="$3"
                              borderRadius={50}
                            >
                              <MaterialIcons
                                name={reportResult.success ? "check-circle" : "error-outline"}
                                size={48}
                                color={reportResult.success ? "#10B981" : "#DC2626"}
                              />
                            </View>

                            <Text fontSize="$4" fontWeight="bold" color="#111">
                              {reportResult.success ? "Report Submitted" : "Report Failed"}
                            </Text>

                            <Text
                              fontSize="$3"
                              color="#6B7280"
                              textAlign="center"
                              lineHeight={22}
                            >
                              {reportResult.message}
                            </Text>

                            <BaseButton
                              colorType="primary"
                              onPress={handleCloseReportModal}
                              borderRadius="$3"
                              w="100%"
                            >
                              <Text color="white" fontWeight="bold">
                                OK
                              </Text>
                            </BaseButton>
                          </YStack>
                        ) : (
                          <>
                            <XStack
                              justifyContent="space-between"
                              alignItems="center"
                              mb="$3"
                            >
                              <Text fontSize="$4" fontWeight="bold" color="#111">
                                Report Content
                              </Text>
                              <Pressable
                                onPress={handleCloseReportModal}
                                disabled={isSubmittingReport}
                              >
                                <MaterialIcons name="close" size={24} color="#666" />
                              </Pressable>
                            </XStack>

                            <Text fontSize="$2" color="#666" mb="$3" textAlign="left">
                              Please select a reason for reporting:
                            </Text>

                            <YStack gap="$2" mb="$3">
                              {REPORT_REASONS.map((reason) => {
                                const isSelected = selectedReason === reason.id;
                                return (
                                  <Pressable
                                    key={reason.id}
                                    disabled={isSubmittingReport}
                                    onPress={() => setSelectedReason(reason.id)}
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
                            {selectedReason === 6 && (
                              <View mb="$3">
                                <BaseInput
                                  placeholder="Please describe the issue..."
                                  placeholderTextColor="#9CA3AF"
                                  multiline
                                  numberOfLines={3}
                                  maxLength={300}
                                  value={description}
                                  onChangeText={setDescription}
                                />
                              </View>
                            )}
                            <BaseButton
                              colorType="primary"
                              disabled={
                                !selectedReason ||
                                (selectedReason === 6 && !description.trim()) ||
                                isSubmittingReport
                              }
                              onPress={handleSubmitReport}
                              borderRadius="$3"
                            >
                              {isSubmittingReport ? (
                                <ActivityIndicator color="white" />
                              ) : (
                                <Text color="white" fontWeight="bold">
                                  Submit
                                </Text>
                              )}
                            </BaseButton>
                          </>
                        )}
                      </View>
                    </ScrollView>
                  </View>
                </Modal>

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

                <Modal
                  visible={reportSuccessModalOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setReportSuccessModalOpen(false)}
                >
                  <View style={styles.modalBackdrop}>
                    <View
                      style={[
                        styles.modalContainer,
                        { alignItems: "center", padding: "$4" },
                      ]}
                    >
                      <View
                        backgroundColor="#ECFDF5"
                        p="$3"
                        borderRadius={50}
                        mb="$3"
                      >
                        <MaterialIcons
                          name="check-circle"
                          size={48}
                          color="#10B981"
                        />
                      </View>

                      <Text
                        fontSize="$4"
                        fontWeight="bold"
                        color="#111"
                        mb="$2"
                      >
                        Report Submitted
                      </Text>

                      <Text
                        fontSize="$3"
                        color="#6B7280"
                        textAlign="center"
                        mb="$4"
                        lineHeight={22}
                      >
                        Thank you! Your report has been submitted and will be
                        reviewed shortly!
                      </Text>

                      <BaseButton
                        colorType="primary"
                        onPress={() => setReportSuccessModalOpen(false)}
                        borderRadius="$3"
                        w="100%"
                      >
                        <Text color="white" fontWeight="bold">
                          OK
                        </Text>
                      </BaseButton>
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
