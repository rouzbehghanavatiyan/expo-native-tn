import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppSelector } from "../store/reduxHookType";
import { Icon } from "./Icon";
import MainTitle from "./MainTitle";
import SoftLink from "./SoftLink";

const Arena: React.FC<any> = ({ updateStepData }) => {
  const main = useAppSelector((state) => state?.main);

  const handleAcceptCategory = async (data: any) => {
    updateStepData(1, {
      name: data.name,
      id: data.id,
      icon: data.icon,
    });

    if (data.icon === "robot") {
      return;
    }

    await AsyncStorage.setItem("arenaId", String(data.id));
    await AsyncStorage.setItem("arenaIconName", data.icon);
    await AsyncStorage.setItem("arenaName", data.name);
  };

  const arenaIconMap = main?.category?.reduce((acc: any, category: any) => {
    if (category.icon) {
      acc[category.name.toLowerCase()] = (
        <Icon name={category.icon} size={25} style={styles.icon} />
      );
    }
    return acc;
  }, {});

  const categoriesWithIcons = main?.category?.map((category: any) => ({
    ...category,
    icon: category.icon || category.name.toLowerCase(),
  }));

  return (
    <View style={styles.container}>
      <MainTitle showBack={false} title="Arena" />
      <SoftLink
        iconMap={arenaIconMap}
        handleAcceptCategory={handleAcceptCategory}
        categories={categoriesWithIcons || []}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    borderRadius: 8,
  },
  icon: {
    marginHorizontal: 12, // معادل mx-3
  },
});

export default Arena;
