import apiService from './api';
import { LoginCredentials, AuthResponse } from '../types/auth';

export const loginWithCredentials = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiService.auth.login(credentials);
  return response.data;
};

export const loginWithGoogleToken = async (credential: string): Promise<AuthResponse> => {
  const response = await apiService.auth.googleLogin(credential);
  return response.data;
};

export const register = async (data: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResponse> => {
  const response = await apiService.auth.register(data);
  return response.data;
};

export const resetPassword = async (email: string): Promise<void> => {
  const response = await apiService.auth.resetPassword(email);
  return response.data;
};

export const fetchHealth = async () => {
  const response = await apiService.health.check();
  return response.data;
};