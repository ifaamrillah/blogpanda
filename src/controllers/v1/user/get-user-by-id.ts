import type { Request, Response } from 'express';

import User from '@/models/user';

import { logger } from '@/lib/winston';

const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('-__v').exec();

    if (!user) {
      res.status(400).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      user,
    });

    logger.info(`User ID: ${userId} fetched successfully.`);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error getting user by id:', error);
  }
};

export default getUserById;
