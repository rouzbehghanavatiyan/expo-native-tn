import { useToastController } from "tamagui";

export const useAppToast = () => {
  const toast = useToastController();

  return {
    success: (message: string) =>
      toast.show(message, {
        duration: 3000,
      }),

    error: (message: string) =>
      toast.show(message, {
        duration: 4000,
      }),

    info: (message: string) =>
      toast.show(message, {
        duration: 3000,
      }),
  };
};
