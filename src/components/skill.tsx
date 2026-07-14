import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "tamagui";
import { subCategoryList } from "../services/masterServices";
import asyncWrapper from "../utils/asyncWrapper";
import { Icon } from "./Icon";
import MainTitle from "./MainTitle";
import SoftLink from "./SoftLink";

const Skill: React.FC<any> = ({
  setAllSubCategory,
  allSubCategory,
  currentStep,
  updateStepData,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const router = useRouter();
  const handleGetCategory = asyncWrapper(async () => {
    setIsLoading(true);
    const res = await subCategoryList(currentStep?.arena?.id);
    setIsLoading(false);

    const { data, status } = res?.data || {};
    if (status === 0) {
      setAllSubCategory(data || []);
    }
  });

  const handleAcceptCategory = async (data: any) => {
    updateStepData(2, {
      name: data.name,
      id: data.id,
      icon: data.icon,
    });

    await AsyncStorage.setItem("skillId", String(data.id));
    await AsyncStorage.setItem("skillIconName", data.icon);
    await AsyncStorage.setItem("skillName", data.name);
  };

  useEffect(() => {
    handleGetCategory();
  }, []);

  const categoriesWithIcons = allSubCategory?.map((category: any) => ({
    ...category,
    icon: category.icon || category.name.toLowerCase(),
  }));

  const arenaIconMap = allSubCategory?.reduce((acc: any, category: any) => {
    if (category.icon) {
      acc[category.name.toLowerCase()] = (
        <Icon
          name={category.icon}
          style={{ fontSize: 25, marginHorizontal: 12 }}
        />
      );
    }
    return acc;
  }, {});

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };
  return (
    <View borderRadius="$2">
      <MainTitle handleBack={handleBack} title="Skill" />
      <SoftLink
        iconMap={arenaIconMap}
        handleAcceptCategory={handleAcceptCategory}
        categories={categoriesWithIcons || []}
        isLoading={isLoading}
      />
    </View>
  );
};

export default Skill;
