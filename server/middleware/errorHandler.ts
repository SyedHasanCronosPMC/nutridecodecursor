import { Request, Response, NextFunction } from 'express';
import { AuthError, ValidationError } from '../utils/errors.js';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof AuthError) {
    return res.status(401).json({
      error: error.message,
      code: error.code,
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: error.message,
      code: error.code,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors,
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
};