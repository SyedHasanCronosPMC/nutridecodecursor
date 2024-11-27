import { Request, Response, NextFunction } from 'express';
import { handleError } from '../utils/errors.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  handleError(err, res);
};

export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    error: 'Resource not found',
    code: 'NOT_FOUND',
  });
};