import { addFollower, removeFollower } from "@/src/services/masterServices";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { Text, View, XStack } from "tamagui";
import { getImageUrl } from "../utils/fileHelper";
import Follows from "./Follows";
import ImageRank from "./ImageRank";

interface OptionTopProps {
  video: any;
  positionVideo: number;
  openDropdowns: { [key: number]: boolean };
  score: any;
  setOpenDropdowns: any;
  toggleDropdown: (position: string) => void;
  dropdownItems: (video: any) => any[];
  userIdLogin: string | null;
  main: any;
}

const OptionTop: React.FC<OptionTopProps> = ({
  video,
  positionVideo,
  score,
  dropdownItems,
  userIdLogin,
  main,
}) => {
  const router = useRouter();
  const [localIsFollowed, setLocalIsFollowed] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleReport = () => {
    setMenuOpen(false);
    console.log("Report user:", userInfo?.id);
  };

  const getMenuItems = () => {
    const customItems = [
      { label: "Send Message", icon: "chat", onClick: handleSendMessage },
      { label: "Report", icon: "flag", onClick: handleReport },
      { label: "Save", icon: "grade", onClick: handleReport },
      // { label: "duel", icon: "handshake", onClick: handleReport },
    ];
    return { items: customItems };
  };

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
              imgSize={55}
              imgSrc={profile}
              score={score}
            />
          </View>
          <View flex={2} alignItems="center">
            {checkMyVideo && (
              <Follows
                title={localIsFollowed ? "Unfollow" : "Follow"}
                onFollowClick={handleFallowClick}
                bgColor="white"
              />
            )}
          </View>
          <View flex={1} alignItems="flex-end">
            {checkMyVideo && (
              <>
                <Pressable
                  hitSlop={10}
                  style={{ padding: 4 }}
                  onPress={() => setMenuOpen(true)}
                >
                  <MaterialIcons name="more-vert" size={28} color="white" />
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
                      // اگر 0 نیست، استایل وسط را اضافه کن
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
                        {getMenuItems().items.map(
                          (
                            item: any,
                            index: number, // اصلاح باگ .items.map
                          ) => (
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
                                    name={item.icon}
                                    size={20}
                                    color="#4b5563"
                                  />
                                )}
                                <Text fontSize="$4" color="$textPrimary">
                                  {item.label}
                                </Text>
                              </XStack>
                            </View>
                          ),
                        )}
                      </View>
                    </View>
                  </Pressable>
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
});

export default OptionTop;
