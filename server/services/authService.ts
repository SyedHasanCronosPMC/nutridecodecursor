import bcryptjs from 'bcryptjs';
import { pool } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { AuthError } from '../utils/errors.js';
import { LoginRequest, RegisterRequest } from '../types/auth.js';

export class AuthService {
  static async login(data: LoginRequest) {
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

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    return { token, user: userWithoutPassword };
  }

  static async register(data: RegisterRequest) {
    // Check if email exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );

    if (existingUser.rows.length > 0) {
      throw new AuthError('Email already registered');
    }

    const passwordHash = await bcryptjs.hash(data.password, 12);

    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, email_verified)
       VALUES ($1, $2, $3, false)
       RETURNING id, email, name, created_at`,
      [data.email, data.name, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken({ userId: user.id });

    return { token, user };
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
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [user.rows[0].id, resetToken]
    );

    // In a real application, send email with reset link
    // For demo purposes, just return success
    return { message: 'Password reset email sent' };
  }
}