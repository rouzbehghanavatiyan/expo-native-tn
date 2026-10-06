import { Icon } from "@/src/components/Icon";
import ImageRank from "@/src/components/ImageRank";
import { getThemeColor } from "@/src/hook/getThemeColor";
import { addComment, commentList } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  View as RNView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme, View, XStack, YStack } from "tamagui";
const PAGE_SIZE = 10;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.78;
const ACCENT = "#4F46E5";

interface CommentsProps {
  visible: boolean;
  onClose: () => void;
  video: any;
  positionVideo: number;
  userIdLogin: string | null;
  commentUserInfo?: any;
}

interface ReplyTarget {
  id: any;
  userName?: string;
}

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                  */
/* -------------------------------------------------------------------------- */
const CommentsSkeleton = () => {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={{ opacity: pulse, paddingHorizontal: 16, paddingTop: 8 }}
    >
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <XStack key={i} gap={12} py={10} alignItems="flex-start">
          <View width={38} height={38} borderRadius={19} bg="$divider" />
          <YStack flex={1} gap={8}>
            <View height={12} width="30%" borderRadius={6} bg="$divider" />
            <View
              height={12}
              width={i % 2 ? "70%" : "90%"}
              borderRadius={6}
              bg="$divider"
            />
          </YStack>
        </XStack>
      ))}
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */
/*  Single comment row (with collapsible replies)                             */
/* -------------------------------------------------------------------------- */
interface CommentRowProps {
  item: any;
  expanded: boolean;
  onToggle: (id: any) => void;
  onReply: (rootId: any, userName?: string) => void;
}

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

