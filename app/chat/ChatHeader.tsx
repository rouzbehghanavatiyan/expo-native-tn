import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { View, XStack } from "tamagui";

import ImageRank from "@/src/components/ImageRank";

interface ChatHeaderProps {
  score: number;
  userName: string;
  userProfile: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName,
  userProfile,
  score,
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <XStack
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      bg="white"
      py="$2"
      px="$3"
      elevationAndroid={1}
    >
      <View flex={1} justifyContent="center">
        <Pressable onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={26} color="#4B5563" />
        </Pressable>
      </View>

      <View flex={7}>
        <ImageRank
          userName={userName || "Unknown User"}
          imgSrc={userProfile}
          imgSize={60}
          score={score}
          userNameStyle={{ color: "#1F2937" }}
        />
      </View>
      {/* <View flex={2} alignItems="flex-end">
        <Image
          source={Cup}
          style={{ width: 40, height: 40, resizeMode: "contain" }}
        />
      </View> */}
    </XStack>
  );
};

export default ChatHeader;
