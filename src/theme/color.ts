import { PaletteColor } from "./type";

export const themes = {
  light: {
    background: "$white",
    color: "$gray900",
    primary: "$primary500",
    borderColor: "$gray100",
  },
  dark: {
    background: "$gray900",
    color: "$white",
    primary: "$primary600",
    borderColor: "$gray500",
  },
};
export type ColorType =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error";

export const palette: Record<ColorType, PaletteColor> = {
  primary: {
    bg: "$primaryMain",
    border: "$primaryMain",
    text: "$primaryMain",
    contrast: "$primaryContrastText",
  },
  secondary: {
    bg: "$secondaryMain",
    border: "$secondaryMain",
    text: "$secondaryMain",
    contrast: "$secondaryContrastText",
  },
  success: {
    bg: "$successMain",
    border: "$successMain",
    text: "$successMain",
  },
  warning: {
    bg: "$warningMain",
    border: "$warningMain",
    text: "$warningMain",
  },
  error: {
    bg: "$errorMain",
    border: "$errorMain",
    text: "$errorMain",
  },
};
