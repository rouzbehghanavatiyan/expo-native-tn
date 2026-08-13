import { AnyAction } from "@reduxjs/toolkit";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/reduxHookType";

interface UseShowWatchProps {
  inviteId?: string | number;
  data: any[];
  pagination: {
    skip: number;
    take: number;
    hasMore: boolean;
  };
  customFetchNextPage?: (params: any) => Promise<any[] | void>;
  paginationAction: (payload: any) => AnyAction;
  resetAction: () => AnyAction;
  appendAction?: (payload: any[]) => AnyAction;
  customCleanup?: () => void;
}

export const useShowWatch = ({
  inviteId,
  data = [],
  pagination,
  customFetchNextPage,
  paginationAction,
  resetAction,
  appendAction,
  customCleanup,
}: any) => {
  const dispatch = useAppDispatch();
  const initialPlaySetRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null,
  );
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>(
    {},
  );

  const isLoadingRef = useRef(false);
  const paginationRef = useRef(pagination);
  const dataRef = useRef(data);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    dataRef.current = data || [];
  }, [data]);

  const defaultFetchNextPage = useCallback(async (params: any) => {
    if (!params.inviteId) return [];

    try {
      const { attachmentListByInviteId }: any =
        await import("../services/masterServices");

      const res = await attachmentListByInviteId(params);

      return res?.data ?? [];
    } catch (error) {
      console.error("fetch error:", error);
      return [];
    }
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (isLoadingRef.current || !paginationRef.current.hasMore || !inviteId) {
      return [];
    }

    setIsLoading(true);

    try {
      const fetcher = customFetchNextPage ?? defaultFetchNextPage;

      const currentDataLength = dataRef.current.length;
      const isFirstFetch = currentDataLength === 0;
      const dynamicTake = isFirstFetch ? 6 : 3;
      const exactSkip = currentDataLength;

      const result = await fetcher({
        skip: exactSkip,
        take: dynamicTake,
        inviteId,
      });

      // اگر fetcher والد void برگرداند، newData آرایه خالی در نظر گرفته می‌شود
      const newData = result || [];

      if (newData.length > 0 && appendAction) {
        dispatch(appendAction(newData));
      }

      // در صورتی که آپدیت‌های ریداکس در خود والد هندل شوند (مثل کدهای شما)،
      // newData در اینجا خالی خواهد بود و شرط پایین مانع تداخل در pagination می‌شود.
      if (newData.length > 0) {
        dispatch(
          paginationAction({
            take: 3,
            skip: exactSkip + newData.length,
            hasMore: newData.length > 0,
          }),
        );
      }

      return newData;
    } catch (error) {
      console.error("pagination error:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [
    inviteId,
    dispatch,
    appendAction,
    customFetchNextPage,
    defaultFetchNextPage,
    paginationAction,
  ]);

  // const handleSlideChange = useCallback(
  //   (index: number) => {
  //     setActiveSlideIndex(index);
  //     setOpenDropdowns({});

  //     const currentVideoId =
  //       dataRef.current[index]?.attachmentInserted?.attachmentId;

  //     if (currentVideoId) {
  //       setCurrentlyPlayingId(currentVideoId);
  //     }

  //     const threshold = dataRef.current.length - 3;

  //     if (
  //       index >= threshold &&
  //       paginationRef.current.hasMore &&
  //       !isLoadingRef.current
  //     ) {
  //       fetchNextPage();
  //     }
  //   },
  //   [fetchNextPage],
  // );

  const handleVideoPlay = useCallback((videoId: string) => {
    setOpenDropdowns({});
    setCurrentlyPlayingId((prev) => (prev === videoId ? null : videoId));
  }, []);

  const toggleDropdown = useCallback((index: number) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const dropdownItems = useCallback(
    (_data: any, _position: number, userSenderId: any) => [
      {
        label: "Send message",
        icon: "mail",
        onClick: () => {
          console.log("Send message", userSenderId?.id);
        },
      },
      { divider: true },
      {
        label: "Report",
        icon: "flag",
        onClick: () => console.log("report"),
      },
    ],
    [],
  );

  const handleSlideChange = useCallback(
    (index: number) => {
      setActiveSlideIndex(index);
      setOpenDropdowns({});

      const currentItem = dataRef.current[index];

      const currentVideoId =
        index % 2 === 0
          ? currentItem?.attachmentInserted?.attachmentId
          : currentItem?.attachmentMatched?.attachmentId;

      if (currentVideoId) {
        setCurrentlyPlayingId(currentVideoId);
      }

      const threshold = dataRef.current.length - 3;

      if (
        index >= threshold &&
        paginationRef.current.hasMore &&
        !isLoadingRef.current
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage],
  );

  useEffect(() => {
    if (data.length === 0) {
      initialPlaySetRef.current = false;
    } else if (data.length > 0 && !initialPlaySetRef.current) {
      setCurrentlyPlayingId(data[0]?.attachmentInserted?.attachmentId);
      initialPlaySetRef.current = true;
    }
  }, [data]);

  useEffect(() => {
    if (inviteId && data.length === 0 && !isLoadingRef.current) {
      fetchNextPage();
    }
  }, [inviteId, data.length, fetchNextPage]);

  useEffect(() => {
    return () => {
      if (customCleanup) {
        customCleanup();
      } else if (resetAction) {
        dispatch(resetAction());
      }
    };
  }, [dispatch, customCleanup, resetAction]);

  return {
    data,
    isLoading,
    activeSlideIndex,
    currentlyPlayingId,
    openDropdowns,

    handleVideoPlay,
    toggleDropdown,
    dropdownItems,
    handleSlideChange,
    fetchNextPage,
    setOpenDropdowns,
  };
};
