import React, { useState } from "react";
import { Image } from "react-native";
import { Text, TextArea, View, XStack } from "tamagui";
import { useAppSelector } from "../store/reduxHookType";
import BaseButton from "./BaseButtom";
import BaseInput from "./BaseInput";
import { ButtonTimer } from "./ui/ButtonTimer";

export const CoverConfirmStep: React.FC<any> = ({
  coverImage,
  onBack,
  onAccept,
  isLoading,
}) => {
  const showTimerButtn = useAppSelector((state) => state.main.showTimerButtn);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // const handleAccept = () => {
  //   onAccept({
  //     title,
  //     description,
  //   });
  // };

  return (
    <View p="$5">
      {!!coverImage && (
        <View mb="$4">
          <Text fontWeight="bold" mb="$2" color="$textPrimary">
            Your cover:
          </Text>

          <Image
            source={{ uri: coverImage }}
            alt="Video Cover"
            style={{
              width: "100%",
              maxWidth: 400,
              height: 300,
              resizeMode: "contain",
              backgroundColor: "black",
              alignSelf: "center",
            }}
          />
        </View>
      )}

      <View gap="$3" mb="$4">
        <View>
          <Text mb="$1" color="$white">
            Title
          </Text>
          <BaseInput
            placeholder="Video title..."
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View>
          <Text mb="$1" color="$white">
            Description
          </Text>
          <TextArea
            placeholder="Write something about your video..."
            value={description}
            onChangeText={setDescription}
            minHeight={100}
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            p="$3"
            color="$textPrimary"
            backgroundColor="$background"
          />
        </View>
      </View>

      <XStack
        mt="$4"
        justifyContent="space-between"
        alignItems="center"
        gap="$3"
      >
        <BaseButton
          flex={1}
          size="$3"
          bg="transparent"
          chromeless
          onPress={onBack}
        >
          Back
        </BaseButton>
        <BaseButton
          flex={1}
          bg="$greenMain"
          loading={isLoading}
          onPress={onAccept}
        >
          {showTimerButtn ? (
            <ButtonTimer show={showTimerButtn} startTime={120} />
          ) : (
            "Start"
          )}
        </BaseButton>
      </XStack>
    </View>
  );
};
