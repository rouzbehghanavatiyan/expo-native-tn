// import React, { useState } from "react";
// import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
// import { Text, XStack, YStack } from "tamagui";
// import { sendUserNotif } from "../services/notificationService";
// import { useAppSelector } from "../store/reduxHookType";
// import { logger } from "../utils/logger";
// import { Icon } from "./Icon";
// import ImageRank from "./ImageRank";

// const Notification = () => {
//   const [notifications, setNotifications] = useState([1, 2, 3, 4]);
//   const [expoToken, setExpoToken] = useState<string | null>(null);
//   const main = useAppSelector((state) => state?.main);
//   const userId = main?.userLogin?.user?.id;

//   const handleSendTestNotification = async () => {
//     if (!userId) return;
//     try {
//       await sendUserNotif({
//         userId: userId,
//         message: "Hello! This is a manual test notification.",
//       });
//       logger.info("✅ Test notification trigger sent to server");
//     } catch (error) {
//       logger.error("Error sending test notification", error);
//     }
//   };

//   const handleDelete = (index: number) => {
//     setNotifications((prev) => prev.filter((_, i) => i !== index));
//   };

//   const renderRightActions = () => (
//     <YStack width={80} bg="#ef4444" ai="center" jc="center">
//       <Icon name="delete" color="white" size={24} />
//     </YStack>
//   );

//   return (
//     <YStack f={1} bg="$background">
//       <YStack p="$4" gap="$2" bg="$gray3" onPress={handleSendTestNotification}>
//         <Text textAlign="center" fontWeight="bold">
//           Auto Test Status (Tap to send test)
//         </Text>
//         {expoToken ? (
//           <Text fontSize="$2" color="$green9" textAlign="center">
//             Token Ready: {expoToken.substring(0, 20)}...
//           </Text>
//         ) : (
//           <Text fontSize="$2" color="$red9" textAlign="center">
//             Fetching token...
//           </Text>
//         )}
//       </YStack>
//       <YStack mt="$2">
//         {notifications.map((item, index) => (
//           <ReanimatedSwipeable
//             key={item}
//             renderRightActions={renderRightActions}
//             onSwipeableOpen={() => handleDelete(index)}
//           >
//             <XStack p="$2" b="$1" ai="center" bg="$red">
//               <ImageRank imgSize={60} userName="Jhan so" />
//               <YStack f={1} ai="center">
//                 <Text fontSize="$2" color="$textSecondary">
//                   2 minutes ago
//                 </Text>
//               </YStack>
//               <Text
//                 color="$errorMain"
//                 fontWeight="700"
//                 fontSize="$4"
//                 width={60}
//                 textAlign="center"
//               >
//                 Loss
//               </Text>
//             </XStack>
//           </ReanimatedSwipeable>
//         ))}
//       </YStack>
//     </YStack>
//   );
// };

// export default Notification;

import * as Notifications from "expo-notifications";
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
  const userId = main?.userLogin?.user?.id || main?.userLogin?.userId;

  // ۱. دریافت و نمایش توکن در کامپوننت
  useEffect(() => {
    const fetchToken = async () => {
      const token = await registerForPushNotifications();
      if (token) {
        setExpoToken(token);
      }
    };
    fetchToken();
  }, []);

  // ۲. متد ارسال تست لوکال (سریع‌ترین راه تست ظاهر و عملکرد هندلر نوتیفیکیشن روی گوشی)
  const handleSendLocalTest = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "تست نوتیفیکیشن لوکال 🔔",
        body: "این یک پیام آزمایشی درون‌برنامه‌ای است.",
        data: { type: "test", userId },
      },
      trigger: null, // ارسال آنی
    });
  };

  // ۳. ارسال تست از طریق سرور
  const handleSendServerTest = async () => {
    if (!userId) {
      logger.error("User ID not found!");
      return;
    }
    try {
      await sendUserNotif({
        userId: Number(userId),
        message: "Hello! This is a manual test notification from backend.",
      });
      logger.info("✅ Test notification trigger sent to server");
    } catch (error) {
      logger.error("Error sending test notification", error);
    }
  };

  const handleDelete = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const renderRightActions = () => (
    <YStack width={80} bg="#ef4444" ai="center" jc="center">
      <Icon name="delete" color="white" size={24} />
    </YStack>
  );

  return (
    <YStack f={1} bg="$background">
      {/* دکمه تست سروری */}
      <YStack
        p="$4"
        gap="$2"
        bg="$gray3"
        onPress={handleSendServerTest}
        pressStyle={{ opacity: 0.8 }}
      >
        <Text textAlign="center" fontWeight="bold">
          ارسال تست از سرور (Tap to send server test)
        </Text>
        {expoToken ? (
          <Text fontSize="$2" color="$green9" textAlign="center">
            Token Ready: {expoToken.substring(0, 20)}...
          </Text>
        ) : (
          <Text fontSize="$2" color="$red9" textAlign="center">
            Fetching token...
          </Text>
        )}
      </YStack>

      {/* دکمه تست لوکال فوری جهت اطمینان از تنظیمات دستگاه */}
      <YStack
        p="$2"
        mt="$2"
        bg="$blue4"
        onPress={handleSendLocalTest}
        pressStyle={{ opacity: 0.8 }}
      >
        <Text textAlign="center" color="white" fontWeight="600">
          تست آنی نوتیفیکیشن لوکال (بدون نیاز به سرور)
        </Text>
      </YStack>

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
