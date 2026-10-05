export const MATCH_DURATION = 3600;

// لحظهٔ دریافت پاسخ را ثبت می‌کند تا endAt مطلق شود
export const withMatchEndAt = (items: any[], receivedAt = Date.now()) =>
  (items ?? []).map((i) => ({
    ...i,
    matchEndAt:
      i?.matchRemainingSeconds > 0
        ? receivedAt + i.matchRemainingSeconds * 1000
        : null,
  }));

export const isMatchActive = (v: any) => (v?.matchRemainingSeconds ?? 0) > 0;
