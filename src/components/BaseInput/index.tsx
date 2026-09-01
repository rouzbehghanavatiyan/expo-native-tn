import React, { useEffect, useId, useRef, useState } from "react";
import { Animated } from "react-native";
import { Input, InputProps, styled, Text, View, XStack, YStack } from "tamagui";

type InputVariant = "outline" | "filled" | "unstyled";
type ColorType = "primary" | "secondary" | "success" | "warning" | "error";

export interface BaseInputProps extends Omit<
  InputProps,
  "dangerouslySetInnerHTML"
> {
  variant?: InputVariant;
  colorType?: ColorType;
  hasError?: boolean;
  errorMessage?: string | null;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const colorMap: Record<ColorType, string> = {
  primary: "$primaryMain",
  secondary: "$secondaryMain",
  success: "$successMain",
  warning: "$warningMain",
  error: "$errorMain",
};

const StyledInput = styled(Input, {
  name: "BaseInput",
  borderRadius: "$3",
  borderWidth: 1,
  height: 48,
  color: "$textPrimary",
  focusStyle: { outlineWidth: 0 },

  variants: {
    variant: {
      outline: { backgroundColor: "transparent" },
      filled: {
        backgroundColor: "$backgroundHover",
        borderColor: "transparent",
        focusStyle: { backgroundColor: "$backgroundHover" },
      },
      unstyled: {
        backgroundColor: "transparent",
        borderWidth: 0,
        paddingHorizontal: 0,
        height: "auto",
      },
    },
    disabledState: {
      true: { opacity: 0.6, pointerEvents: "none" },
      false: { opacity: 1 },
    },
  } as const,

  defaultVariants: {
    variant: "outline",
    disabledState: false,
  },
});

const BaseInput = React.forwardRef<any, BaseInputProps>(
  (
    {
      errorMessage,
      helperText,
      label,
      leftIcon,
      rightIcon,
      variant = "outline",
      colorType = "primary",
      disabled,
      hasError,
      value,
      defaultValue,
      onChangeText,
      onFocus,
      onBlur,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const inputId = useId();

    // استیت‌های مربوط به کنترل انیمیشن
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(value || defaultValue || "");

    // همگام‌سازی استیت با value بیرونی (در صورت Controlled بودن فرم)
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    // شرط اینکه لیبل باید بالا برود یا نه
    const isFloating = isFocused || String(inputValue).length > 0;

    // مقدار انیمیشن
    const floatAnim = useRef(new Animated.Value(isFloating ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(floatAnim, {
        toValue: isFloating ? 1 : 0,
        duration: 150, // سرعت انیمیشن مشابه MUI
        useNativeDriver: true, // برای روانی انیمیشن
      }).start();
    }, [isFloating]);

    const translateY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -12], // ۱۴: وسط اینپوت | -۱۲: روی بوردر بالایی
    });

    const scale = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.85], // لیبل هنگام رفتن روی بوردر کمی کوچک می‌شود
    });

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChangeText = (text: string) => {
      setInputValue(text);
      onChangeText?.(text);
    };

    const isError = hasError || !!errorMessage;
    const mainColor = colorMap[colorType];
    const baseBorderColor = isError
      ? "$errorMain"
      : variant === "outline"
        ? "#b4bfcb"
        : "transparent";
    const focusBorderColor = isError ? "$errorMain" : mainColor;

    const labelColor = isError
      ? "$errorMain"
      : isFocused
        ? mainColor
        : "$textSecondary";

    return (
      <YStack gap="$1" width="100%">
        <XStack position="relative" alignItems="center" width="100%">
          {label && (
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: rightIcon ? 42 : 12,
                transform: [{ translateY }, { scale }],
                zIndex: 15,
                paddingHorizontal: 4,
                backgroundColor:
                  isFloating && variant === "outline" ? "gray" : "transparent",
              }}
              pointerEvents="none"
            >
              <Text color={labelColor} fontSize={14}>
                {label}
              </Text>
            </Animated.View>
          )}

          {leftIcon && (
            <View position="absolute" left="$3" zIndex={10}>
              {leftIcon}
            </View>
          )}

          <StyledInput
            id={inputId}
            ref={ref}
            variant={variant}
            disabledState={Boolean(disabled)}
            disabled={disabled}
            width="100%"
            borderColor={baseBorderColor}
            paddingVertical={0}
            justifyContent="center"
            multiline={false}
            focusStyle={{ borderColor: focusBorderColor, borderWidth: 1 }}
            hoverStyle={{ borderColor: isError ? "$errorMain" : "#99a2ac" }}
            paddingLeft={leftIcon ? "$10" : "$4"}
            paddingRight={rightIcon ? "$10" : "$4"}
            // اتصال مقادیر مدیریت شده برای انیمیشن
            value={value}
            defaultValue={defaultValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            // پلیس‌هولدر واقعی را فقط زمانی نشان می‌دهیم که لیبل بالا رفته باشد (مثل MUI)
            placeholder={isFloating ? placeholder : ""}
            {...(props as any)}
          />

          {rightIcon && (
            <View position="absolute" right="$3" zIndex={10}>
              {rightIcon}
            </View>
          )}
        </XStack>

        {(errorMessage || helperText) && (
          <Text
            color={isError ? "$errorMain" : "$textSecondary"}
            fontSize={12}
            paddingHorizontal="$1"
          >
            {errorMessage || helperText}
          </Text>
        )}
      </YStack>
    );
  },
);

BaseInput.displayName = "BaseInput";

export default BaseInput;
