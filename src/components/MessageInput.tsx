import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput } from "react-native";
import { View, XStack, YStack } from "tamagui";
import StickerOverlay from "./StickerOverlay";

interface MessageInputProps {
  title: string; // همان متن پیام
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  titleInputRef?: React.RefObject<TextInput>;
  setShowStickers: React.Dispatch<React.SetStateAction<boolean>>;
  showStickers: boolean;
  onEmojiSelect?: any;
  onInputFocus?: () => void;
  onAttachClick?: () => void;
  itsComment?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  title,
  setTitle,
  handleSendMessage,
  onEmojiSelect,
  titleInputRef,
  setShowStickers,
  showStickers,
  onInputFocus,
  onAttachClick,
}) => {
  const [inputHeight, setInputHeight] = useState(40);
  const hasText = title.trim().length > 0;

  return (
    <YStack
      bg="$backgroundDefault"
      borderTopWidth={1}
      borderTopColor={"$grey200"}
      borderColor="$colorTransparent"
    >
      <XStack gap="$2" alignItems="flex-end" px="$3" py="$2">
        {/* دکمه افزودن فایل (اختیاری) */}
        <Pressable
          onPress={onAttachClick}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <MaterialIcons name="add" size={26} color="#6b7280" />
        </Pressable>

        {/* کانتینر اصلی اینپوت */}
        <View style={styles.inputContainer} flex={1}>
          <TextInput
            ref={titleInputRef}
            style={[
              styles.input,
              { height: Math.max(40, Math.min(inputHeight, 120)) }, // حداقل 40، حداکثر 120 پیکسل
            ]}
            multiline={true}
            placeholder="Message..."
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            onContentSizeChange={(e) => {
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
            onFocus={() => {
              if (showStickers) setShowStickers(false);
              if (onInputFocus) onInputFocus();
            }}
          />

          {/* دکمه ایموجی داخل اینپوت */}
          <Pressable
            style={styles.emojiButton}
            onPress={() => {
              Keyboard.dismiss();
              setShowStickers(!showStickers);
            }}
          >
            <MaterialIcons
              name={showStickers ? "keyboard" : "mood"}
              size={24}
              color="#6b7280"
            />
          </Pressable>
        </View>

        {/* دکمه ارسال */}
        <Pressable
          onPress={hasText ? handleSendMessage : undefined}
          style={({ pressed }) => [
            styles.sendButton,
            !hasText && styles.sendButtonDisabled,
            pressed && hasText && { opacity: 0.7 },
          ]}
        >
          <MaterialIcons
            name="send"
            size={22}
            color={hasText ? "#ffffff" : "#9ca3af"}
          />
        </Pressable>
      </XStack>

      <StickerOverlay
        showStickers={showStickers}
        setShowStickers={setShowStickers}
        onEmojiSelect={onEmojiSelect}
      />
    </YStack>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    paddingBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f3f4f6", // رنگ پس‌زمینه ملایم برای اینپوت
    borderRadius: 20,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "center", // برای اندروید که متن وسط بماند
  },
  emojiButton: {
    paddingBottom: 8,
    paddingLeft: 5,
  },
  sendButton: {
    backgroundColor: "#2563eb", // رنگ آبی برای دکمه ارسال
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2, // هم‌تراز کردن با اینپوت
  },
  sendButtonDisabled: {
    backgroundColor: "#e5e7eb", // رنگ خاکستری وقتی متنی نیست
  },
});

export default MessageInput;
