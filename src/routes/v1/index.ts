import { Router } from 'express';

import config from '@/config';

import authRoutes from '@/routes/v1/auth';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is live!',
    version: '1.0.0',
    docs: config.MAIN_DOCS,
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);

export default router;
