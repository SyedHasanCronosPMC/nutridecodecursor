import { pool } from '../config/database.js';
import { User, UserCreate } from '../types/user.js';

export class UserService {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, name, picture, password_hash FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, name, picture FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async createUser(user: UserCreate): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [user.email, user.passwordHash, user.name]
    );
    return result.rows[0];
  }

  static async upsertGoogleUser(googleUser: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (google_id, email, name, picture)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) DO UPDATE
       SET email = $2, name = $3, picture = $4
       RETURNING id, email, name, picture`,
      [googleUser.googleId, googleUser.email, googleUser.name, googleUser.picture]
    );
    return result.rows[0];
  }
}