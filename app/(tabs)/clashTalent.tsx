import Arena from "@/src/components/Arena";
import Gear from "@/src/components/Gear";
import { Icon } from "@/src/components/Icon";
import Skill from "@/src/components/skill";
import {
  subCategoryList,
  subSubCategoryList,
} from "@/src/services/masterServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const initialSteps = [
  { title: "", icon: "", session: "Arena" },
  { title: "", icon: "", session: "Skill" },
  { title: "", icon: "", session: "Gear" },
];

const initialCurrentStep = {
  number: 1,
  arena: null,
  skill: null,
  gear: null,
};

const STEP_LABELS = ["Arena", "Skill", "Gear"];

const Sot: React.FC = () => {
  const [stepsData, setStepsData] = useState(initialSteps);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [allSubCategory, setAllSubCategory] = useState<any>();
  const [currentStep, setCurrentStep] = useState(initialCurrentStep);

  useEffect(() => {
    AsyncStorage.getItem("rememberMe").then((val) => {
      setRememberMe(val === "true");
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("rememberMe", String(rememberMe));
  }, [rememberMe]);

  // const updateStepData = (stepNumber: number, data: any) => {
  //   const updatedSteps: any = stepsData?.map((step, index) =>
  //     index === stepNumber - 1 ? { title: data.name, icon: data.icon } : step,
  //   );
  //   setStepsData(updatedSteps);

  //   setCurrentStep((prev) => ({
  //     ...prev,
  //     [stepNumber === 1
  //       ? "arena"
  //       : stepNumber === 2
  //         ? "skill"
  //         : stepNumber === 3
  //           ? "gear"
  //           : ""]: data,
  //     number: stepNumber + 1,
  //   }));
  // };
  const updateStepData = async (stepNumber: number, data: any) => {
    const updatedSteps: any = stepsData?.map((step, index) =>
      index === stepNumber - 1 ? { title: data.name, icon: data.icon } : step,
    );

    setStepsData(updatedSteps);

    // ذخیره در استوریج فقط اگر remember روشن باشد
    if (rememberMe) {
      try {
        if (stepNumber === 1) {
          await AsyncStorage.multiSet([
            ["arenaId", String(data.id)],
            ["arenaName", data.name || ""],
            ["arenaIconName", data.icon || ""],
          ]);
        }

        if (stepNumber === 2) {
          await AsyncStorage.multiSet([
            ["skillId", String(data.subCategoryId || data.id)],
            ["skillName", data.name || ""],
            ["skillIconName", data.icon || ""],
          ]);
        }

        if (stepNumber === 3) {
          await AsyncStorage.multiSet([
            ["gearId", String(data.id)],
            ["gearName", data.name || ""],
            ["gearIconName", data.icon || ""],
          ]);
        }
      } catch (error) {
        console.log("Storage save error:", error);
      }
    }

    setCurrentStep((prev) => ({
      ...prev,
      [stepNumber === 1
        ? "arena"
        : stepNumber === 2
          ? "skill"
          : stepNumber === 3
            ? "gear"
            : ""]: data,
      number: stepNumber + 1,
    }));
  };

  const resetSot = () => {
    setStepsData(initialSteps);
    setCurrentStep(initialCurrentStep);
    setAllSubCategory([]);
  };

  const renderCurrentStep = () => {
    switch (currentStep.number) {
      case 1:
        return (
          <Arena
            allSubCategory={allSubCategory}
            setAllSubCategory={setAllSubCategory}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            updateStepData={updateStepData}
          />
        );
      case 2:
        return (
          <Skill
            allSubCategory={allSubCategory}
            setAllSubCategory={setAllSubCategory}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            updateStepData={updateStepData}
          />
        );
      case 3:
      default:
        return (
          <Gear
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            updateStepData={updateStepData}
          />
        );
    }
  };

  const checkChoiceSot = async () => {
    if (!rememberMe) {
      await AsyncStorage.multiRemove([
        "arenaId",
        "skillId",
        "gearId",
        "arenaIconName",
        "skillIconName",
        "gearIconName",
        "arenaName",
        "skillName",
        "gearName",
      ]);
      resetSot();
      return;
    }

    try {
      const arenaId = await AsyncStorage.getItem("arenaId");
      const skillId = await AsyncStorage.getItem("skillId");
      const arenaIconName = await AsyncStorage.getItem("arenaIconName");
      const skillIconName = await AsyncStorage.getItem("skillIconName");
      const arenaName = await AsyncStorage.getItem("arenaName");
      const skillName = await AsyncStorage.getItem("skillName");

      if (arenaId) {
        const res = await subCategoryList(arenaId);
        const { data, status } = res?.data;
        if (status === 0) {
          setAllSubCategory(data || []);
          setCurrentStep((prev: any) => ({
            ...prev,
            number: 2,
            arena: (data || []).find(
              (item: any) => item.id === parseInt(arenaId),
            ),
          }));
          setStepsData((prev: any) => [
            { title: arenaName, icon: arenaIconName },
            prev[1],
            prev[2],
          ]);
        }
      }

      if (arenaId && skillId) {
        const res = await subSubCategoryList(skillId);
        const { data, status } = res?.data;
        if (status === 0) {
          setAllSubCategory(data || []);
          setCurrentStep((prev: any) => ({
            ...prev,
            number: 3,
            skill: (data || []).find(
              (item: any) => item.subCategoryId === parseInt(skillId),
            ),
          }));
          setStepsData((prev: any) => [
            prev[0],
            { title: skillName, icon: skillIconName },
            prev[2],
          ]);
        }
      }
    } catch (error) {
      console.error("server error:", error);
    }
  };

  useEffect(() => {
    checkChoiceSot();
  }, []);

  const handleRememberMeChange = (val: boolean) => {
    setRememberMe(val);
    if (!val) resetSot();
  };

  return (
    <View style={styles.container}>
      <View style={styles.rememberRow}>
        <Switch
          value={rememberMe}
          onValueChange={handleRememberMeChange}
          trackColor={{ false: "#d1d5db", true: "#2563eb" }}
          thumbColor="#ffffff"
        />
        <Text style={styles.rememberLabel}>Remember talent</Text>
      </View>

      <View style={styles.stepsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stepsRow}
        >
          {stepsData.map((step, index) => (
            <TouchableOpacity
              key={index}
              style={styles.stepItem}
              onPress={() =>
                setCurrentStep({ ...currentStep, number: index + 1 })
              }
            >
              <View
                style={[
                  styles.stepCircle,
                  index < currentStep.number
                    ? styles.stepCircleActive
                    : styles.stepCircleInactive,
                ]}
              >
                <Icon name={step?.icon} size={20} color="white" />
                {step?.title ? (
                  <Text style={styles.stepTitle} numberOfLines={1}>
                    {step.title}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.stepLabel}>{STEP_LABELS[index]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.content}>{renderCurrentStep()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  rememberLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  stepsSection: {
    marginTop: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  stepsRow: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },
  stepItem: {
    alignItems: "center",
  },
  stepCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  stepCircleActive: {
    backgroundColor: "#22c55e", // bg-green معادل
  },
  stepCircleInactive: {
    backgroundColor: "#e5e7eb", // bg-gray-200
  },
  stepTitle: {
    color: "white",
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  stepLabel: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
});

export default Sot;
