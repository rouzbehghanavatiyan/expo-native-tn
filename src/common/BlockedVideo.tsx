import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";
import { Text, YStack } from "tamagui";
import { Icon } from "../components/Icon";
import { userUnBlock } from "../services/masterServices";
import { logger } from "../utils/logger";
// اگر از react-native-toast-message یا sonner استفاده می‌کنید آن را import کنید:
// import Toast from "react-native-toast-message";

interface BlockedVideoProps {
  userName?: any;
  targetUserId?: string;
  userIdLogin?: string | null;
  onUnblockSuccess?: () => void;
}

export const BlockedVideo: React.FC<BlockedVideoProps> = ({
  userName,
  targetUserId,
  userIdLogin,
  onUnblockSuccess,
}) => {
  const [isUnblocking, setIsUnblocking] = useState(false);

  const handleUnblock = async () => {
    if (!userName?.id || !userIdLogin || isUnblocking) return;

    try {
      setIsUnblocking(true);
      const postData = {
        blockerId: userIdLogin,
        targetUserId: userName?.id,
      };

      logger.info("postDatapostDatapostDatapostData", postData);
      const res = await userUnBlock(postData);
      logger.info("userUnBlock userUnBlock", res?.data);

      const isSuccess =
        res?.data?.status === 0 ||
        res?.data === 0 ||
        res?.data?.statusCode === 200;

      if (isSuccess) {

        Alert.alert("Success", "User unblocked successfully");

        if (onUnblockSuccess) {
          try {
            onUnblockSuccess();
          } catch (callbackErr) {
            console.error("Error in onUnblockSuccess callback:", callbackErr);
          }
        }
      } else {
        Alert.alert("Error", res?.data?.message || "Failed to unblock user");
      }
    } catch (error: any) {
      const serverError = error?.response?.data;
      console.error("Error unblocking user:", serverError || error?.message);

      const errorMsg =
        serverError?.message ||
        serverError?.title ||
        "Something went wrong while unblocking.";

      if (
        error?.response?.status === 400 &&
        (typeof errorMsg === "string" &&
          (errorMsg.toLowerCase().includes("not blocked") ||
            errorMsg.toLowerCase().includes("not found")))
      ) {
        Alert.alert("Notice", "User is already unblocked.");
        onUnblockSuccess?.();
      } else {
        Alert.alert("Error", errorMsg);
      }
    } finally {
      setIsUnblocking(false);
    }
  };

  return (
    <View
      style={styles.overlay}
      onStartShouldSetResponder={() => true}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <YStack alignItems="center" gap="$3">
        <View style={styles.iconCircle}>
          <Icon name="block" size={36} color="#ff4d4f" />
        </View>

        <Text
          color="#ff4d4f"
          fontSize="$5"
          mt="$2"
          fontWeight="700"
          opacity={0.9}
        >
          {userName?.userName
            ? `@${userName?.userName} is blocked`
            : "Blocked User"}
        </Text>

        <Text color="#d1d5db" fontSize="$2" mb="$2">
          Would you like to unblock this user?
        </Text>

        <Pressable
          onPress={handleUnblock}
          disabled={isUnblocking}
          style={({ pressed }) => [
            styles.unblockBtn,
            (isUnblocking || pressed) && { opacity: 0.7 },
          ]}
        >
          {isUnblocking ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text color="#ffffff" fontWeight="600" fontSize="$3">
              Unblock
            </Text>
          )}
        </Pressable>
      </YStack>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    elevation: 999,
    backgroundColor: "rgba(10, 10, 10, 0.85)",
    // @ts-ignore
    backdropFilter: "blur(12px)",
    // @ts-ignore
    WebkitBackdropFilter: "blur(12px)",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 77, 79, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 77, 79, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  unblockBtn: {
    marginTop: 8,
    backgroundColor: "#ff4d4f",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BlockedVideo;
