import { Router } from 'express';
import { param, query, body } from 'express-validator';

import User from '@/models/user';

import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';

const router = Router();

router.post('/', authenticate, authorize(['admin']));

export default router;
