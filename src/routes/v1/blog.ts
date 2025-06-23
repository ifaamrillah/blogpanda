import { Router } from 'express';
import { query, body, param } from 'express-validator';
import multer from 'multer';

import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';
import uploadBlogBanner from '@/middlewares/uploadBlogBanner';

import createBlog from '@/controllers/v1/blog/create-blog';
import getAllBlogs from '@/controllers/v1/blog/get-all-blogs';
import getBlogBySlug from '@/controllers/v1/blog/get-blog-by-slug';
import updateBlogById from '@/controllers/v1/blog/update-blog-by-id';

const upload = multer();
const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 180 })
    .withMessage('Title must be less then 180 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  validationError,
  uploadBlogBanner('post'),
  createBlog,
);

router.get(
  '/',
  authenticate,
  authorize(['admin', 'user']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Offset must be at least 1'),
  validationError,
  getAllBlogs,
);

router.get(
  '/:slug',
  authenticate,
  authorize(['admin', 'user']),
  param('slug').notEmpty().withMessage('Slug is required'),
  validationError,
  getBlogBySlug,
);

router.put(
  '/:blogId',
  authenticate,
  authorize(['admin']),
  param('blogId').notEmpty().withMessage('Invalid blog Id'),
  upload.single('banner_image'),
  body('title')
    .optional()
    .isLength({ max: 180 })
    .withMessage('Title must be less then 180 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  validationError,
  uploadBlogBanner('put'),
  updateBlogById,
);

export default router;
