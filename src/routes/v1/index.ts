import { Router } from 'express';

import config from '@/config';

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

export default router;
