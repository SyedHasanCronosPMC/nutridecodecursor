import { User } from './user';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

export interface GoogleAuthRequest {
  token: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  ip_address?: string;
  user_agent?: string;
  is_valid: boolean;
}

export interface TokenPayload {
  userId: string;
  exp?: number;
}