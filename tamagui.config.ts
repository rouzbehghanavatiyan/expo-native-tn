import { tokens as defaultTokens } from "@tamagui/config/v3";
import { shorthands } from "@tamagui/shorthands";
import { createFont, createTamagui, createTokens } from "tamagui";

const typographyFont = createFont({
  family: "PlusJakartaSans",
  size: {
    1: 12, // Caption / Overline
    2: 14, // Body2 / Subtitle2
    3: 16, // Body1 / Subtitle1
    4: 20, // h6
    5: 24, // h5
    6: 34, // h4
    7: 48, // h3
    8: 60, // h2
    9: 96, // h1
    true: 16, // Default (Body1)
  },
  lineHeight: {
    1: 18,
    2: 20,
    3: 24,
    4: 32,
    5: 36,
    6: 48,
    7: 56,
    8: 72,
    9: 112,
  },
  weight: {
    regular: "400",
    medium: "500",
    bold: "700",
    true: "400",
  },
  letterSpacing: {
    1: 0,
    2: -0.5,
  },
});

const logoFont = createFont({
  family: "logoFont",
  size: { 1: 24, 2: 32, 3: 48, true: 32 },
  lineHeight: { 1: 32, 2: 40, 3: 56 },
  weight: { 1: "400", true: "400" },
  letterSpacing: { 1: 0 },
});
const tokens = createTokens({
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    true: 16,
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    true: 16,
  },
  radius: {
    0: 0,
    1: 4, // MUI default borderRadius is usually 4px
    2: 8,
    3: 12,
    4: 16,
    round: 9999,
  },
  zIndex: {
    ...defaultTokens.zIndex, // <--- این خط مشکل را حل می‌کند (آوردن $0, $1 و...)
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  color: {
    white: "#FFFFFF",
    black: "#000000",
    // Grey Palette
    grey50: "#fafafa",
    grey100: "#f5f5f5",
    grey200: "#eeeeee",
    grey300: "#e0e0e0",
    grey400: "#bdbdbd",
    grey500: "#9e9e9e",
    grey600: "#757575",
    grey700: "#616161",
    grey800: "#424242",
    grey900: "#212121",
    // Base Brand Colors
    indigoMain: "#3f51b5",
    indigoLight: "#757de8",
    indigoDark: "#002984",
    pinkMain: "#e91e63",
    pinkLight: "#ff6090",
    pinkDark: "#b0003a",
    // Semantic Base Colors
    redMain: "#f44336",
    orangeMain: "#ff9800",
    blueMain: "#2196f3",
    greenMain: "#4caf50",
  },
});

const themes = {
  light: {
    // --- اضافه شدن دو کلید اجباری Tamagui ---
    background: tokens.color.grey50,
    color: "rgba(0, 0, 0, 0.87)",
    // ----------------------------------------

    // Backgrounds
    backgroundDefault: tokens.color.grey50,
    backgroundPaper: tokens.color.white,

    // Text
    textPrimary: "rgba(0, 0, 0, 0.87)",
    textSecondary: "rgba(0, 0, 0, 0.6)",
    textDisabled: "rgba(0, 0, 0, 0.38)",

    // Primary
    primaryMain: tokens.color.indigoMain,
    primaryLight: tokens.color.indigoLight,
    primaryDark: tokens.color.indigoDark,
    primaryContrastText: tokens.color.white,

    // Secondary
    secondaryMain: tokens.color.pinkMain,
    secondaryLight: tokens.color.pinkLight,
    secondaryDark: tokens.color.pinkDark,
    secondaryContrastText: tokens.color.white,

    // Status
    errorMain: tokens.color.redMain,
    warningMain: tokens.color.orangeMain,
    infoMain: tokens.color.blueMain,
    successMain: tokens.color.greenMain,

    // Borders / Dividers
    divider: "rgba(0, 0, 0, 0.12)",
  },
  dark: {
    // --- اضافه شدن دو کلید اجباری Tamagui ---
    background: "#121212",
    color: tokens.color.white,
    // ----------------------------------------

    // Backgrounds
    backgroundDefault: "#121212",
    backgroundPaper: "#1e1e1e",

    // Text
    textPrimary: tokens.color.white,
    textSecondary: "rgba(255, 255, 255, 0.7)",
    textDisabled: "rgba(255, 255, 255, 0.5)",

    // Primary (Often lighter in dark mode)
    primaryMain: tokens.color.indigoLight,
    primaryLight: "#a8abff",
    primaryDark: tokens.color.indigoMain,
    primaryContrastText: tokens.color.black,

    // Secondary
    secondaryMain: tokens.color.pinkLight,
    secondaryLight: "#ff94c2",
    secondaryDark: tokens.color.pinkMain,
    secondaryContrastText: tokens.color.black,

    // Status
    errorMain: "#f44336",
    warningMain: "#ffa726",
    infoMain: "#29b6f6",
    successMain: "#66bb6a",

    // Borders / Dividers
    divider: "rgba(255, 255, 255, 0.12)",
  },
};

const config = createTamagui({
  fonts: {
    heading: typographyFont,
    body: typographyFont,
    logo: logoFont,
  },
  tokens,
  themes,
  shorthands,
  defaultTheme: "light", // ✅ این خط را اضافه کن
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
