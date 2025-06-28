import { Router } from 'express';
import { body, param } from 'express-validator';

import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';

import createComment from '@/controllers/v1/comment/create-comment';
import getCommentsByBlogId from '@/controllers/v1/comment/get-comments-by-blogid';

const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['user', 'admin']),
  param('blogId').isMongoId().withMessage('Invalid blog Id'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  validationError,
  createComment,
);

router.get(
  '/blog/:blogId',
  authenticate,
  authorize(['user', 'admin']),
  param('blogId').isMongoId().withMessage('Invalid blog Id'),
  validationError,
  getCommentsByBlogId,
);

export default router;
