export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  password_hash?: string;
  created_at?: Date;
  last_login?: Date;
}

export interface UserCreate {
  email: string;
  passwordHash: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}