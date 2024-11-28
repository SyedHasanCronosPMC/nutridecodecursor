import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

router.get('/profile', async (req, res, next) => {
  try {
    // Implement protected route logic here
    res.json({ message: 'Protected endpoint' });
  } catch (error) {
    next(error);
  }
});

export default router; 