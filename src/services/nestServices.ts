import { chatApi } from "./api";

export const uploadToNestJS = async (
  videoFile: any,
  imageCover: any,
  attachmentId: string | number,
  attachmentType: string = "mo",
  attachmentName: string = "movies",
) => {
  const formData = new FormData();

  formData.append("video", {
    uri: videoFile.uri,
    name: videoFile.name ?? "video.mp4",
    type: videoFile.type ?? "video/mp4",
  } as any);

  formData.append("imageCover", {
    uri: imageCover.uri,
    name: imageCover.name ?? "cover.jpg",
    type: imageCover.type ?? "image/jpeg",
  } as any);

  formData.append("attachmentId", String(attachmentId));
  formData.append("attachmentType", attachmentType);
  formData.append("attachmentName", attachmentName);

  return await chatApi.post(`/api/file/uploadVideo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
      );
      console.log(`آپلود: ${percent}%`);
    },
  });
};

export const uploadVideo = async (postData: any) => {
  return await chatApi.post(`/api/file/uploadVideo`, postData);
};

export const allUserMessagese = async (userIdLogin: number) => {
  return await chatApi.get(`/chat/allUserMessagese`, {
    params: { userIdLogin },
  });
};

export const createStatus = async (postData: any) => {
  return await chatApi.post(`/api/status/createStatus`, postData);
};

export const getStatus = async () => {
  return await chatApi.get(`/api/status/getStatus`);
};

export const allStore = async () => {
  return await chatApi.get(`/api/store/allStore`);
};

export const userMessages = async (
  userIdLogin: number,
  userIdSender: number,
  skip: number,
  take: number,
): Promise<any> => {
  try {
    const response = await chatApi.get(`/chat/userMessages`, {
      params: {
        userIdLogin,
        userIdSender,
        skip,
        take,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch user messages",
    );
  }
};
