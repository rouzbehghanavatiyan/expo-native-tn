import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "tamagui";
import { useModeHandler } from "../hook/useModeHandler";
import { useVideoHandler } from "../hook/useVideoHandler";
import EditVideo from "./EditVideo";
import { Icon } from "./Icon";
import MainTitle from "./MainTitle";
import SoftLink from "./SoftLink";

interface ModeProps {
  updateStepData: (step: number, data: any) => void;
  setCurrentStep: (step: any) => void;
  currentStep: any;
}

const Mode: React.FC<ModeProps> = ({
  updateStepData,
  setCurrentStep,
  currentStep,
}) => {
  const navigation = useNavigation<any>();
  const {
    coverImage,
    showEditMovie,
    allFormData,
    setShowEditMovie,
    triggerVideoUpload,
    videoError,
  } = useVideoHandler();

  const { mode, allMode, isLoading, setMode, handleCategoryClick } =
    useModeHandler();

  const handleModeSelection = async (data: any) => {
    const arenaIdStr = await AsyncStorage.getItem("arenaId");
    const arenaId = Number(arenaIdStr);
    if (
      (data.id === 3 && arenaId !== 1002) ||
      (data.id === 4 && arenaId !== 1002)
    ) {
      setMode({ show: true, typeMode: data.id });
      triggerVideoUpload();
    }
    if (arenaId === 1002) {
      navigation.navigate("Cup");
    }
    handleCategoryClick(data, updateStepData, setCurrentStep);
  };

  const categoriesWithIcons = allMode?.map((modeItem: any) => ({
    ...modeItem,
    icon: modeItem.icon || modeItem.name.toLowerCase(),
  }));

  const arenaIconMap = allMode?.reduce((acc: any, category: any) => {
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

  console.log(showEditMovie);

  return (
    <View bg="white">
      <MainTitle title="Mode" />
      <SoftLink
        iconMap={arenaIconMap}
        categories={categoriesWithIcons || []}
        isLoading={isLoading}
        handleAcceptCategory={handleModeSelection}
      />
      {showEditMovie && (
        <EditVideo
          mode={mode}
          allFormData={allFormData}
          showEditMovie={showEditMovie}
          setShowEditMovie={setShowEditMovie}
          coverImage={coverImage}
        />
      )}
    </View>
  );
};

export default Mode;
