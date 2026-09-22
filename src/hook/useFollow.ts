import { useCallback, useState } from "react";
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

    return followState[userId] ?? reduxFollowed ?? false;
  };

  // مقداردهی اولیه‌ی گروهی، مثلا وقتی از سرویس followingList لیستی می‌آید
  // که همه‌ی آن‌ها از قبل فالو شده‌اند
  const initFollowState = useCallback(
    (userIds: (number | string)[], value: boolean) => {
      setFollowState((prev) => {
        const next = { ...prev };
        userIds.forEach((id) => {
          if (id !== undefined && id !== null && !(id in next)) {
            next[id] = value;
          }
        });
        return next;
      });
    },
    [],
  );

  const toggleFollow = async (userId: number) => {
    if (userId === undefined || userId === null) return;

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
    initFollowState,
    loadingId,
  };
};
