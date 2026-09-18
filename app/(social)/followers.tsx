import UserListLayout from "@/src/common/UserListLayout";
import { useFollow } from "@/src/hook/useFollow";
import { followerList } from "@/src/services/masterServices";
import { RsetAllFollowerList } from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

const FollowerScreen = () => {
  const main = useAppSelector((state) => state.main);
  const dispatch = useAppDispatch();
  const followers = main?.allFollowerList || [];
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const userIdLogin = main?.userLogin?.user?.id;
  const { isFollowed, toggleFollow } = useFollow(userIdLogin);
  const userIdFromLocation = params?.id;

  const handleAllFollowers = async () => {
    try {
      setIsLoading(true);
      const targetUserId = userIdFromLocation || userIdLogin;
      if (!targetUserId) return;

      const res = await followerList(targetUserId);
      const { status, data } = res?.data || {};

      if (status === 0) {
        dispatch(RsetAllFollowerList(data || []));
      }
    } catch (error: any) {
      console.log("followerList error:", error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleAllFollowers();
  }, [userIdFromLocation, userIdLogin]);

  return (
    <UserListLayout
      title="Followers"
      isLoading={isLoading}
      data={followers}
      emptyMessage="There are no followers."
      onBack={() => router.back()}
      isFollowed={isFollowed}
      toggleFollow={toggleFollow}
      imgSize={60}
    />
  );
};

export default FollowerScreen;
