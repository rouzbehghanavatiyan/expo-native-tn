import { Icon } from "@/src/components/Icon";
import ImageRank from "@/src/components/ImageRank";
import { addComment, commentList } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface CommentsProps {
  visible: boolean;
  onClose: () => void;
  video: any;
  positionVideo: number;
  userIdLogin: string | null;
  commentUserInfo?: any;
}

const Comments: React.FC<CommentsProps> = ({
  visible,
  onClose,
  video,
  positionVideo,
  userIdLogin,
  commentUserInfo,
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const userProfile = getImageUrl(userInfo?.profile);
  const main = useAppSelector((state) => state?.main);
  const [answerData, setAnswerData] = useState<any>({});
  const flatListRef = useRef<FlatList<any>>(null);

  const movieId =
    positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;

  const fetchComments = useCallback(async () => {
    if (!movieId) return;

    setLoading(true);

    try {
      const res = await commentList(movieId);
      const { data, status } = res?.data || {};

      if (status === 0) {
        const commentsHierarchy = (data || []).reduce(
          (acc: any[], comment: any) => {
            if (!comment.parentId) {
              acc.push({ ...comment, replies: [] });
            } else {
              const parentComment = acc.find(
                (c: any) => c.id === comment.parentId,
              );

              if (parentComment) {
                parentComment.replies.push(comment);
              }
            }

            return acc;
          },
          [],
        );
        setComments(commentsHierarchy);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  const resetCommentsState = useCallback(() => {
    setComments([]);
    setText("");
    setAnswerData({});
    setLoading(false);
    setSending(false);
  }, []);

  const handleClose = useCallback(() => {
    resetCommentsState();
    onClose();
  }, [resetCommentsState, onClose]);

  useEffect(() => {
    if (visible && movieId) {
      fetchComments();
    }
    if (!visible) {
      setText("");
    }
  }, [visible, movieId, fetchComments]);

  // Android hardware back button should close the sheet (Modal used to do this for us)
  useEffect(() => {
    if (Platform.OS !== "android" || !visible) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });

    return () => sub.remove();
  }, [visible, handleClose]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();

    if (!trimmed || !movieId || sending) return;

    setSending(true);

    try {
      const postData = {
        userId: main?.userLogin?.user?.id,
        movieId,
        desc: trimmed,
        ParentId: answerData?.id || null,
      };

      const res = await addComment(postData);
      const { status } = res?.data || {};

      if (status === 0) {
        setText("");
        setAnswerData({});
        await fetchComments();
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
    main?.userLogin?.user?.id,
    answerData?.id,
    fetchComments,
  ]);

  if (!visible) return null;

  const inputFooter = (
    <XStack
      alignItems="flex-end"
      borderTopWidth={0.5}
      borderTopColor="#2c2c2e"
      pt={10}
      pb={Math.max(insets.bottom, 12)}
      px={4}
      gap={10}
      backgroundColor="#1c1c1e"
    >
      <View mb={2}>
        <ImageRank imgSrc={userProfile} imgSize={30} />
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={
          answerData?.id
            ? `Reply to ${answerData?.userName || "comment"}...`
            : "Add a comment..."
        }
        placeholderTextColor="#8e8e93"
        multiline
        style={{
          flex: 1,
          color: "#fff",
          fontSize: 15,
          maxHeight: 100,
          paddingVertical: Platform.OS === "ios" ? 6 : 4,
        }}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || sending}
        style={{ marginBottom: 4 }}
      >
        <Text color={text.trim() ? "#0095F6" : "#555"} fontWeight="700">
          <Icon name="send" color="gray" />
        </Text>
      </TouchableOpacity>
    </XStack>
  );

  return (
    <View flex={1} justifyContent="flex-end">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(0,0,0,0.5)"
        />
      </TouchableWithoutFeedback>

      <View
        backgroundColor="#1c1c1e"
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        height={SCREEN_HEIGHT * 0.8}
        flexShrink={1}
        paddingTop={12}
        paddingHorizontal={12}
        paddingBottom={0}
      >
        <XStack
          alignItems="center"
          justifyContent="space-between"
          pb={12}
          borderBottomWidth={0.5}
          borderBottomColor="#2c2c2e"
        >
          <YStack alignItems="center">
            <View
              width={40}
              height={4}
              borderRadius={2}
              backgroundColor="#666"
              mb={10}
            />
            <Text color="white" fontSize={16} fontWeight="700">
              Comments
            </Text>
          </YStack>

          {/* <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" color="white" size={22} />
          </TouchableOpacity> */}
        </XStack>

        <View flex={1}>
          {loading && comments.length === 0 ? (
            <View flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <>
              {loading && comments.length > 0 && (
                <View
                  position="absolute"
                  top={8}
                  left={0}
                  right={0}
                  zIndex={10}
                  alignItems="center"
                  pointerEvents="none"
                >
                  <View
                    backgroundColor="rgba(0,0,0,0.45)"
                    px={10}
                    py={6}
                    borderRadius={20}
                  >
                    <ActivityIndicator color="#fff" size="small" />
                  </View>
                </View>
              )}
              <FlatList
                ref={flatListRef}
                contentContainerStyle={{
                  paddingBottom: 10,
                  flexGrow: comments.length === 0 ? 1 : undefined,
                }}
                style={{ flex: 1 }}
                data={comments}
                keyExtractor={(item, index) =>
                  item?.id?.toString() || index.toString()
                }
                onContentSizeChange={() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }}
                onLayout={() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }}
                renderItem={({ item }) => (
                  <YStack py={10} px={4} gap={8}>
                    <XStack gap={10} alignItems="flex-start">
                      <ImageRank
                        imgSrc={getImageUrl(item?.profile)}
                        imgSize={36}
                        userName={item?.userName}
                        score={item?.score}
                      />
                      <YStack flex={1}>
                        <Text fontSize={"$3"} color="#fff">
                          {item?.desc}
                        </Text>
                      </YStack>
                      <TouchableOpacity
                        onPress={() => setAnswerData(item)}
                        hitSlop={8}
                        style={{ marginTop: 2 }}
                      >
                        <XStack marginRight={8} gap={10}>
                          <Icon name="reply" color="#bdbdbd" size={16} />
                        </XStack>
                      </TouchableOpacity>
                    </XStack>

                    {item?.replies?.length > 0 &&
                      item.replies.map((reply: any) => (
                        <XStack
                          key={reply.id}
                          ml={46}
                          mt={8}
                          gap={8}
                          alignItems="flex-start"
                        >
                          <ImageRank
                            imgSrc={getImageUrl(reply?.profile)}
                            imgSize={30}
                            userName={reply?.userName}
                            score={reply?.score}
                          />
                          <YStack flex={1}>
                            <Text color="white">
                              <Text color="#fff">{reply?.desc}</Text>
                            </Text>
                          </YStack>
                        </XStack>
                      ))}
                  </YStack>
                )}
                ListEmptyComponent={
                  <View
                    flex={1}
                    justifyContent="center"
                    alignItems="center"
                    py={20}
                  >
                    <Text color="#888">
                      No comments yet. Be the first to comment!
                    </Text>
                  </View>
                }
              />
            </>
          )}
        </View>
        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView behavior="padding">
            {inputFooter}
          </KeyboardAvoidingView>
        ) : (
          inputFooter
        )}
      </View>
    </View>
  );
};

export default Comments;
