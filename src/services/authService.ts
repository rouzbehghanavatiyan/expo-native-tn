import { api } from './api';

export const login = async (postData: {
  userName: string;
  password: string;
}) => {
  const response = await api.post('/login', postData);
  return response.data;
};