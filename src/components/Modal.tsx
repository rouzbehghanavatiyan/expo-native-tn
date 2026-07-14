import { createContext, useContext, useState } from "react";
import { AlertDialog, Button, Text, XStack, YStack } from "tamagui";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmDialogProvider({ children }: any) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<any>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolver?.(true);
    setOpen(false);
  };

  const handleCancel = () => {
    resolver?.(false);
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialog.Overlay
          opacity={0.45}
          bg="black"
          {...({ animation: "quick" } as any)}
          justifyContent="center"
          alignItems="center"
        />
        <AlertDialog.Content
          bordered
          elevate
          {...({ animation: "quick" } as any)}
          width="85%"
          maxWidth={360}
          bg="$backgroundPaper"
          borderRadius="$4"
          p="$5"
          alignSelf="center"
          marginVertical="auto"
        >
          <YStack gap="$4">
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="700">
                {options.title ?? "Confirm"}
              </Text>

              <Text fontSize="$2" color="$textSecondary">
                {options.description ?? ""}
              </Text>
            </YStack>

            <XStack jc="flex-end" gap="$3">
              <Button onPress={handleCancel}>
                {options.cancelText ?? "Cancel"}
              </Button>

              <Button
                bg="$errorMain"
                variant="outlined"
                onPress={handleConfirm}
              >
                {options.confirmText ?? "Confirm"}
              </Button>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);

  if (!ctx) {
    throw new Error("useConfirm must be used inside ConfirmDialogProvider");
  }

  return ctx.confirm;
};
