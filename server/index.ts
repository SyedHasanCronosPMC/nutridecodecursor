import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import authRouter from './routes/auth.js';
import protectedRouter from './routes/protected.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initDatabase } from './config/database/init.js';
import { configureSecurityMiddleware } from './middleware/security.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import { SessionService } from './services/sessionService.js';
import { corsOptions } from './config/cors.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Add these console logs for debugging first
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);

// Middleware order is important!
// 1. CORS should be first
app.use(cors(corsOptions));

// 2. Then body parser
app.use(express.json());

// 3. Security middleware
configureSecurityMiddleware(app);

// 4. Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy',
      message: 'Server is running',
      timestamp: result.rows[0].now,
      database: 'connected',
      env: {
        nodeEnv: process.env.NODE_ENV,
        frontendUrl: process.env.FRONTEND_URL,
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/protected', protectedRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    
    // Try to start server with retries on different ports
    let currentPort = parseInt(port.toString());
    const maxRetries = 3;
    let started = false;

    for (let i = 0; i < maxRetries && !started; i++) {
      try {
        await new Promise((resolve, reject) => {
          const server = app.listen(currentPort, () => {
            console.log(`🚀 Server running at http://localhost:${currentPort}`);
            console.log(`👋 Health check available at http://localhost:${currentPort}/health`);
            console.log(`🌐 Accepting requests from: ${process.env.FRONTEND_URL}`);
            started = true;
            resolve(true);
          });

          server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
              console.log(`⚠️ Port ${currentPort} is in use, trying ${currentPort + 1}...`);
              currentPort++;
              server.close();
              resolve(false);
            } else {
              reject(error);
            }
          });
        });
      } catch (error) {
        console.error('Failed to start server:', error);
        currentPort++;
      }
    }

    if (!started) {
      throw new Error(`Could not find an available port after ${maxRetries} attempts`);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing resources...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing resources...');
  await pool.end();
  process.exit(0);
});

// Add session cleanup job
setInterval(() => {
  SessionService.cleanupExpiredSessions()
    .catch(error => console.error('Failed to cleanup sessions:', error));
}, 24 * 60 * 60 * 1000); // Run daily

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});