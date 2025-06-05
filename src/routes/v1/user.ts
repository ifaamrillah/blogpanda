import { Router } from 'express';

import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';

import getCurrentUser from '@/controllers/v1/user/get-current-user';

const router = Router();

router.get(
  '/current',
  authenticate,
  authorize(['user', 'admin']),
  getCurrentUser,
);

export default router;
