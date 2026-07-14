import React, { useId } from "react";
import {
  Input,
  InputProps,
  Label,
  styled,
  View,
  XStack,
  YStack,
} from "tamagui";

type InputVariant = "outline" | "filled" | "unstyled";
type ColorType = "primary" | "secondary" | "success" | "warning" | "error";

export interface BaseInputProps extends InputProps {
  variant?: InputVariant;
  colorType?: ColorType;
  hasError?: boolean;
}

const StyledInput: any = styled(Input, {
  name: "BaseInput",
  borderRadius: "$3",
  borderWidth: 1,
  paddingHorizontal: "$3",
  height: 42,
  focusStyle: {
    outlineWidth: 0,
  },

  variants: {
    variant: {
      outline: {
        backgroundColor: "$backgroundDefault",
        borderColor: "$grey900",
      },
      filled: {
        backgroundColor: "$backgroundHover",
        borderColor: "transparent",
      },
      unstyled: {
        backgroundColor: "transparent",
        borderWidth: 0,
        paddingHorizontal: 0,
      },
    },
    disabledState: {
      true: {
        opacity: 0.6,
        pointerEvents: "none",
      },
      false: {
        opacity: 1,
      },
    },
  } as const,

  defaultVariants: {
    variant: "outline",
    disabledState: false,
  },
});

const colorMap: Record<ColorType, string> = {
  primary: "$primaryMain",
  secondary: "$secondaryMain",
  success: "$successMain",
  warning: "$warningMain",
  error: "$errorMain",
};

export interface BaseInputProps extends InputProps {
  variant?: InputVariant;
  colorType?: ColorType;
  hasError?: boolean;
  errorMessage?: any;
  rightIcon?: React.ReactNode;
  label?: string; // ✅ اضافه شد
  helperText?: string; // ✅ اضافه شد (برای نمایش ارور یا توضیحات)
}

const BaseInput = React.forwardRef<any, BaseInputProps>(
  (
    {
      errorMessage,
      rightIcon,
      variant = "outline",
      colorType = "primary", // پیش‌فرض را primary بگذارید
      disabled,
      label, // دریافت لیبل
      helperText, // دریافت ارور یا هلپر
      ...props
    },
    ref,
  ) => {
    const inputId = useId();
    const hasError = !!errorMessage; // محاسبه خطا

    // انتخاب رنگ بر اساس خطا
    const mainColor = colorMap[colorType];
    const borderColor = hasError ? "$errorMain" : mainColor;

    const dynamicStyles =
      variant === "unstyled"
        ? {}
        : {
            borderColor,
            focusStyle: { borderColor },
          };

    return (
      <YStack gap="$2" width="100%">
        {label && (
          <Label
            htmlFor={inputId}
            fontSize="$1"
            fontWeight="600"
            color="$textPrimary"
          >
            {label}
          </Label>
        )}

        <XStack position="relative" alignItems="center" width="100%">
          <StyledInput
            id={inputId}
            ref={ref}
            variant={variant}
            disabledState={Boolean(disabled)}
            disabled={disabled}
            borderColor={borderColor}
            focusStyle={{ borderColor }}
            paddingRight={rightIcon ? "$10" : "$3"}
            width="100%"
            {...props}
          />

          {rightIcon && (
            <View position="absolute" right="$3" zIndex={10}>
              {rightIcon}
            </View>
          )}
        </XStack>
      </YStack>
    );
  },
);

BaseInput.displayName = "BaseInput";

export default BaseInput;
