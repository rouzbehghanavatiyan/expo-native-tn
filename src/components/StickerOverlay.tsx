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
      onEmojiSelected={(emojiObject) => onEmojiSelect?.(emojiObject)}
      enableRecentlyUsed
      theme={{
        backdrop: "#00000050",
        container: "#ffffff",
      }}
      styles={{
        container: {
          paddingBottom: 40,
        },
      }}
    />
  );
};

export default StickerOverlay;
