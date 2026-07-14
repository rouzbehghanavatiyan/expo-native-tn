import { ColorType, palette } from "../theme/color";

export type Appearance = "solid" | "outline" | "ghost";

export const resolveButtonStyles = (
  appearance: Appearance,
  colorType: ColorType,
) => {
  const color = palette[colorType];

  switch (appearance) {
    case "outline":
      return {
        backgroundColor: "transparent",
        borderColor: color.border,
        color: color.text,
      };

    case "ghost":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        color: color.text,
      };

    default:
      return {
        backgroundColor: color.bg,
        borderColor: color.border,
        color: color.contrast ?? "white",
      };
  }
};
