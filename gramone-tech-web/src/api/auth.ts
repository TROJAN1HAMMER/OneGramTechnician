import client from './client';
import type { TokenResponse, User } from '../types';

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const response = await client.post<TokenResponse>('/auth/login', {
    email: email.trim(),
    password,
  });
  if (response.data.access_token) {
    localStorage.setItem('jwt_token', response.data.access_token);
    localStorage.setItem('user_email', response.data.user.email);
  }
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await client.get<User>('/auth/me');
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user_email');
  window.location.href = '/login';
};
