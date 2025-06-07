import { Router } from 'express';
import { param, query, body } from 'express-validator';

import User from '@/models/user';

import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';

import getAllUsers from '@/controllers/v1/user/get-all-users';
import getUserById from '@/controllers/v1/user/get-user-by-id';
import getCurrentUser from '@/controllers/v1/user/get-current-user';
import updateCurrentUser from '@/controllers/v1/user/update-current-user';
import deleteCurrentUser from '@/controllers/v1/user/delete-current-user';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Offset must be at least 1'),
  validationError,
  getAllUsers,
);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').notEmpty().withMessage('User ID is required'),
  validationError,
  getUserById,
);

router.get(
  '/current',
  authenticate,
  authorize(['user', 'admin']),
  getCurrentUser,
);

router.put(
  '/current',
  authenticate,
  authorize(['user', 'admin']),
  body('username')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Username must be less than 20 characters')
    .custom(async (value, { req }) => {
      const userExists = await User.findOne({ username: value })
        .select('username')
        .lean()
        .exec();
      if (userExists && userExists._id.toString() !== req.userId) {
        throw new Error('Username already exists');
      }
    }),
  body('email')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .isEmail()
    .withMessage('Email is not valid')
    .custom(async (value, { req }) => {
      const userExists = await User.findOne({ email: value })
        .select('email')
        .lean()
        .exec();
      if (userExists && userExists._id.toString() !== req.userId) {
        throw new Error('Email already exists');
      }
    }),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .optional()
    .isLength({ max: 20 })
    .withMessage('First name must be less then 20 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Last name must be less then 20 characters'),
  body(['website', 'facebook', 'instagram', 'linkedin', 'youtube', 'x'])
    .optional()
    .isURL()
    .withMessage('URL is not valid')
    .isLength({ max: 100 })
    .withMessage('URL must be less then 100 characters'),
  validationError,
  updateCurrentUser,
);

router.delete(
  '/current',
  authenticate,
  authorize(['user', 'admin']),
  deleteCurrentUser,
);

export default router;
