import { getThemeColor } from "@/src/hook/getThemeColor";
import React, { useEffect, useId, useRef, useState } from "react";
import { Animated } from "react-native";
import {
  Input,
  InputProps,
  styled,
  Text,
  useTheme,
  View,
  XStack,
  YStack,
} from "tamagui";

type InputVariant = "outline" | "filled" | "unstyled";
type ColorType = "primary" | "secondary" | "success" | "warning" | "error";

export interface BaseInputProps extends Omit<
  InputProps,
  "dangerouslySetInnerHTML"
> {
  baseColorLabel?: string;
  variant?: InputVariant;
  colorType?: ColorType;
  hasError?: boolean;
  errorMessage?: string | null;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  placeholderFontSize?: number;
  placeholderTextColor?: string;
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
  borderRadius: "$2",
  borderWidth: 1,
  height: 48,
  color: "$textPrimary",
  focusStyle: { outlineWidth: 0 },

  variants: {
    variant: {
      outline: {
        backgroundColor: "transparent",
      },
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
      baseColorLabel,
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
      placeholderTextColor,
      fontSize = 14,
      placeholderFontSize = 13,
      ...props
    },
    ref,
  ) => {
    const inputId = useId();
    const theme = useTheme();

    // Theme Color Resolutions
    const resolvedLabelBg =
      baseColorLabel ??
      getThemeColor(
        theme.backgroundPaper,
        getThemeColor(theme.background, "#fff"),
      );

    const resolvedPlaceholderColor =
      placeholderTextColor ??
      getThemeColor(
        theme.colorMuted,
        getThemeColor(theme.textSecondary, "#888888"),
      );

    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(value || defaultValue || "");

    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    const isFloating = isFocused || String(inputValue).length > 0;
    const floatAnim = useRef(new Animated.Value(isFloating ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(floatAnim, {
        toValue: isFloating ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }, [isFloating]);

    const translateY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -12],
    });

    const scale = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.85],
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
    const activeColorToken = colorMap[colorType] || "$primaryMain";

    const baseBorderColor = isError
      ? "$errorMain"
      : variant === "outline"
        ? "$borderColor"
        : "transparent";

    const focusBorderColor = isError ? "$errorMain" : activeColorToken;

    const labelColor = isError
      ? "$errorMain"
      : isFocused
        ? activeColorToken
        : "$colorMuted";

    const currentFontSize =
      String(inputValue).length === 0 && Boolean(placeholder)
        ? placeholderFontSize
        : fontSize;

    const visiblePlaceholder = label
      ? isFloating
        ? placeholder
        : ""
      : placeholder;

    return (
      <YStack gap="$1" width="100%">
        <XStack position="relative" alignItems="center" width="100%">
          {label && (
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: rightIcon ? 15 : 12,
                transform: [{ translateY }, { scale }],
                zIndex: 15,
                paddingHorizontal: 6,
                backgroundColor:
                  isFloating && variant === "outline"
                    ? resolvedLabelBg
                    : "transparent",
              }}
              pointerEvents="none"
            >
              <Text color={labelColor} fontSize={13} fontWeight="500">
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
            fontSize={currentFontSize}
            borderColor={isFocused ? focusBorderColor : baseBorderColor}
            paddingVertical={0}
            justifyContent="center"
            multiline={false}
            focusStyle={{ borderColor: focusBorderColor, borderWidth: 1 }}
            hoverStyle={{
              borderColor: isError ? "$errorMain" : "$borderColorFocus",
            }}
            paddingLeft={leftIcon ? "$10" : "$3.5"}
            paddingRight={rightIcon ? "$10" : "$3.5"}
            value={value}
            defaultValue={defaultValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={visiblePlaceholder}
            placeholderTextColor={resolvedPlaceholderColor}
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
