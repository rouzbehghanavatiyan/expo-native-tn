import React, { FC } from "react";
import { ScrollView, Spinner, Text, View, XStack } from "tamagui";
import { Icon } from "./Icon";

export interface CategoryItem {
  id: number | string;
  name: string;
  label?: string;
  icon?: string;
  renderRight?: () => React.ReactNode;
}

interface SoftLinkProps {
  categories?: CategoryItem[];
  handleAcceptCategory?: (category: CategoryItem) => void;
  isLoading?: boolean;
}

const SoftLink: FC<SoftLinkProps> = ({
  categories = [],
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
        {categories.map((category) => (
          <View
            key={category.id}
            onPress={() =>
              !category.renderRight && handleAcceptCategory(category)
            }
            pressStyle={
              !category.renderRight
                ? { opacity: 0.5, backgroundColor: "$backgroundHover" }
                : undefined
            }
            borderRadius="$3"
            cursor={category.renderRight ? "default" : "pointer"}
          >
            <XStack
              alignItems="center"
              justifyContent="space-between"
              py="$2"
              px="$2"
            >
              {/* بخش آیکون و عنوان سمت چپ */}
              <XStack alignItems="center" justifyContent="flex-start">
                <View
                  minWidth={32}
                  mx="$2"
                  justifyContent="center"
                  alignItems="center"
                >
                  {category.icon && <Icon name={category.icon} size={25} />}
                </View>
                <Text color="$textSecondary" fontSize="$4">
                  {category.label || category.name}
                </Text>
              </XStack>

              {/* المان سمت راست (مثل Switch یا کنترل‌های اختصاصی) */}
              {category.renderRight && category.renderRight()}
            </XStack>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default SoftLink;
