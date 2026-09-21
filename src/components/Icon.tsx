import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTheme } from "tamagui";
import { getThemeColor } from "../hook/getThemeColor";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: any;
}

const formatIconName = (name: string) => {
  if (!name) return "";
  const withoutIcon = name.replace(/Icon$/, "");

  const kebab = withoutIcon.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  return kebab;
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 28,
  color,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const formattedName = formatIconName(name);

  const resolvedColor = useMemo(() => {
    if (color?.startsWith("$")) {
      const tokenKey = color.slice(1);
      return getThemeColor(theme[tokenKey], color);
    }

    if (color) return color;

    return getThemeColor(theme.textSecondary ?? theme.color, "#64748B");
  }, [color, theme]);

  return (
    <MaterialIcons
      name={formattedName as any}
      size={size}
      color={resolvedColor}
      onPress={onPress}
      style={style}
    />
  );
};
