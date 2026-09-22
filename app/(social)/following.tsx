import UserListLayout from "@/src/common/UserListLayout";
import { useFollow } from "@/src/hook/useFollow";
import { followingList } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import asyncWrapper from "@/src/utils/asyncWrapper";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
// 1. اضافه کردن BackHandler از react-native
import { BackHandler } from "react-native";

const Following = () => {
  const main = useAppSelector((state) => state.main);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [following, setFollowing] = useState([]);

  const userIdLogin = main?.userLogin?.user?.id;
  const userIdFromLocation = params?.id;
  const { isFollowed, toggleFollow, initFollowState } = useFollow(userIdLogin);

  const handleAllFollowing = asyncWrapper(
    async () => {
      setIsLoading(true);
      const targetUserId = userIdFromLocation || userIdLogin;
      if (!targetUserId) return;

      const res = await followingList(targetUserId);
      const { status, data } = res?.data;

      if (status === 0) {
        setFollowing(data);

        const ids = (data || [])
          .map(
            (u: any) =>
              u?.attachment?.attachmentId ||
              u?.followerId ||
              u?.userId ||
              u?.id,
          )
          .filter((id: any) => id !== undefined && id !== null);

        initFollowState(ids, true);
      }
    },
    () => setIsLoading(false),
  );

  useEffect(() => {
    handleAllFollowing();
  }, []);

  useEffect(() => {
    const backAction = () => {
      router.replace("/profile");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  return (
    <UserListLayout
      title="Following"
      isLoading={isLoading}
      data={following}
      emptyMessage="There are no following."
      onBack={() => router.replace("/profile")}
      isFollowed={isFollowed}
      toggleFollow={toggleFollow}
      imgSize={50}
    />
  );
};

export default Following;
