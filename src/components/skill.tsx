import React, { useEffect, useState } from "react";
import { View } from "tamagui";
import { subCategoryList } from "../services/masterServices";
import { RsetCategory, setSelectedStep } from "../slices/main";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";
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
  const dispatch = useAppDispatch();
  const main = useAppSelector((state) => state.main);
  const arenaId = currentStep?.arena?.id;

  useEffect(() => {
    const handleGetCategory = asyncWrapper(async () => {
      if (!arenaId) return;

      if (main.categoryCache?.[arenaId]) {
        setAllSubCategory(main.categoryCache[arenaId]);
        return;
      }

      setIsLoading(true);
      const res = await subCategoryList(arenaId);
      setIsLoading(false);

      if (res?.data?.status === 0) {
        const fetchedData = res.data.data || [];
        setAllSubCategory(fetchedData);
        dispatch(RsetCategory({ parentId: arenaId, data: fetchedData }));
      }
    });

    // فراخوانی در صورت وجود arenaId
    if (arenaId) {
      handleGetCategory();
    }
  }, [arenaId, dispatch, main.categoryCache, setAllSubCategory]); // وابستگی‌ها اضافه شدند

  const handleAcceptCategory = async (data: any) => {
    dispatch(setSelectedStep({ step: "skillId", id: data.id }));

    updateStepData(2, {
      name: data.name,
      id: data.id,
      icon: data.icon,
    });
  };

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

  return (
    <View borderRadius="$2">
      <MainTitle title="Skill" />
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
