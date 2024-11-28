import helmet from 'helmet';
import { Express } from 'express';

export const configureSecurity = (app: Express) => {
  if (process.env.NODE_ENV === 'development') {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false
      })
    );
  } else {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              'https://accounts.google.com',
              'https://apis.google.com',
              'https://*.googleusercontent.com'
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'https:', 'data:'],
            connectSrc: [
              "'self'",
              'https://accounts.google.com',
              'https://apis.google.com',
              'https://*.googleusercontent.com'
            ],
            frameSrc: ["'self'", 'https://accounts.google.com'],
            formAction: ["'self'"],
          },
        },
      })
    );
  }
}; 