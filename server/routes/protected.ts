import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { UserService } from '../services/userService.js';

const router = Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/session', authenticateToken, (req, res) => {
  res.json({
    message: 'Valid session',
    userId: req.user?.userId,
    expiresAt: req.user?.exp,
  });
});

export default router;