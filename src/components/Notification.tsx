import React, { useEffect, useState } from "react";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Text, XStack, YStack } from "tamagui";
import {
  registerForPushNotifications,
  sendUserNotif,
} from "../services/notificationService";
import { useAppSelector } from "../store/reduxHookType";
import { logger } from "../utils/logger";
import { Icon } from "./Icon";
import ImageRank from "./ImageRank";

const Notification = () => {
  const [notifications, setNotifications] = useState([1, 2, 3, 4]);
  const [expoToken, setExpoToken] = useState<string | null>(null);
  const main = useAppSelector((state) => state?.main);

  // اجرای خودکار به محض ورود به صفحه
  useEffect(() => {
    const autoSendTestNotification = async () => {
      // بررسی می‌کنیم که کاربر حتماً در استیت موجود باشد
      const userId = main?.userLogin?.user?.id;
      if (!userId) return;

      try {
        logger.info("Auto-fetching token on mount for user:", userId);

        // ۱. دریافت توکن
        const token = await registerForPushNotifications(userId);

        if (token) {
          setExpoToken(token);
          logger.info("✅ Token received automatically:", token);

          // ۲. ارسال بلافاصله به سرور
          const postData = {
            userId: userId,
            expoPushToken: token,
            message: "Hello! This is an auto-test notification on mount.",
          };

          await sendUserNotif(postData);
          logger.info("✅ Auto-test notification successfully sent to server");
        } else {
          logger.warn("❌ No token received. Cannot send auto-notification.");
        }
      } catch (error: any) {
        if (error.response) {
          logger.error(
            "Server error:",
            error.response.status,
            error.response.data,
          );
        } else {
          logger.error(
            "Error in auto-sending test notification:",
            error.message,
          );
        }
      }
    };

    autoSendTestNotification();
  }, [main?.userLogin?.user?.id]); // با تغییر/لود شدن آیدی کاربر، این کد یک‌بار اجرا می‌شود

  const handleDelete = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const renderRightActions = () => (
    <YStack width={80} bg="#ef4444" ai="center" jc="center">
      {/* اخطار آیکون با تغییر trash به delete برطرف شد */}
      <Icon name="delete" color="white" size={24} />
    </YStack>
  );

  return (
    <YStack f={1} bg="$background">
      {/* بخش نمایش وضعیت توکن (دکمه‌های دستی حذف شدند چون خودکار کار می‌کند) */}
      <YStack p="$4" gap="$2" bg="$gray3">
        <Text textAlign="center" fontWeight="bold">
          Auto Test Status
        </Text>
        {expoToken ? (
          <Text fontSize="$2" color="$green9" textAlign="center">
            Token Ready & Sent: {expoToken.substring(0, 20)}...
          </Text>
        ) : (
          <Text fontSize="$2" color="$red9" textAlign="center">
            Fetching token or waiting for user...
          </Text>
        )}
      </YStack>

      {/* لیست نوتیفیکیشن‌ها */}
      <YStack mt="$2">
        {notifications.map((item, index) => (
          <ReanimatedSwipeable
            key={item}
            renderRightActions={renderRightActions}
            onSwipeableOpen={() => handleDelete(index)}
          >
            <XStack p="$2" b="$1" ai="center" bg="$red">
              <ImageRank imgSize={60} userName="Jhan so" />
              <YStack f={1} ai="center">
                <Text fontSize="$2" color="$textSecondary">
                  2 minutes ago
                </Text>
              </YStack>
              <Text
                color="$errorMain"
                fontWeight="700"
                fontSize="$4"
                width={60}
                textAlign="center"
              >
                Loss
              </Text>
            </XStack>
          </ReanimatedSwipeable>
        ))}
      </YStack>
    </YStack>
  );
};

export default Notification;
