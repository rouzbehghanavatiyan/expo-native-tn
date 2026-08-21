import { useAppSelector } from "@/src/store/reduxHookType";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const LearningScreen: React.FC = () => {
  const router = useRouter();
  const main = useAppSelector((state) => state?.main);
  const userIdLogin = main?.userLogin?.user?.id; // اکنون به صورت string (GUID) است

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {}, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      Helllllo Learning
    </SafeAreaView>
  );
};

export default LearningScreen;
