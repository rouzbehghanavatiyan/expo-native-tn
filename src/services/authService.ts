import { api } from "./api";

export const login = async (postData: {
  userName: string;
  password: string;
}) => {
  const response = await api.post("/login", postData);
  console.log("Loggggggggggggggggg", response);

  return response.data;
};
