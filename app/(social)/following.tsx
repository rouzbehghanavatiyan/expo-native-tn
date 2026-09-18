import UserListLayout from "@/src/common/UserListLayout";
import { useFollow } from "@/src/hook/useFollow";
import { followingList } from "@/src/services/masterServices";
import { RsetAllFollowingList } from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import asyncWrapper from "@/src/utils/asyncWrapper";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

const Following = () => {
  const main = useAppSelector((state) => state.main);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const userIdLogin = main?.userLogin?.user?.id;
  const userIdFromLocation = params?.id;
  const following = main?.allFollowingList || [];
  const { isFollowed, toggleFollow } = useFollow(userIdLogin);

  const handleAllFollowing = asyncWrapper(
    async () => {
      setIsLoading(true);
      const targetUserId = userIdFromLocation || userIdLogin;
      if (!targetUserId) return;

      const res = await followingList(targetUserId);
      const { status, data } = res?.data;

      if (status === 0) {
        dispatch(RsetAllFollowingList(data));
      }
    },
    () => setIsLoading(false),
  );

  useEffect(() => {
    handleAllFollowing();
  }, []);

  return (
    <UserListLayout
      title="Following"
      isLoading={isLoading}
      data={following}
      emptyMessage="There are no following."
      onBack={() => router.back()}
      isFollowed={isFollowed}
      toggleFollow={toggleFollow}
      imgSize={50}
    />
  );
};

export default Following;
