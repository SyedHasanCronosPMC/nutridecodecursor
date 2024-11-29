import { Router } from 'express';
const router = Router();

router.get('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5178');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.json({ status: 'ok' });
});

export default router; 