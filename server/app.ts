import express, { Request, Response } from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { configureSecurityMiddleware } from './middleware/security.js';
import authRoutes from './routes/auth.js';

const app = express();

// Configure security middleware first
configureSecurityMiddleware(app);

// Configure CORS
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Auth routes
app.use('/api', authRoutes);

export default app; 