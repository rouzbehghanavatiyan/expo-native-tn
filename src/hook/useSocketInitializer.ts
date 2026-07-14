import { RsetGiveUserOnlines, RsetSocketConfig } from "@/src/slices/main";
import { socketClient } from "@/src/utils/socketClient";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

type UseSocketInitializerParams = {
  userLoginId: any;
  userId: any;
};

export function useSocketInitializer({
  userLoginId,
  userId,
}: UseSocketInitializerParams) {
  const dispatch = useDispatch();

  useEffect(() => {
    const activeUserId = Number(userLoginId || userId);

    if (!activeUserId || isNaN(activeUserId)) return;

    const handleConnect = () => {
      console.log("✅ Socket connected:", socketClient.id);

      socketClient.emit("register_user", activeUserId);

      dispatch(
        RsetSocketConfig({
          socketId: socketClient.id,
          connected: true,
        }),
      );
    };

    const handleConnectError = (error: any) => {
      console.log("❌ Socket connect_error:", error?.message || error);

      dispatch(
        RsetSocketConfig({
          socketId: null,
          connected: false,
        }),
      );
    };

    const handleDisconnect = (reason: string) => {
      console.log("⚠️ Socket disconnected:", reason);

      dispatch(
        RsetSocketConfig({
          socketId: null,
          connected: false,
        }),
      );
    };

    const handleAllUsersOnline = (data: any) => {
      dispatch(RsetGiveUserOnlines(data));
    };

    socketClient.on("connect", handleConnect);
    socketClient.on("connect_error", handleConnectError);
    socketClient.on("disconnect", handleDisconnect);
    socketClient.on("all_user_online", handleAllUsersOnline);

    if (!socketClient.connected) {
      socketClient.connect();
    } else {
      socketClient.emit("register_user", activeUserId);

      dispatch(
        RsetSocketConfig({
          socketId: socketClient.id,
          connected: true,
        }),
      );
    }

    return () => {
      socketClient.off("connect", handleConnect);
      socketClient.off("connect_error", handleConnectError);
      socketClient.off("disconnect", handleDisconnect);
      socketClient.off("all_user_online", handleAllUsersOnline);
    };
  }, [userLoginId, userId, dispatch]);
}
