export function getThemeColor(token: any, fallback: string): string {
  if (!token) return fallback;
  if (typeof token.get === "function") {
    try {
      return token.get() ?? fallback;
    } catch {
      return fallback;
    }
  }
  return token.val ?? fallback;
}
