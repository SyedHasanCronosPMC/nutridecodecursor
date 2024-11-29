import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { 
  AuthResponse, 
  User, 
  LoginCredentials
} from '../types/auth';

// Types
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, string[]>;
}

// Define the expected error response structure from the server
interface ServerErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': window.location.origin,
  },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.withCredentials = true;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ServerErrorResponse>) => {
    const apiError: ApiError = {
      message: error.response?.data?.error || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      code: error.response?.data?.code,
      details: error.response?.data?.details,
    };
    
    // Handle authentication errors
    if (apiError.status === 401) {
      localStorage.removeItem('token');
      window.location.hash = '#login';
    }
    
    return Promise.reject(apiError);
  }
);

// Generic request methods
const apiService = {
  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await api.get<T>(url, { params });
    return {
      data: response.data,
      status: response.status,
    };
  },

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await api.post<T>(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  },

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await api.put<T>(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await api.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
    };
  },

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await api.patch<T>(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  },

  auth: {
    async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
      return apiService.post<AuthResponse>('/auth/login', credentials);
    },

    async register(data: { email: string; password: string; name: string }): Promise<ApiResponse<AuthResponse>> {
      return apiService.post<AuthResponse>('/auth/register', data);
    },

    async googleLogin(credential: string): Promise<ApiResponse<AuthResponse>> {
      return apiService.post<AuthResponse>('/auth/google', { credential });
    },

    async resetPassword(email: string): Promise<ApiResponse<void>> {
      return apiService.post<void>('/auth/reset-password', { email });
    },
  },

  user: {
    async getProfile(): Promise<ApiResponse<User>> {
      return apiService.get<User>('/protected/profile');
    },
  },

  health: {
    async check(): Promise<ApiResponse<{ status: string }>> {
      return apiService.get<{ status: string }>('/api/health');
    },
  },
};

export default apiService; 