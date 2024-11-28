import bcryptjs from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { AuthError, ValidationError } from '../utils/errors.js';
import { LoginRequest, RegisterRequest } from '../types/auth.js';
import { SessionService } from './sessionService.js';

export class AuthService {
  static async login(data: LoginRequest, ipAddress?: string, userAgent?: string) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [data.email]
    );

    const user = result.rows[0];
    if (!user?.password_hash) {
      throw new AuthError('Invalid credentials');
    }

    const validPassword = await bcryptjs.compare(data.password, user.password_hash);
    if (!validPassword) {
      throw new AuthError('Invalid credentials');
    }

    const token = generateToken({ userId: user.id });
    const { password_hash, ...userWithoutPassword } = user;

    // Create session
    await SessionService.createSession(user.id, token, ipAddress, userAgent);

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    return { token, user: userWithoutPassword };
  }

  static async register(data: RegisterRequest) {
    // Validate password requirements
    if (!this.validatePassword(data.password)) {
      throw new ValidationError(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
      );
    }

    // Check if email exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new ValidationError('Email already registered');
    }

    const passwordHash = await bcryptjs.hash(data.password, 12);

    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, email_verified)
       VALUES ($1, $2, $3, false)
       RETURNING id, email, name, created_at`,
      [data.email.toLowerCase(), data.name, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken({ userId: user.id });

    return { token, user };
  }

  private static validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  static async resetPassword(email: string) {
    const user = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      throw new AuthError('User not found');
    }

    // Generate reset token
    const resetToken = generateToken({ userId: user.rows[0].id, purpose: 'reset' });

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $2, expires_at = NOW() + INTERVAL '1 hour', used = false`,
      [user.rows[0].id, resetToken]
    );

    // In a real application, send email with reset link
    // For demo purposes, just return the token
    return { resetToken };
  }

  static async verifyResetToken(token: string) {
    const result = await pool.query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = $1 AND expires_at > NOW() AND used = false`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new AuthError('Invalid or expired reset token');
    }

    return result.rows[0];
  }

  static async updatePassword(userId: string, newPassword: string) {
    const passwordHash = await bcryptjs.hash(newPassword, 12);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    // Invalidate reset token
    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE user_id = $1',
      [userId]
    );

    // Invalidate all sessions
    await SessionService.invalidateAllUserSessions(userId);
  }

  static async loginWithGoogle(data: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }) {
    const result = await pool.query(
      `INSERT INTO users (google_id, email, name, picture, email_verified)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (google_id) DO UPDATE
       SET email = $2, name = $3, picture = $4, last_login = CURRENT_TIMESTAMP
       RETURNING id, email, name, picture`,
      [data.googleId, data.email, data.name, data.picture]
    );

    const user = result.rows[0];
    const token = generateToken({ userId: user.id });

    return { token, user };
  }
}