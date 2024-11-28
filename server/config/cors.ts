import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:5178',
    'http://localhost:5173',
    'https://accounts.google.com',
    'https://apis.google.com',
    'https://*.googleusercontent.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400
};