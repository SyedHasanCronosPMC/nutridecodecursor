import bcrypt from 'bcrypt';
import { UserService } from './userService.js';
import { generateToken } from '../utils/jwt.js';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth.js';
import { AuthError, ValidationError } from '../utils/errors.js';

export class PasswordAuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await UserService.findByEmail(data.email);
    if (existingUser) {
      throw new ValidationError('Email already registered', 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await UserService.createUser({
      email: data.email,
      passwordHash,
      name: data.name,
    });

    const token = generateToken({ userId: user.id });
    return { token, user };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const user = await UserService.findByEmail(data.email);
    if (!user?.password_hash) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const validPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!validPassword) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const token = generateToken({ userId: user.id });
    const { password_hash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserService.findById(userId);
    if (!user?.password_hash) {
      throw new AuthError('User not found or no password set', 'USER_NOT_FOUND');
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      throw new AuthError('Current password is incorrect', 'INVALID_PASSWORD');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await UserService.updatePassword(userId, newPasswordHash);
  }
}