import { useCallback, useEffect, useState } from "react";

// تایپ‌های ورودی هوک
interface PaginationOptions {
  take?: number;
  extraParams?: Record<string, any>;
}

// ساختار خروجی هوک
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

  // برای جلوگیری از رندرهای اضافی، از JSON.stringify برای وابستگی extraParams استفاده می‌کنیم
  const extraParamsString = JSON.stringify(extraParams);

  const fetchData = useCallback(
    async (currentPage: number, isRefresh: boolean = false) => {
      setIsLoading(true);
      try {
        const skip = (currentPage - 1) * take;

        const response = await fetchFunction({
          skip,
          take,
          ...JSON.parse(extraParamsString),
        });

        // --- بخش اصلاح شده ---
        // بررسی کنید داده‌های شما در بک‌اند دقیقاً در کدام کلید قرار دارند
        // مثال: اگر خروجی axios باشد معمولا response.data است.
        // اگر بک‌اند دیتای صفحه‌بندی را داخل response.data.list بفرستد، باید آن را اینجا تغییر دهید.

        let fetchedItems: any = [];

        if (Array.isArray(response)) {
          fetchedItems = response;
        } else if (response?.data && Array.isArray(response.data)) {
          fetchedItems = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          fetchedItems = response.data.data;
        } else if (
          response?.data?.items &&
          Array.isArray(response.data.items)
        ) {
          fetchedItems = response.data.items; // در صورت وجود کلید items
        } else {
          console.warn(
            "استخراج آرایه ناموفق بود. ساختار response را بررسی کنید:",
            response,
          );
        }

        // اطمینان نهایی از اینکه newData حتما آرایه است
        const newData: T[] = Array.isArray(fetchedItems) ? fetchedItems : [];
        // ----------------------

        setData((prevData) =>
          isRefresh ? newData : [...prevData, ...newData],
        );

        setHasMore(newData.length >= take);
      } catch (error) {
        console.error("Error fetching paginated data: ", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFunction, take, extraParamsString],
  );

  // فراخوانی API زمانی که شماره صفحه تغییر می‌کند
  useEffect(() => {
    fetchData(page, page === 1);
  }, [page, fetchData]);

  // تابع برای دریافت صفحه بعدی (فراخوانی در onEndReached)
  const fetchNextPage = () => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // تابع برای رفرش کردن لیست (فراخوانی در onRefresh)
  const refresh = () => {
    setPage(1);
    setHasMore(true);
    // fetchData(1, true) توسط useEffect پس از تغییر page به 1 هندل می‌شود
  };

  return { data, isLoading, hasMore, fetchNextPage, refresh };
};
