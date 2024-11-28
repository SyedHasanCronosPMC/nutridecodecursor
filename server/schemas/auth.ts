import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const authSchemas = {
  google: z.object({
    body: z.object({
      credential: z.string().min(1, 'Google credential is required'),
    }),
  }),

  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: passwordSchema,
      name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
      remember: z.boolean().optional(),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
    }),
  }),

  updatePassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Reset token is required'),
      password: passwordSchema,
    }),
  }),
};

export type GoogleAuthRequest = z.infer<typeof authSchemas.google>['body'];
export type RegisterRequest = z.infer<typeof authSchemas.register>['body'];
export type LoginRequest = z.infer<typeof authSchemas.login>['body'];