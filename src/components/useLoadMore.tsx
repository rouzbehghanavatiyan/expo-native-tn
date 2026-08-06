import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 3;

export function useLoadMore<T = any>(
  fetchFn: (params: { skip: number; take: number }) => Promise<any>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const skipRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await fetchFn({ skip: skipRef.current, take: PAGE_SIZE });

      const list: T[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      setItems((prev) => [...prev, ...list]);
      skipRef.current += list.length;

      const more = list.length === PAGE_SIZE;
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err) {
      console.error("خطا در دریافت ویدیوها:", err);
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    loadMore();
  }, []);

  return { items, loading, hasMore, loadMore };
}
