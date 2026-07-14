import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "tamagui";
import { useVideoHandler } from "../hook/useVideoHandler";
import { subSubCategoryList } from "../services/masterServices";
import { useAppDispatch } from "../store/reduxHookType";
import asyncWrapper from "../utils/asyncWrapper";
import EditVideo from "./EditVideo";
import { Icon } from "./Icon";
import MainTitle from "./MainTitle";
import SoftLink from "./SoftLink";

const Gear: React.FC<any> = ({
  currentStep,
  setCurrentStep,
  updateStepData,
}) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allSubSubCategory, setAllSubSubCategory] = useState<any>();
  const [selectedGearMode, setSelectedGearMode] = useState<any>({
    show: false,
    typeMode: null,
  });

  const {
    coverImage,
    showEditMovie,
    allFormData,
    setShowEditMovie,
    triggerVideoUpload,
    videoError,
  } = useVideoHandler();

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
    const arenaIdStr = await AsyncStorage.getItem("arenaId");
    const arenaId = Number(arenaIdStr);

    if (arenaId !== 1002) {
      setSelectedGearMode({
        show: true,
        typeMode: data.id,
      });

      setCurrentStep({ ...currentStep, number: 4 });
      updateStepData(3, { name: data.name, icon: data.icon });

      await AsyncStorage.setItem("gearId", String(data.id));
      await AsyncStorage.setItem("gearIconName", data.icon);
      await AsyncStorage.setItem("gearName", data.name);

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

      {showEditMovie && (
        <EditVideo
          mode={selectedGearMode}
          allFormData={allFormData}
          showEditMovie={showEditMovie}
          setShowEditMovie={setShowEditMovie}
          coverImage={coverImage}
        />
      )}
    </View>
  );
};

export default Gear;
