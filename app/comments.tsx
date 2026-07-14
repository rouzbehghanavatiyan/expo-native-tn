import { Icon } from "@/src/components/Icon";
import { addComment, commentList } from "@/src/services/masterServices";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
// import { addComment, getCommentList } from "../services/masterServices";
import ImageRank from "@/src/components/ImageRank";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CommentsProps {
  visible: boolean;
  onClose: () => void;
  video: any;
  positionVideo: number;
  userIdLogin: string | null;
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

  // const getMovieId =
  //   positionVideo === 0
  //     ? commentUserInfo?.attachmentInserted?.attachmentId
  //     : commentUserInfo?.attachmentMatched?.attachmentId;

  const ownerUser =
    positionVideo === 0 ? video?.userInserted : video?.userMatched;

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View
          flex={1}
          backgroundColor="rgba(0,0,0,0.5)"
          justifyContent="flex-end"
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <View flex={1} justifyContent="flex-end">
                <View
                  backgroundColor="#1c1c1e"
                  borderTopLeftRadius={24}
                  borderTopRightRadius={24}
                  height="80%"
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
                    <View width={32} />

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

                    <TouchableOpacity
                      onPress={handleClose}
                      hitSlop={{
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                      }}
                    >
                      <Icon name="close" color="white" size={22} />
                    </TouchableOpacity>
                  </XStack>

                  <View flex={1}>
                    {loading && comments.length === 0 ? (
                      <View
                        flex={1}
                        justifyContent="center"
                        alignItems="center"
                      >
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
                            flatListRef.current?.scrollToEnd({
                              animated: true,
                            });
                          }}
                          onLayout={() => {
                            flatListRef.current?.scrollToEnd({
                              animated: false,
                            });
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
                                    {/* <Icon
                                      name="delete"
                                      color="#bdbdbd"
                                      size={16}
                                    /> */}
                                    <Icon
                                      name="reply"
                                      color="#bdbdbd"
                                      size={16}
                                    />
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
                                        {/* <Text fontWeight="bold">
                                          {reply?.userName || "User"}{" "}
                                        </Text> */}
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

                  <XStack
                    alignItems="center"
                    borderTopWidth={0.5}
                    borderTopColor="#2c2c2e"
                    pt={10}
                    pb={insets.bottom}
                    px={4}
                    gap={10}
                  >
                    <ImageRank imgSrc={userProfile} imgSize={30} />
                    <TextInput
                      value={text}
                      onChangeText={setText}
                      placeholder={
                        answerData?.id
                          ? `Reply to ${answerData?.userName || "comment"}...`
                          : "Add a comment..."
                      }
                      placeholderTextColor="#8e8e93"
                      style={{
                        flex: 1,
                        color: "#fff",
                        fontSize: 15,
                      }}
                    />
                    <TouchableOpacity
                      onPress={handleSend}
                      disabled={!text.trim() || sending}
                    >
                      <Text
                        color={text.trim() ? "#0095F6" : "#555"}
                        fontWeight="700"
                      >
                        <Icon name="send" color="gray" />
                      </Text>
                    </TouchableOpacity>
                  </XStack>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Comments;
