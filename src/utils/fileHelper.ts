// const BASE_URL = process.env.EXPO_PUBLIC_VITE_SERVERPROFILE;
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const getImageUrl = (attachment: any) => {
  if (!attachment) return null;

  return `${BASE_URL}/${attachment.attachmentType}/${attachment.fileName}${attachment.ext}`;
};

export const fixNumberCount = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "0";

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return "0";

  return numberValue.toLocaleString("en-US");
};

export const mergeUniqueMessages = (items: any[]) => {
  const map = new Map<string, any>();

  for (const item of items) {
    const key =
      item.id != null
        ? `id-${item.id}`
        : item.tempId
          ? `temp-${item.tempId}`
          : "";
    if (!key) continue;
    map.set(key, item);
  }

  return Array.from(map.values());
};
