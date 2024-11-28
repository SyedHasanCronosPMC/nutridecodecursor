import pool from '../config/database.js';
import { Session } from '../types/auth.js';
import { AuthError } from '../utils/errors.js';

export class SessionService {
  static async createSession(userId: string, token: string, ipAddress?: string, userAgent?: string): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const result = await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, token, expiresAt, ipAddress, userAgent]
    );

    return result.rows[0];
  }

  static async invalidateSession(token: string): Promise<void> {
    await pool.query(
      'UPDATE sessions SET is_valid = false WHERE token = $1',
      [token]
    );
  }

  static async validateSession(token: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT * FROM sessions 
       WHERE token = $1 
       AND expires_at > NOW() 
       AND is_valid = true`,
      [token]
    );

    return result.rows.length > 0;
  }

  static async cleanupExpiredSessions(): Promise<void> {
    await pool.query(
      `DELETE FROM sessions 
       WHERE expires_at < NOW() 
       OR is_valid = false`
    );
  }

  static async invalidateAllUserSessions(userId: string): Promise<void> {
    await pool.query(
      'UPDATE sessions SET is_valid = false WHERE user_id = $1',
      [userId]
    );
  }
}