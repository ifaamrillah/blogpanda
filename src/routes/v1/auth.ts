import { Router } from 'express';
import { body } from 'express-validator';

import User from '@/models/user';

import validationError from '@/middlewares/validationError';

import register from '@/controllers/v1/auth/register';

const router = Router();

router.post(
  '/register',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 50 })
    .withMessage('Email must be less then 50 characters')
    .isEmail()
    .withMessage('Email is not valid')
    .custom(async (value) => {
      const userExists = await User.findOne({ email: value });
      if (userExists) {
        throw new Error('User already exists');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
  validationError,
  register,
);

export default router;
