import React from "react";
import {
    Text as RNText,
    TextProps as RNTextProps,
    StyleProp,
    TextStyle,
} from "react-native";
const PERSIAN_ARABIC_RANGE = [
  [0x0600, 0x06ff],
  [0x0750, 0x077f],
  [0xfb50, 0xfdff],
  [0xfe70, 0xfeff],
];

// لاتین پایه + لاتین گسترش‌یافته (اروپایی، ویتنامی و ...) + علائم نگارشی رایج
// Vazirmatn این بازه‌ها را هم پوشش می‌دهد، پس همان فونت اپ استفاده می‌شود
const LATIN_RANGE = [
  [0x0000, 0x024f], // ASCII + Latin-1 Supplement + Latin Extended A/B
  [0x1e00, 0x1eff], // Latin Extended Additional (ویتنامی و ...)
  [0x2000, 0x206f], // علائم نگارشی عمومی (–, ", ' و ...)
];

function inRanges(code: number, ranges: number[][]): boolean {
  return ranges.some(([start, end]) => code >= start && code <= end);
}

/** فونت مناسب برای یک کاراکتر را برمی‌گرداند؛ undefined یعنی «فونت پیش‌فرض سیستم» */
function getFontForCodePoint(code: number): string | undefined {
  if (inRanges(code, PERSIAN_ARABIC_RANGE)) return "Vazirmatn";
  if (inRanges(code, LATIN_RANGE)) return "Vazirmatn";
  // سیریلیک، چینی/ژاپنی/کره‌ای، تایلندی، دواناگری، عبری، ایموجی و بقیه‌ی زبان‌ها
  return undefined;
}

// کاراکترهای خنثی (فاصله، اعداد، علائم رایج) را به بخش قبلی می‌چسبانیم
// تا بی‌خودی متن به تکه‌های ریز و بی‌مورد تقسیم نشود
const NEUTRAL_REGEX = /[\s\d.,!?;:'"()\-_/@#]/;

interface Segment {
  text: string;
  fontFamily?: string;
}

function splitByScript(text: string): Segment[] {
  if (!text) return [];

  const segments: Segment[] = [];
  let current = "";
  let currentFont: string | undefined;
  let currentFontSet = false;

  for (const ch of Array.from(text)) {
    const code = ch.codePointAt(0) ?? 0;
    const isNeutral = NEUTRAL_REGEX.test(ch);
    const font = isNeutral ? currentFont : getFontForCodePoint(code);

    if (!currentFontSet) {
      currentFont = font;
      currentFontSet = true;
    }

    if (font === currentFont || isNeutral) {
      current += ch;
    } else {
      segments.push({ text: current, fontFamily: currentFont });
      current = ch;
      currentFont = font;
    }
  }

  if (current) segments.push({ text: current, fontFamily: currentFont });

  return segments;
}

interface SmartTextProps extends Omit<RNTextProps, "children"> {
  children?: string | null;
  style?: StyleProp<TextStyle>;
}

export function SmartText({ children, style, ...rest }: SmartTextProps) {
  const text = typeof children === "string" ? children : "";
  const segments = splitByScript(text);

  return (
    <RNText style={style} {...rest}>
      {segments.map((seg, idx) => (
        <RNText key={idx} style={{ fontFamily: seg.fontFamily }}>
          {seg.text}
        </RNText>
      ))}
    </RNText>
  );
}

export default SmartText;
