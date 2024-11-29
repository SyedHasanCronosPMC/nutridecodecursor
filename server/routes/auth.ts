import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { LoginRequest } from '../types/auth';

const router = Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const loginData: LoginRequest = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    
    const result = await AuthService.login(loginData, ipAddress, userAgent);
    
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  }
});

// Protected route example
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Access granted to protected route',
    user: req.user 
  });
});

// Verify token route
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true,
    user: req.user
  });
});

export default router;