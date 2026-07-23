import { api } from "./api";

export const attachmentList = async (postData: {
  skip: number;
  take: number;
  subCatId?: number;
}) => {
  const response = await api.get("/attachmentList", {
    params: {
      skip: postData?.skip,
      take: postData?.take,
      subCatId: postData?.subCatId,
    },
  });
  return response.data;
};

export const subCategoryList = async (
  categoryId: number | string | null | undefined,
) => {
  return await api.get("/subCategoryList", {
    params: { categoryId },
  });
};

export const categoryList = async () => {
  return await api.get("/categoryList");
};

export const followerList = async (
  userId: number | string | null | undefined,
) => {
  return await api.get(`/followerList?userId=${userId}`);
};

export const profileAttachment = async (
  userId: number | string | null | undefined,
) => {
  return await api.get(`/profileAttachment?userId=${userId}`);
};

export const followingList = async (
  userId: number | string | null | undefined,
) => {
  return await api.get(`/followingList?userId=${userId}`);
};

export const followerAttachmentList = async (postData: any) => {
  return await api.get(
    `/followerAttachmentList?skip=${postData?.skip}&take=${postData?.take}&userId=${postData?.userIdLogin}`,
  );
};

export const userAttachmentList = async (postData: any) => {
  return await api.get(
    `/userAttachmentList?skip=${postData?.skip}&take=${postData?.take}&userId=${postData?.id}`,
  );
};

export const attachmentListByInviteId = async (postData: {
  skip: number;
  take: number;
  inviteId: number | string;
}) => {
  const res = await api.get("/attachmentListByInviteId", {
    params: {
      skip: postData.skip,
      take: postData.take,
      inviteId: postData.inviteId,
    },
  });
  return res.data;
};

export const addAttachment = async (postData: FormData) => {
  const response = await api.post(`/addAttachment`, postData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const removeFollower = async (postData: any) => {
  return await api.delete(`/removeFollower`, { data: postData });
};

export const addFollower = async (postData: any) => {
  return await api.post(`/addFollower`, postData);
};

export const modeList = async () => {
  return await api.get(`/modeList`);
};

export const subSubCategoryList = async (
  subCatId: number | string | null | undefined,
) => {
  return await api.get(`/subSubCategoryList?subCategoryId=${subCatId}`);
};

export const addInvite = async (postData: any) => {
  return await api.post(`/addInvite`, postData);
};

export const addMovie = async (data: any) => {
  return await api.post(`/addMovie`, data);
};

export const registerUser = async (postData: any) => {
  return await api.post(`/registerUser`, postData);
};

export const addComment = async (postData: any) => {
  return await api.post(`/addComment`, postData);
};

export const commentList = async (movieId: number) => {
  return await api.get(`/commentList?movieId=${movieId}`);
};

export const topScoreList = async () => {
  return await api.get(`/topScoreList`);
};

export const addLike = async (data: any) => {
  return await api.post(`/addLike`, data);
};

export const removeLike = async (postData: any) => {
  return await api.delete(`/removeLike`, { data: postData });
};

export const removeInvite = async (invId: number) => {
  return await api.delete(`/removeInvite?inviteId=${invId}`);
};

export const addScoure = async (data: any) => {
  return await api.post(`/addScoure`, data);
};
