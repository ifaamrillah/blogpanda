import { Request, Response } from 'express';

import User from '@/models/user';

import { logger } from '@/lib/winston';

const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-__v').lean().exec();

    res.status(200).json({
      user,
    });

    logger.info('Current user fetched successfully.', user);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error getting current user:', error);
  }
};

export default getCurrentUser;
