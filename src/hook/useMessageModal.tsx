import { useState } from "react";

export const useMessageModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<any>({
    message: "",
    title: "Alert",
  });

  const show = (message: string, title?: string, onAccept?: () => void) => {
    setOptions({
      message,
      title: title || "Alert",
      onAccept,
    });
    setIsOpen(true);
  };

  return { isOpen, setIsOpen, options, show };
};
