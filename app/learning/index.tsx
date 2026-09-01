import BaseButton from "@/src/components/BaseButtom";
import { useAppSelector } from "@/src/store/reduxHookType";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, XStack, YStack } from "tamagui";
import LearningStepOne from "./LearningStepOne";
import LearningStepTwo from "./LearningStepTwo";

const LearningScreen: React.FC = () => {
  const router = useRouter();
  const main = useAppSelector((state) => state?.main);
  const userIdLogin = main?.userLogin?.user?.id;
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace("/home");
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <LearningStepOne />;
      case 2:
        return <LearningStepTwo />;
      // case 3:
      //   return <LearningStepThree />;
      // case 4:
      //   return <LearningStepFour />;
      // case 5:
      //   return <LearningStepFive />;
      default:
        return <LearningStepOne />;
    }
  };

  const handleSkip = () => {
    router.replace("/home");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <YStack f={1} w="100%" bg="$background">
        <YStack f={1} ai="center" pt="$8">
          {renderCurrentStep()}
        </YStack>

        <YStack ai="center" pb="$5" px="$4" gap="$4">
          <XStack gap="$2">
            {[1, 2, 3, 4, 5].map((step) => (
              <View
                key={step}
                w={12}
                h={12}
                br={100}
                bg={step <= currentStep ? "#10B981" : "$grey400"}
              />
            ))}
          </XStack>

          {/* دکمه‌ها */}
          <XStack gap="$3" w="100%" jc="center">
            <BaseButton onPress={handleSkip}>Skip</BaseButton>

            <BaseButton onPress={handleNext} bg="#10B981">
              {currentStep === 5 ? "Finish" : "Next"}
            </BaseButton>
          </XStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
};

export default LearningScreen;
