import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from '../services/authService.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authSchemas } from '../schemas/auth.js';
import { AuthError } from '../utils/errors.js';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', validateRequest(authSchemas.google), async (req, res, next) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new AuthError('Invalid Google token payload');
    }

    const result = await AuthService.loginWithGoogle({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
    });

    res.json(result);
  } catch (error) {
    next(new AuthError('Google authentication failed', 'GOOGLE_AUTH_FAILED'));
  }
});

router.post('/register', validateRequest(authSchemas.register), async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already registered') {
      next(new AuthError('Email already registered', 'EMAIL_EXISTS'));
    } else {
      next(error);
    }
  }
});

router.post('/login', validateRequest(authSchemas.login), async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error) {
    next(new AuthError('Invalid credentials', 'INVALID_CREDENTIALS'));
  }
});

export default router;