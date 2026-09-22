import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import Follows from "@/src/components/ui/Follows";
import { getImageUrl } from "@/src/utils/fileHelper";
import React from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";
import { useAppTheme } from "../hook/ThemeContext";

interface UserListLayoutProps {
  title?: string;
  isLoading: boolean;
  data: any[];
  emptyMessage: string;
  onBack?: () => void;
  onItemPress?: (item: any) => void;
  renderRight?: (item: any) => React.ReactNode;
  isFollowed?: (id: any) => boolean;
  toggleFollow?: (id: any) => void;
  onUnblock?: (id: any) => void; // پراپ آن‌بلاک
  unblockText?: string; // متن دکمه (پیش‌فرض: Unblock)
  imgSize?: number;
}

const UserListLayout: React.FC<UserListLayoutProps> = ({
  title,
  isLoading,
  data,
  emptyMessage,
  onBack,
  onItemPress,
  renderRight,
  isFollowed,
  toggleFollow,
  onUnblock,
  unblockText = "Unblock",
  imgSize = 50,
}) => {
  const { isDark, setThemeMode } = useAppTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff" }}
    >
      <View f={1} bg="$background">
        {title && <MainTitle handleBack={onBack || (() => {})} title={title} />}

        {isLoading && (
          <YStack f={1} ai="center" jc="center">
            <Spinner size="large" color="$orange10" />
          </YStack>
        )}

        {!isLoading && data.length === 0 && (
          <YStack f={1} ai="center" jc="center" p="$4">
            <Text color="$gray11" fontSize="$5">
              {emptyMessage}
            </Text>
          </YStack>
        )}

        {!isLoading && data.length > 0 && (
          <ScrollView>
            {data.map((user: any, index: number) => {
              const userId =
                user?.attachment?.attachmentId ||
                user?.userId ||
                user?.id ||
                user?.sender;
              const image = getImageUrl(user?.attachment || user);
              const userName =
                user?.userName || user?.userNameSender || "Unknown User";
              const followed = isFollowed ? isFollowed(userId) : false;

              return (
                <Pressable
                  key={user?.id || userId || index}
                  onPress={() => onItemPress && onItemPress(user)}
                  disabled={!onItemPress}
                >
                  <XStack
                    p="$4"
                    bc="$grey100"
                    my={1}
                    ai="center"
                    jc="space-between"
                    bg="$white"
                  >
                    <ImageRank
                      score={user?.score ?? 0}
                      userNameStyle={{ color: "rgb(71, 71, 71)" }}
                      imgSize={imgSize}
                      userName={userName}
                      imgSrc={image}
                    />

                    {/* دکمه فالو/آنفالو */}
                    {isFollowed && toggleFollow && (
                      <Follows
                        title={followed ? "Unfollow" : "Follow"}
                        onFollowClick={() => toggleFollow(userId)}
                      />
                    )}

                    {/* دکمه یک‌دست آن‌بلاک */}
                    {onUnblock && (
                      <Follows
                        title={unblockText}
                        onFollowClick={() => onUnblock(userId)}
                      />
                    )}

                    {/* قابلیت رندر کاستوم در صورت نیاز به موارد خاص */}
                    {renderRight && renderRight(user)}
                  </XStack>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserListLayout;
