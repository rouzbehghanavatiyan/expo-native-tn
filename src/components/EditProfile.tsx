import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
  Button,
  Input,
  ScrollView,
  Text,
  TextArea,
  XStack,
  YStack,
} from "tamagui";

interface PropTypes {
  setShowEditProfile: (value: boolean) => void;
}

const EditProfile: React.FC<PropTypes> = ({ setShowEditProfile }) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("GGG");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack gap="$4" pb="$5">
          <YStack gap="$2">
            <Text fontSize="$3" color="$textSecondary" fontWeight="600">
              Username
            </Text>
            <Input
              size="$4"
              borderRadius="$3"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              bg="$backgroundDefault"
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" color="$textSecondary" fontWeight="600">
              Bio
            </Text>
            <Input
              size="$4"
              borderRadius="$3"
              value={bio}
              onChangeText={setBio}
              placeholder="Enter bio"
              bg="$backgroundDefault"
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" color="$textSecondary" fontWeight="600">
              Location
            </Text>
            <Input
              size="$4"
              borderRadius="$3"
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location"
              bg="$backgroundDefault"
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" color="$textSecondary" fontWeight="600">
              Description
            </Text>
            <TextArea
              size="$4"
              borderRadius="$3"
              minHeight={100}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              bg="$backgroundDefault"
            />
          </YStack>
        </YStack>
      </ScrollView>

      {/* دکمه‌های پایین */}
      <XStack gap="$3" w="100%" pt="$4" mt="auto">
        <Button
          f={1}
          bg="$successMain"
          backgroundColor="white"
          borderRadius={999}
          onPress={() => {
            // منطق Accept
            setShowEditProfile(false);
          }}
        >
          Accept
        </Button>
        <Button
          f={1}
          bg="transparent"
          borderWidth={1}
          borderColor="$divider"
          backgroundColor="$textPrimary"
          borderRadius={999}
          onPress={() => setShowEditProfile(false)}
        >
          Close
        </Button>
      </XStack>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
