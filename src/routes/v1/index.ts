import { Router } from 'express';

import config from '@/config';

import authRoutes from '@/routes/v1/auth';
import userRoutes from '@/routes/v1/user';
import blogRoutes from '@/routes/v1/blog';
import likeRoutes from '@/routes/v1/like';

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
router.use('/user', userRoutes);
router.use('/blog', blogRoutes);
router.use('/like', likeRoutes);

export default router;
