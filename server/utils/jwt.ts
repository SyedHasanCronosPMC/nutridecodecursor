import jwt from 'jsonwebtoken';
import { getEnvVar } from './env.js';

const JWT_SECRET = getEnvVar('JWT_SECRET');

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};