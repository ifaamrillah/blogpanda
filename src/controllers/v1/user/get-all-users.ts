import { Request, Response } from 'express';

import config from '@/config';

import User from '@/models/user';

import { logger } from '@/lib/winston';

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = (req.query.limit as string) || config.defaultResLimit;
    const offset = (req.query.offset as string) || config.defaultResOffset;
    const total = await User.countDocuments();

    const users = await User.find()
      .select('-__v')
      .limit(Number(limit))
      .skip(Number(offset) - 1)
      .lean()
      .exec();

    res.status(200).json({
      users,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });

    logger.info(`All users fetched successfully.`);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error getting all user:', error);
  }
};

export default getAllUsers;
