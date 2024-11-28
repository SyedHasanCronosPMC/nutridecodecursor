import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from '../services/authService.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authSchemas } from '../schemas/auth.js';
import { AuthError } from '../utils/errors.js';
import { SessionService } from '../services/sessionService.js';

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

    // Create session
    await SessionService.createSession(
      result.user.id,
      result.token,
      req.ip,
      req.headers['user-agent']
    );

    res.json(result);
  } catch (error) {
    next(new AuthError('Google authentication failed'));
  }
});

router.post('/login', validateRequest(authSchemas.login), async (req, res, next) => {
  try {
    const result = await AuthService.login(
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/register', validateRequest(authSchemas.register), async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    
    // Create session
    await SessionService.createSession(
      result.user.id,
      result.token,
      req.ip,
      req.headers['user-agent']
    );
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', validateRequest(authSchemas.resetPassword), async (req, res, next) => {
  try {
    const result = await AuthService.resetPassword(req.body.email);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await SessionService.invalidateSession(token);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/update-password', validateRequest(authSchemas.updatePassword), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Verify token
    const resetToken = await AuthService.verifyResetToken(token);
    
    // Update password
    await AuthService.updatePassword(resetToken.user_id, password);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;