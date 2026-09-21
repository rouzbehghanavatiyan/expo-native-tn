import React, { forwardRef } from "react";
import { Button, ButtonProps, Spinner, styled, Text, useTheme } from "tamagui";
import { ColorType } from "./type";

const StyledButton = styled(Button, {
  name: "BaseButton",
  borderRadius: "$3",
  height: "$10",
  justifyContent: "center",
  alignItems: "center",
  pressStyle: {
    opacity: 0.85,
  },
});

export interface BaseButtonProps extends Omit<ButtonProps, "color"> {
  appearance?: "solid" | "outline" | "ghost";
  colorType?: ColorType | "neutral";
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: any;
  bordered?: boolean;
  noBg?: boolean;
  children?: React.ReactNode;
}

export const BaseButton = forwardRef<any, BaseButtonProps>(
  (
    {
      appearance = "solid",
      colorType = "primary",
      loading = false,
      fullWidth = false,
      disabled,
      icon,
      bordered = false,
      noBg = false,
      children,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const isDisabled = disabled || loading;

    const resolveStyles = () => {
      if (colorType === "neutral" || colorType === "secondary") {
        switch (appearance) {
          case "outline":
            return {
              bg: "transparent",
              border: "$borderColor",
              borderWidth: 1,
              text: "$color",
              spinnerText: theme.color?.get() || "#fff",
            };
          case "ghost":
            return {
              bg: "transparent",
              border: "transparent",
              borderWidth: 0,
              text: "$color",
              spinnerText: theme.color?.get() || "#fff",
            };
          case "solid":
          default:
            return {
              bg: noBg ? "transparent" : "$backgroundPaper",
              border: bordered ? "$borderColor" : "transparent",
              borderWidth: bordered ? 1 : 0,
              text: "$color",
              spinnerText: theme.color?.get() || "#fff",
            };
        }
      }

      // ۲. دکمه‌های رنگی اصلی (Primary, Error, Success, ...)
      const mainToken = `$${colorType}Main` as any;

      switch (appearance) {
        case "outline":
          return {
            bg: "transparent",
            border: mainToken,
            borderWidth: 1,
            text: mainToken,
            spinnerText: theme[`${colorType}Main`]?.get() || "#fff",
          };
        case "ghost":
          return {
            bg: "transparent",
            border: "transparent",
            borderWidth: 0,
            text: mainToken,
            spinnerText: theme[`${colorType}Main`]?.get() || "#fff",
          };
        case "solid":
        default:
          return {
            bg: noBg ? "transparent" : mainToken,
            border: bordered ? "$borderColor" : mainToken,
            borderWidth: bordered ? 1 : 0,
            text: "white",
            spinnerText: "white",
          };
      }
    };

    const computed = resolveStyles();

    return (
      <StyledButton
        ref={ref}
        disabled={isDisabled}
        width={fullWidth ? "100%" : undefined}
        opacity={isDisabled ? 0.6 : 1}
        backgroundColor={computed.bg}
        borderColor={computed.border}
        borderWidth={computed.borderWidth}
        icon={
          loading ? <Spinner color={computed.spinnerText} size="small" /> : icon
        }
        {...rest}
      >
        {typeof children === "string" ? (
          <Text color={computed.text as any} fontSize="$3" fontWeight="600">
            {children}
          </Text>
        ) : (
          children
        )}
      </StyledButton>
    );
  },
);

BaseButton.displayName = "BaseButton";

export default BaseButton;
