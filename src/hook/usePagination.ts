import { useCallback, useEffect, useRef, useState } from "react";

interface PaginationOptions {
  take?: number;
  extraParams?: Record<string, any>;
}

interface PaginationResult<T> {
  data: T[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  refresh: () => void;
}

export const usePagination = <T = any>(
  fetchFunction: (params: any) => Promise<any>,
  options: PaginationOptions = {},
): PaginationResult<T> => {
  const { take = 10, extraParams = {} } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 🔒 قفل synchronous — بر خلاف state، بلافاصله و بدون تاخیر رندر آپدیت می‌شود
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const extraParamsString = JSON.stringify(extraParams);

  const fetchData = useCallback(
    async (currentPage: number, isRefresh: boolean = false) => {
      // اگر همین الان در حال فچ هستیم، اجازه ورود مجدد نده
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);

      try {
        const skip = (currentPage - 1) * take;
        const response = await fetchFunction({
          skip,
          take,
          ...JSON.parse(extraParamsString),
        });

        let fetchedItems: any = [];
        if (Array.isArray(response)) {
          fetchedItems = response;
        } else if (response?.data && Array.isArray(response.data)) {
          fetchedItems = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          fetchedItems = response.data.data;
        } else if (response?.data?.items && Array.isArray(response.data.items)) {
          fetchedItems = response.data.items;
        }

        const newData: T[] = Array.isArray(fetchedItems) ? fetchedItems : [];

        setData((prevData) =>
          isRefresh ? newData : [...prevData, ...newData],
        );

        const stillHasMore = newData.length >= take;
        hasMoreRef.current = stillHasMore;
        setHasMore(stillHasMore);
      } catch (error) {
        console.error("Error fetching paginated data: ", error);
        hasMoreRef.current = false;
        setHasMore(false);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [fetchFunction, take, extraParamsString],
  );

  useEffect(() => {
    fetchData(page, page === 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fetchData]);

  const fetchNextPage = useCallback(() => {
    // چک روی ref، نه روی state — چون state با تاخیر یک رندر آپدیت می‌شود
    if (isFetchingRef.current || !hasMoreRef.current) return;
    setPage((prevPage) => prevPage + 1);
  }, []);

  const refresh = useCallback(() => {
    isFetchingRef.current = false;
    hasMoreRef.current = true;
    setHasMore(true);
    setPage(1);
    // اگر صفحه از قبل 1 بوده، useEffect دوباره اجرا نمی‌شود، پس دستی صدا بزن
    fetchData(1, true);
  }, [fetchData]);

  return { data, isLoading, hasMore, fetchNextPage, refresh };
};