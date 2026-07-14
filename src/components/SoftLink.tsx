import React, { FC } from "react";
import { ScrollView, Spinner, Text, View, XStack } from "tamagui";
import { Icon } from "./Icon";

interface SoftLinkProps {
  categories?: any[];
  handleAcceptCategory?: (category: any) => void;
  isLoading?: boolean;
}

const SoftLink: FC<SoftLinkProps> = ({
  categories = [],
  handleBack,
  handleAcceptCategory = () => {},
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View flex={1} p="$4" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$primaryMain" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, minHeight: "76%" }}
      showsVerticalScrollIndicator={false}
    >
      <View w="100%" maxWidth={500} alignSelf="center" py="$2">
        {categories.map((category: any) => (
          <View
            key={category.id}
            onPress={() => handleAcceptCategory(category)}
            pressStyle={{ opacity: 0.5, backgroundColor: "$backgroundHover" }}
            borderRadius="$3"
            cursor="pointer"
          >
            <XStack alignItems="center" justifyContent="flex-start">
              <View
                minWidth={32}
                mx="$3"
                justifyContent="center"
                alignItems="center"
              >
                {category.icon && <Icon name={category.icon} size={25} />}
              </View>
              <Text py="$2" color="$textSecondary" fontSize="$4">
                {category.label || category.name}
              </Text>
            </XStack>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default SoftLink;
