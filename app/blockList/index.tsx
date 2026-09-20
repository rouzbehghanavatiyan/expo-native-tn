import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import UserListLayout from "@/src/common/UserListLayout";
import { blockListByUser, userUnBlock } from "@/src/services/masterServices";
import { logger } from "@/src/utils/logger";

export default function BlockListScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [blockList, setBlockList] = useState([]);

  const main = useSelector((state: any) => state.main);
  const userLoginId = main?.userLogin?.user?.id || main?.userLogin?.userId;
  const router = useRouter();

  const handleBlockList = async () => {
    try {
      setIsLoading(true);
      const res = await blockListByUser();
      const { data, status } = res?.data || {};
      logger.info("blockList res", data);

      if (status === 0) {
        setBlockList(data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnBlockByUser = async (targetUserId: any) => {
    try {
      const postData = {
        blockerId: userLoginId,
        targetUserId: targetUserId,
      };

      setIsLoading(true);
      const res = await userUnBlock(postData);
      const { data, status } = res?.data || {};
      logger.info("unblock res", data);

      if (status === 0) {
        // حذف مستقیم کاربر از لیست جاری در استیت
        setBlockList((prev) =>
          prev.filter((user: any) => {
            const id =
              user?.attachment?.attachmentId ||
              user?.userId ||
              user?.id ||
              user?.sender;
            return id !== targetUserId;
          }),
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleBlockList();
  }, []);

  return (
    <UserListLayout
      title="Block List"
      isLoading={isLoading}
      data={blockList}
      emptyMessage="There are no blocked users."
      onBack={() => router.back()}
      onUnblock={handleUnBlockByUser}
    />
  );
}
