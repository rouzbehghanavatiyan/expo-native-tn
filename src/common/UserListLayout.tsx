import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import Follows from "@/src/components/ui/Follows";
import { getImageUrl } from "@/src/utils/fileHelper";
import { useRouter } from "expo-router";
import React, { useCallback, useRef } from "react";
import { FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, View, XStack, YStack } from "tamagui";
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
  onUnblock?: (id: any) => void;
  unblockText?: string;
  imgSize?: number;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyExtractor?: (item: any, index: number) => string;
}

const getUserId = (user: any) =>
  user?.attachment?.attachmentId ||
  user?.followerId ||
  user?.userId ||
  user?.id ||
  user?.sender;

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
  onEndReached,
  isLoadingMore = false,
  refreshing = false,
  onRefresh,
  keyExtractor,
}) => {
  const { isDark } = useAppTheme();
  const router = useRouter();
  const hasScrolledRef = useRef(false);

  const handleEndReached = useCallback(() => {
    if (!hasScrolledRef.current) return;
    hasScrolledRef.current = false;
    onEndReached?.();
  }, [onEndReached]);

  const handleUserClick = (user: any) => {
    if (onItemPress) {
      onItemPress(user);
      return;
    }

    const targetUserId =
      user?.attachment?.attachmentId ||
      user?.followerId ||
      user?.userId ||
      user?.id;

    const targetData = {
      profile: user?.profile ?? user?.attachment,
      user: user?.user ?? {
        id: targetUserId,
        userName: user?.userName || user?.userNameSender,
      },
      score: user?.score ?? 0,
      mail: user?.mail ?? user?.user?.mail ?? "",
      location: user?.location ?? user?.user?.location ?? "",
      bio: user?.bio ?? user?.user?.bio ?? "",
      isFollowedByMe: isFollowed ? isFollowed(targetUserId) : true,
    };

    router.push({
      pathname: "/profile",
      params: {
        userData: JSON.stringify(targetData),
      },
    });
  };

  const defaultKeyExtractor = useCallback(
    (user: any, index: number) => String(user?.id || getUserId(user) || index),
    [],
  );

  const renderItem = useCallback(
    ({ item: user }: { item: any }) => {
      const userId = getUserId(user);
      const image = getImageUrl(user?.attachment || user);
      const userName = user?.userName || user?.userNameSender || "Unknown User";
      const followed = isFollowed ? isFollowed(userId) : false;

      return (
        <XStack
          px="$4"
          py="$3"
          borderBottomWidth={1}
          borderColor={isDark ? "$grey800" : "$grey100"}
          ai="center"
          jc="space-between"
          bg="$backgroundPaper"
          width="100%"
        >
          <Pressable
            style={{ flex: 1, justifyContent: "center" }}
            onPress={() => handleUserClick(user)}
          >
            <View pointerEvents="none">
              <ImageRank
                score={user?.score ?? 0}
                userNameStyle={{
                  color: isDark ? "#fff" : "rgb(71, 71, 71)",
                }}
                imgSize={imgSize}
                userName={userName}
                imgSrc={image}
              />
            </View>
          </Pressable>

          <XStack ai="center" gap="$2" pl="$2" zIndex={10}>
            {isFollowed && toggleFollow && (
              <Follows
                title={followed ? "Unfollow" : "Follow"}
                onFollowClick={() => toggleFollow(userId)}
              />
            )}
            {onUnblock && (
              <Follows
                title={unblockText}
                onFollowClick={() => onUnblock(userId)}
              />
            )}
            {renderRight && renderRight(user)}
          </XStack>
        </XStack>
      );
    },
    [
      isDark,
      imgSize,
      isFollowed,
      toggleFollow,
      onUnblock,
      unblockText,
      renderRight,
      onItemPress,
    ],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff" }}
    >
      <View f={1} bg="$backgroundPaper">
        {title && <MainTitle handleBack={onBack || (() => { })} title={title} />}

        {isLoading ? (
          <YStack f={1} ai="center" jc="center">
            <Spinner size="large" color="$indigoMain" />
          </YStack>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor ?? defaultKeyExtractor}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.1}
            onScrollBeginDrag={() => {
              hasScrolledRef.current = true;
            }}
            onMomentumScrollBegin={() => {
              hasScrolledRef.current = true;
            }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={
              data.length === 0 ? { flexGrow: 1 } : { paddingBottom: 15 }
            }
            ListEmptyComponent={
              <YStack f={1} ai="center" jc="center" p="$4">
                <Text color="$textSecondary" fontSize="$5">
                  {emptyMessage}
                </Text>
              </YStack>
            }
            ListFooterComponent={
              <YStack height={50} ai="center" jc="center">
                {isLoadingMore ? (
                  <Spinner size="small" color="$indigoMain" />
                ) : null}
              </YStack>
            }
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserListLayout;
