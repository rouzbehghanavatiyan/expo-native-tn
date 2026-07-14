import React from "react";
import EmojiPicker from "rn-emoji-keyboard";

interface PropsType {
  onEmojiSelect: (emoji: any) => void;
  showStickers: boolean;
  setShowStickers: React.Dispatch<React.SetStateAction<boolean>>;
}

const StickerOverlay: React.FC<PropsType> = ({
  onEmojiSelect,
  showStickers,
  setShowStickers,
}) => {
  return (
    <EmojiPicker
      open={showStickers}
      onClose={() => setShowStickers(false)}
      onEmojiSelected={(emojiObject) => {
        // آبجکت ایموجی به تابع شما پاس داده می‌شود
        // معمولاً در این کتابخانه، خود ایموجی در ویژگی emojiObject.emoji قرار دارد
        if (onEmojiSelect) {
          onEmojiSelect(emojiObject);
        }
      }}
      // تنظیمات ظاهری (اختیاری)
      theme={{
        backdrop: "#00000050", // همان bg-opacity-50 شما در وب
      }}
    />
  );
};

export default StickerOverlay;
