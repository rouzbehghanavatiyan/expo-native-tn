import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "tamagui";
import { useVideoHandler } from "../hook/useVideoHandler";
import { subSubCategoryList } from "../services/masterServices";
import asyncWrapper from "../utils/asyncWrapper";
import { Icon } from "./Icon";
import MainTitle from "./MainTitle";
import SoftLink from "./SoftLink";

const Gear: React.FC<any> = ({
  currentStep,
  setCurrentStep,
  updateStepData,
}) => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allSubSubCategory, setAllSubSubCategory] = useState<any>();
  const [selectedGearMode, setSelectedGearMode] = useState<any>({
    show: false,
    typeMode: null,
  });

  const { triggerVideoUpload } = useVideoHandler();

  const handleGetCategory = asyncWrapper(async () => {
    setIsLoading(true);
    const res = await subSubCategoryList(currentStep?.skill?.id);
    setIsLoading(false);

    const { data, status } = res?.data || {};
    if (status === 0) {
      setAllSubSubCategory(data || []);
    }
  });

  useEffect(() => {
    handleGetCategory();
  }, []);

  const handleAcceptCategory = async (data: any) => {
    const arenaId = currentStep?.arena?.id;

    if (arenaId !== 1002) {
      setSelectedGearMode({ show: true, typeMode: data.id });
      setCurrentStep({ ...currentStep, number: 4 });
      updateStepData(3, { name: data.name, icon: data.icon, id: data.id });
      triggerVideoUpload();
    } else {
      navigation.navigate("Cup");
    }
  };

  const categoriesWithIcons = allSubSubCategory?.map((category: any) => ({
    ...category,
    icon: category.icon || category.name.toLowerCase(),
  }));

  const arenaIconMap = allSubSubCategory?.reduce((acc: any, category: any) => {
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

  return (
    <View>
      <MainTitle showBack title="Gear" />
      <SoftLink
        iconMap={arenaIconMap}
        handleAcceptCategory={handleAcceptCategory}
        categories={categoriesWithIcons || []}
        isLoading={isLoading}
      />
    </View>
  );
};

export default Gear;
