export const getColors = (isDark: boolean) => ({
  bg: isDark ? "#000000" : "#FFFFFF",
  videoBg: isDark ? "#000000" : "#F2F2F7",
  border: isDark ? "#333333" : "#E5E5EA",
  card: isDark ? "#1C1C1E" : "#F2F2F7",
  title: isDark ? "#FFFFFF" : "#111111",
  text: isDark ? "#AAAAAA" : "#666666",
  spinner: isDark ? "#FFFFFF" : "#000000",
  divider: isDark ? "#000000" : "#E5E5EA",
  centerIconBg: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.6)",
  centerIconBorder: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.2)",
  centerIconColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.35)",
});
