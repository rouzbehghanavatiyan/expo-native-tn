import { Theme, ToastProvider, ToastViewport } from "tamagui";

export const AppToastProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ToastProvider swipeDirection="horizontal">
      {children}

      <Theme name="light">
        <ToastViewport
          flexDirection="column"
          top="$8"
          left={0}
          right={0}
          zIndex={100000}
        />
      </Theme>
    </ToastProvider>
  );
};
