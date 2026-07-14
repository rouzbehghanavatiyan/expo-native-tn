import { ButtonProps } from "tamagui";

export type ColorType =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error";
type Appearance = "solid" | "outline" | "ghost";

export interface BaseButtonProps extends ButtonProps {
  appearance?: Appearance;
  colorType?: ColorType;
  loading?: boolean;
  fullWidth?: boolean;
}
