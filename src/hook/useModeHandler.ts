// useModeHandler.ts
import { useEffect, useState } from "react";
import { modeList } from "../services/masterServices";
import asyncWrapper from "../utils/asyncWrapper";

interface Mode {
  show: boolean;
  typeMode: number;
}

interface UseModeHandlerReturn {
  mode: Mode;
  allMode: any[];
  isLoading: boolean;
  setMode: (mode: Mode) => void;
  handleCategoryClick: (
    data: any,
    updateStepData: any,
    setCurrentStep: any,
  ) => void;
}

export const useModeHandler = (): UseModeHandlerReturn => {
  const [mode, setMode] = useState<Mode>({ show: false, typeMode: 0 });
  const [allMode, setAllMode] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCategoryClick = (
    data: any,
    updateStepData: any,
    setCurrentStep: any,
  ) => {
    if (data.id === 3 || data.id === 4) {
      setMode({ show: true, typeMode: data.id });
      updateStepData(4, {
        name: data.name,
        id: data.id,
        icon: data.icon,
      });
    } else {
      updateStepData(4, {
        name: data.name,
        id: data.id,
        icon: data.icon,
      });
      setCurrentStep((prev: any) => ({ ...prev, number: 5 }));
    }
  };

  const fetchModes = asyncWrapper(async () => {
    setIsLoading(true);
    try {
      const res = await modeList();
      const { data, status } = res?.data;
      if (status === 0) {
        setAllMode(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    fetchModes();
  }, []);

  return {
    mode,
    allMode,
    isLoading,
    setMode,
    handleCategoryClick,
  };
};
