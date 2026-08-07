import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 3;

export function useLoadMore<T = any>(
  fetchFn: (params: { skip: number; take: number }) => Promise<any>,
  onSuccess: (newItems: T[], isFirstPage: boolean) => void,
  cachedDataLength: number = 0,
) {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const skipRef = useRef(cachedDataLength);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await fetchFn({ skip: skipRef.current, take: PAGE_SIZE });

      console.log("Raw Response Data:", res?.data?.data);

      const list: T[] = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

      onSuccess(list, skipRef.current === 0);
      
      skipRef.current += list.length;
      const more = list.length === PAGE_SIZE;

      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err) {
      console.error("Error to get profile videos:", err);
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchFn, onSuccess]);

  useEffect(() => {
    if (cachedDataLength === 0) {
      loadMore();
    }
  }, []);

  return { loading, hasMore, loadMore };
}
