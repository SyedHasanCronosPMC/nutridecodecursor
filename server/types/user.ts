export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  email_verified: boolean;
}

export type UserProfile = Omit<User, 'password_hash'>;