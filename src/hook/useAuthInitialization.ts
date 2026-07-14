import {
    categoryList,
    followerList,
    followingList,
    profileAttachment,
} from "@/src/services/masterServices";
import {
    RsetAllFollowerList,
    RsetCategory,
    RsetUserId,
    RsetUserLogin,
} from "@/src/slices/main";
import { logger } from "@/src/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type JwtPayload = {
  [key: string]: any;
};

export function useAuthInitialization() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  const getUserIdFromToken = useCallback((savedToken: string) => {
    try {
      const decoded: JwtPayload = jwtDecode(savedToken);

      return (
        decoded?.userId ||
        decoded?.UserId ||
        decoded?.id ||
        decoded?.nameid ||
        decoded?.sub ||
        decoded?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        null
      );
    } catch (error) {
      logger.error("jwtDecode error", error);
      return null;
    }
  }, []);

  const loadUserMasterData = useCallback(
    async (targetUserId: number) => {
      if (!targetUserId || isNaN(targetUserId)) return;

      try {
        const [cat, followingRes, followerRes] = await Promise.all([
          categoryList(),
          followingList(targetUserId),
          followerList(targetUserId),
        ]);

        dispatch(RsetCategory(cat?.data?.data || []));
        dispatch(RsetAllFollowerList(followerRes?.data?.data || []));

        logger.info("following list", followingRes?.data?.data || []);
      } catch (error) {
        logger.error("loadUserMasterData error", error);
      }
    },
    [dispatch],
  );

  const loadCurrentUser = useCallback(
    async (savedToken: string) => {
      try {
        const userIdFromToken = Number(getUserIdFromToken(savedToken));

        if (!userIdFromToken || isNaN(userIdFromToken)) {
          throw new Error("Invalid user id from token");
        }

        dispatch(RsetUserId(userIdFromToken));

        try {
          const profileRes = await profileAttachment(userIdFromToken);
          const userData = profileRes?.data?.data;

          if (userData) {
            dispatch(
              RsetUserLogin({
                ...userData,
                token: savedToken,
                userId: userData?.user?.id || userIdFromToken,
              }),
            );
          } else {
            dispatch(
              RsetUserLogin({
                token: savedToken,
                userId: userIdFromToken,
              }),
            );
          }

          const finalUserId = Number(userData?.user?.id || userIdFromToken);
          await loadUserMasterData(finalUserId);
        } catch (apiError: any) {
          console.log(
            "❌ Profile API Error:",
            apiError?.response?.data || apiError?.message,
          );
          logger.error("API call failed in loadCurrentUser", apiError);

          dispatch(
            RsetUserLogin({
              token: savedToken,
              userId: userIdFromToken,
            }),
          );
        }
      } catch (error: any) {
        console.log("❌ Token/Auth Error:", error?.message);
        logger.error("loadCurrentUser error", error);

        await AsyncStorage.removeItem("token");

        dispatch(RsetUserLogin(null));
        dispatch(RsetUserId(null));
      }
    },
    [dispatch, getUserIdFromToken, loadUserMasterData],
  );

  const initializeAuth = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem("token");

      if (!savedToken) {
        dispatch(RsetUserLogin(null));
        dispatch(RsetUserId(null));
        return;
      }

      await loadCurrentUser(savedToken);
    } catch (error) {
      logger.error("initializeAuth error", error);
    } finally {
      setIsInitializing(false);
    }
  }, [loadCurrentUser, dispatch]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    isInitializing,
  };
}