const CommentRow = memo(
  ({ item, expanded, onToggle, onReply }: CommentRowProps) => {
    const replies: any[] = item?.replies ?? [];
    return (
      <XStack gap={10} py={8} alignItems="flex-start">
        <ImageRank
          imgSrc={getImageUrl(item?.profile)}
          imgSize={38}
          score={item?.score}
        />

        <YStack flex={1} gap={6}>
          {/* Bubble */}
          <YStack
            bg="$backgroundPaper"
            borderWidth={1}
            borderColor="$divider"
            borderRadius={16}
            px={12}
            py={8}
            gap={2}
          >
            <Text color="$textPrimary" fontSize={13} fontWeight="700">
              {item?.userName || "Anonymous"}
            </Text>
            <Text color="$textPrimary" fontSize={14} lineHeight={20}>
              {item?.desc}
            </Text>
          </YStack>

          {/* Actions */}
          <XStack px={6} alignItems="center" gap={16}>
            <TouchableOpacity
              onPress={() => onReply(item?.id, item?.userName)}
              hitSlop={HIT_SLOP}
            >
              <Text color="$textSecondary" fontSize={12} fontWeight="700">
                Reply
              </Text>
            </TouchableOpacity>
          </XStack>

          {/* Replies toggle */}
          {replies.length > 0 && (
            <TouchableOpacity
              onPress={() => onToggle(item?.id)}
              hitSlop={HIT_SLOP}
            >
              <XStack alignItems="center" gap={8} px={6}>
                <View width={22} height={1} bg="$divider" />
                <Text color="$textSecondary" fontSize={12} fontWeight="700">
                  {expanded
                    ? "Hide replies"
                    : `View ${replies.length} ${
                        replies.length === 1 ? "reply" : "replies"
                      }`}
                </Text>
              </XStack>
            </TouchableOpacity>
          )}

          {/* Replies */}
          {expanded && replies.length > 0 && (
            <YStack gap={10} mt={4}>
              {replies.map((reply: any) => (
                <XStack key={reply.id} gap={8} alignItems="flex-start">
                  <ImageRank
                    imgSrc={getImageUrl(reply?.profile)}
                    imgSize={28}
                    userName={reply?.userName}
                    score={reply?.score}
                  />
                  <YStack flex={1} gap={4}>
                    <YStack
                      bg="$backgroundPaper"
                      borderWidth={1}
                      borderColor="$divider"
                      borderRadius={14}
                      px={10}
                      py={6}
                      gap={2}
                    >
                      <Text color="$textPrimary" fontSize={12} fontWeight="700">
                        {reply?.userName || "Anonymous"}
                      </Text>
                      <Text color="$textPrimary" fontSize={13} lineHeight={18}>
                        {reply?.desc}
                      </Text>
                    </YStack>
                    <XStack px={6}>
                      <TouchableOpacity
                        onPress={() => onReply(item?.id, reply?.userName)}
                        hitSlop={HIT_SLOP}
                      >
                        <Text
                          color="$textSecondary"
                          fontSize={11.5}
                          fontWeight="700"
                        >
                          Reply
                        </Text>
                      </TouchableOpacity>
                    </XStack>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </XStack>
    );
  },
);
CommentRow.displayName = "CommentRow";

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */
const Comments: React.FC<CommentsProps> = ({
  visible,
  onClose,
  video,
  positionVideo,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const buildRoots = (items: any[]) => {
    const roots = items
      .filter((c) => !c.parentId)
      .map((c) => ({ ...c, replies: [] as any[] }));
    const rootById = new Map(roots.map((r) => [r.id, r]));
    items
      .filter((c) => !!c.parentId)
      .forEach((c) => rootById.get(c.parentId)?.replies.push(c));
    roots.forEach((r) => r.replies.sort((a: any, b: any) => a.id - b.id));
    return roots;
  };
  const colors = {
    background: getThemeColor(theme.background, "#fafafa"),
    textPrimary: getThemeColor(theme.textPrimary, "#212121"),
    textSecondary: getThemeColor(theme.textSecondary, "#757575"),
    divider: getThemeColor(theme.divider, "rgba(0,0,0,0.12)"),
  };

  const [comments, setComments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [answerData, setAnswerData] = useState<ReplyTarget | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1); // تعداد صفحه‌های لودشده
  const loadingMoreRef = useRef(false); // جلوگیری از onEndReached تکراری
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList<any>>(null);

  const userLogin = useAppSelector((state) => state.main?.userLogin);
  const userProfile = getImageUrl(userLogin?.profile);
  const loginUserId = userLogin?.user?.id;

  const movieId =
    positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;

  /* ------------------------------- Animations ------------------------------ */
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      translateY.setValue(SHEET_HEIGHT);
      backdrop.setValue(0);
      return;
    }
    closingRef.current = false;
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 90,
        friction: 14,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, translateY, backdrop]);

  /* --------------------------------- Data --------------------------------- */
  const fetchComments = useCallback(
    async (keepLoadedPages = false) => {
      if (!movieId) return;
      const pages = keepLoadedPages ? pageRef.current : 1;
      setLoading(true);

      try {
        const res = await commentList(movieId, 1, pages * PAGE_SIZE);
        const { data, status } = res?.data || {};
        if (status === 0 && data) {
          setTotalCount(data.totalCount ?? 0);
          setHasMore(!!data.hasMore);
          pageRef.current = pages;
          setComments(buildRoots(data.items ?? []));
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    },
    [movieId],
  );

  const fetchMore = useCallback(async () => {
    if (!movieId || !hasMore || loadingMoreRef.current || loading) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = pageRef.current + 1;
      const res = await commentList(movieId, nextPage, PAGE_SIZE);
      const { data, status } = res?.data || {};

      if (status === 0 && data) {
        const newRoots = buildRoots(data.items ?? []);
        pageRef.current = nextPage;
        setHasMore(!!data.hasMore);
        setTotalCount(data.totalCount ?? 0);
        setComments((prev) => {
          const ids = new Set(prev.map((c) => c.id));
          return [...prev, ...newRoots.filter((r) => !ids.has(r.id))];
        });
      }
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [movieId, hasMore, loading]);

  const resetCommentsState = useCallback(() => {
    setComments([]);
    setText("");
    setAnswerData(null);
    setExpanded({});
    setLoading(false);
    setSending(false);
    setHasMore(false);
    setLoadingMore(false);
    pageRef.current = 1;
    loadingMoreRef.current = false;
  }, []);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetCommentsState();
      onClose();
    });
  }, [translateY, backdrop, resetCommentsState, onClose]);

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    if (visible && movieId) {
      fetchComments();
    }
    if (!visible) {
      setText("");
    }
  }, [visible, movieId, fetchComments]);

  useEffect(() => {
    if (Platform.OS !== "android" || !visible) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });

    return () => sub.remove();
  }, [visible, handleClose]);

  /* ------------------------- Drag-to-dismiss (header) ---------------------- */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_: any, g: any) =>
          Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_: any, g: any) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_: any, g: any) => {
          if (g.dy > 120 || g.vy > 0.9) {
            handleCloseRef.current();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [translateY],
  );

  /* -------------------------------- Handlers ------------------------------- */
  const handleReplyPress = useCallback((rootId: any, userName?: string) => {
    setAnswerData({ id: rootId, userName });
    inputRef.current?.focus();
  }, []);

  const handleToggleReplies = useCallback((id: any) => {
    setExpanded((prev) => ({ ...prev, [String(id)]: !prev[String(id)] }));
  }, []);

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !movieId || sending) return;

    setSending(true);

    try {
      const postData = {
        userId: loginUserId,
        movieId,
        desc: trimmed,
        ParentId: answerData?.id || null,
      };

      const res = await addComment(postData);
      const { status } = res?.data || {};

      if (status === 0) {
        const isReply = !!answerData?.id;
        if (isReply) {
          setExpanded((prev) => ({ ...prev, [String(answerData!.id)]: true }));
        }
        setText("");
        setAnswerData(null);
        await fetchComments(true);
        if (!isReply) scrollToLatest();
      }
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setSending(false);
    }
  }, [
    text,
    movieId,
    sending,
    loginUserId,
    answerData?.id,
    fetchComments,
    scrollToLatest,
  ]);

  if (!visible) return null;

  const canSend = !!text.trim() && !sending;

  /* --------------------------------- Footer -------------------------------- */
  const inputFooter = (
    <YStack bg="$backgroundPaper" borderTopWidth={1} borderTopColor="$divider">
      {/* Replying banner */}
      {answerData && (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          px={16}
          py={8}
          bg="$background"
        >
          <XStack alignItems="center" gap={10} flex={1}>
            <View width={3} height={22} borderRadius={2} bg={ACCENT} />
            <Text
              color="$textSecondary"
              fontSize={12.5}
              numberOfLines={1}
              flex={1}
            >
              Replying to{" "}
              <Text fontWeight="700" color="$textPrimary">
                @{answerData?.userName || "User"}
              </Text>
            </Text>
          </XStack>
          <TouchableOpacity
            onPress={() => setAnswerData(null)}
            hitSlop={HIT_SLOP}
          >
            <Icon name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </XStack>
      )}

      <XStack alignItems="flex-end" py={10} px={12} gap={10}>
        <View mb={2}>
          <ImageRank imgSrc={userProfile} imgSize={36} />
        </View>

        <XStack
          flex={1}
          bg="$background"
          borderRadius={22}
          borderWidth={1}
          borderColor={isFocused ? ACCENT : "$divider"}
          alignItems="flex-end"
          pl={14}
          pr={5}
          py={4}
          gap={6}
        >
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              answerData
                ? `Write a reply to @${answerData?.userName || "comment"}...`
                : "Add a comment..."
            }
            placeholderTextColor={colors.textSecondary}
            multiline
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontSize: 14,
              maxHeight: 100,
              textAlignVertical: "center",
              paddingTop: Platform.OS === "ios" ? 8 : 6,
              paddingBottom: Platform.OS === "ios" ? 8 : 6,
            }}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              marginBottom: 1,
              backgroundColor: canSend ? ACCENT : colors.divider,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon
                name="send"
                size={15}
                color={canSend ? "#fff" : colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </XStack>
      </XStack>
    </YStack>
  );

  /* --------------------------------- Render -------------------------------- */
  return (
    <View
      position="absolute"
      top={0}
      bottom={0}
      left={0}
      right={0}
      zIndex={999}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            opacity: backdrop,
          }}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: SHEET_HEIGHT,
          backgroundColor: colors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: "hidden",
          transform: [{ translateY }],
        }}
      >
        {/* Header (drag area) */}
        <RNView {...panResponder.panHandlers}>
          <YStack
            bg="$backgroundPaper"
            borderBottomWidth={1}
            borderBottomColor="$divider"
            pt={8}
            pb={12}
          >
            <View
              alignSelf="center"
              width={40}
              height={4}
              borderRadius={2}
              bg="$textSecondary"
              opacity={0.35}
              mb={10}
            />

            <XStack px={16} alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap={8}>
                <Text color="$textPrimary" fontSize={17} fontWeight="700">
                  Comments
                </Text>
                {totalCount > 0 && (
                  <View
                    bg="$background"
                    borderRadius={10}
                    borderWidth={1}
                    borderColor="$divider"
                    px={8}
                    py={2}
                  >
                    <Text color="$textSecondary" fontSize={12} fontWeight="700">
                      {totalCount}
                    </Text>
                  </View>
                )}
              </XStack>

              <TouchableOpacity
                onPress={handleClose}
                hitSlop={HIT_SLOP}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.background,
                }}
              >
                <Icon name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </XStack>
          </YStack>
        </RNView>

        <View flex={1}>
          {loading && comments.length === 0 ? (
            <CommentsSkeleton />
          ) : (
            <FlatList
              ref={flatListRef}
              data={comments}
              inverted
              extraData={expanded}
              keyExtractor={(item, index) =>
                item?.id?.toString() || index.toString()
              }
              onEndReached={fetchMore}
              onEndReachedThreshold={0.05}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                <YStack height={56} pt={20} alignItems="center">
                  {loadingMore ? (
                    <ActivityIndicator size="small" color={ACCENT} />
                  ) : null}
                </YStack>
              }
              contentContainerStyle={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                flexGrow: comments.length === 0 ? 1 : undefined,
              }}
              renderItem={({ item }) => (
                <CommentRow
                  item={item}
                  expanded={!!expanded[String(item?.id)]}
                  onToggle={handleToggleReplies}
                  onReply={handleReplyPress}
                />
              )}
              ListEmptyComponent={
                <YStack
                  flex={1}
                  alignItems="center"
                  justifyContent="center"
                  py={48}
                  px={24}
                  gap={10}
                >
                  <View
                    width={72}
                    height={72}
                    borderRadius={36}
                    bg="$backgroundPaper"
                    borderWidth={1}
                    borderColor="$divider"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon name="chat" size={32} color={ACCENT} />
                  </View>
                  <Text color="$textPrimary" fontSize={16} fontWeight="700">
                    No comments yet
                  </Text>
                  <Text color="$textSecondary" fontSize={13} textAlign="center">
                    Be the first to share your thoughts.
                  </Text>
                  <TouchableOpacity
                    onPress={() => inputRef.current?.focus()}
                    activeOpacity={0.85}
                    style={{
                      marginTop: 6,
                      backgroundColor: ACCENT,
                      paddingHorizontal: 18,
                      paddingVertical: 9,
                      borderRadius: 20,
                    }}
                  >
                    <Text color="#fff" fontSize={13} fontWeight="700">
                      Write a comment
                    </Text>
                  </TouchableOpacity>
                </YStack>
              }
            />
          )}
        </View>

        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView behavior="padding">
            {inputFooter}
          </KeyboardAvoidingView>
        ) : (
          inputFooter
        )}
      </Animated.View>
    </View>
  );
};

export default Comments;
