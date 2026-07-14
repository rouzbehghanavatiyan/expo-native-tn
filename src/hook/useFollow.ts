import { useState } from "react";
import { useSelector } from "react-redux";
import { addFollower, removeFollower } from "../services/masterServices";

export const useFollow = (userIdLogin: number) => {
  const main = useSelector((state: any) => state.main);

  const [followState, setFollowState] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const isFollowed = (userId: number) => {
    const reduxFollowed = main?.allFollowingList?.some(
      (f: any) =>
        (f?.attachment?.attachmentId || f?.userId || f?.id) === userId,
    );

    return followState[userId] ?? reduxFollowed;
  };

  const toggleFollow = async (userId: number) => {
    const current = isFollowed(userId);

    const postData = {
      userId: userIdLogin,
      followerId: userId,
    };

    try {
      setLoadingId(userId);

      if (current) {
        await removeFollower(postData);
      } else {
        await addFollower(postData);
      }

      setFollowState((prev) => ({
        ...prev,
        [userId]: !current,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return {
    isFollowed,
    toggleFollow,
    loadingId,
  };
};
