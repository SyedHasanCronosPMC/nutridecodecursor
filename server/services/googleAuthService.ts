import { OAuth2Client } from 'google-auth-library';
import { UserService } from './userService.js';
import { generateToken } from '../utils/jwt.js';
import { AuthResponse } from '../types/auth.js';
import { AuthError } from '../utils/errors.js';

export class GoogleAuthService {
  private static client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });

  static async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new AuthError('Invalid Google token payload');
      }

      const user = await UserService.upsertGoogleUser({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
      });

      const authToken = generateToken({ userId: user.id });
      return { token: authToken, user };
    } catch (error) {
      throw new AuthError(
        'Google authentication failed',
        'GOOGLE_AUTH_FAILED',
        error instanceof Error ? error.message : undefined
      );
    }
  }
}