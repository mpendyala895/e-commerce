import api from './api';
import { AuthResponse, User } from '../types';

export const login = async (credentials: Record<string, string>): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/users/login', credentials);
  return response.data;
};

export const register = async (userData: User & Record<string, string>): Promise<User> => {
  const response = await api.post<User>('/api/users/register', userData);
  return response.data;
};
