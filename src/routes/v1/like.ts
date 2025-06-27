import { Router } from 'express';
import { body, param } from 'express-validator';

import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';

import likeBlog from '@/controllers/v1/like/like-blog';

const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['user', 'admin']),
  param('blogId').isMongoId().withMessage('Invalid blog Id'),
  body('userId')
    .notEmpty()
    .withMessage('User Id is required')
    .isMongoId()
    .withMessage('Invalid user Id'),
  validationError,
  likeBlog,
);

export default router;
