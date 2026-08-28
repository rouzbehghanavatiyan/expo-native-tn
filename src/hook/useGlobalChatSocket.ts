import { allUserMessagese } from "@/src/services/nestServices";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { socketClient } from "@/src/utils/socketClient";
import { useCallback, useEffect } from "react";
import { incrementSenderUnread, setChatUsers } from "../slices/chat";

export function useGlobalChatSocket() {
  const dispatch = useAppDispatch();
  const userIdLogin = useAppSelector(
    (state) => state?.main?.userLogin?.user?.id,
  );

  const refreshChatList = useCallback(async () => {
    if (!userIdLogin) return;
    try {
      const res = await allUserMessagese(userIdLogin);
      const { data, status } = res?.data || {};
      if (status === 0 && data) {
        dispatch(setChatUsers(data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [userIdLogin, dispatch]);

  useEffect(() => {
    if (!socketClient || !userIdLogin) return;

    const handleReceiveMessage = (data: any) => {
      const targetUserId = data?.recieveId ?? data?.receiveId;
      if (String(userIdLogin) !== String(targetUserId)) return;

      const senderStr = String(data.sender ?? data.senderId);

      // 🟢 بررسی می‌کنیم آیا این فرستنده از قبل در لیست هست یا نه
      // (getState به‌جای selector گرفتن، چون داخل callback هستیم و نیاز به مقدار لحظه‌ای داریم)
      const currentUsers = (window as any).__store__?.getState?.()?.chat?.users;
      // اگر به store مستقیم دسترسی نداری، از دیسپچ thunk استفاده کن (روش پایین‌تر ترجیح داده میشه)

      dispatch(incrementSenderUnread(senderStr));
    };

    socketClient.on("receive_message", handleReceiveMessage);

    // 🟢 هر گونه پیام از کاربر جدید که در Redux نبود، توسط این event هندل میشه
    // (اگر بک‌اند چنین eventی نداره، این بخش رو نادیده بگیر)
    socketClient.on("new_conversation", refreshChatList);

    return () => {
      socketClient.off("receive_message", handleReceiveMessage);
      socketClient.off("new_conversation", refreshChatList);
    };
  }, [userIdLogin, dispatch, refreshChatList]);
}
