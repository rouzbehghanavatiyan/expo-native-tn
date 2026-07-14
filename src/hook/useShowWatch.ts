import { AnyAction } from "@reduxjs/toolkit";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/reduxHookType";
import { logger } from "../utils/logger";

interface UseShowWatchProps {
  inviteId?: string;
  data: any[];
  pagination: {
    skip: number;
    take: number;
    hasMore: boolean;
  };
  customFetchNextPage?: (params: any) => Promise<any[]>;
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
}: UseShowWatchProps) => {
  const dispatch = useAppDispatch();

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

      const newData = await fetcher({
        skip: exactSkip,
        take: dynamicTake,
        inviteId,
      });

      if (newData.length > 0 && appendAction) {
        dispatch(appendAction(newData));
      }

      dispatch(
        paginationAction({
          take: 3,
          skip: exactSkip + newData.length,
          hasMore: newData.length > 0,
        }),
      );

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

  const handleVideoPlay = useCallback((videoId: string) => {
    logger.info("videoId videoId videoId", videoId);
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

  const handleSlideChange = useCallback(
    (index: number) => {
      setActiveSlideIndex(index);
      setOpenDropdowns({});

      const currentItem = dataRef.current[index];

      // index زیرو-بیس: 0,2,4 => اسلاید نمایشی 1,3,5 (فرد) => ویدیوی بالا
      // index زیرو-بیس: 1,3,5 => اسلاید نمایشی 2,4,6 (زوج) => ویدیوی پایین
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
    if (data.length > 0 && !currentlyPlayingId) {
      setCurrentlyPlayingId(data[0]?.attachmentInserted?.attachmentId);
    }
  }, [data, currentlyPlayingId]);

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
