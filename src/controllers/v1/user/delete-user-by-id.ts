import { Request, Response } from 'express';

import User from '@/models/user';

import { logger } from '@/lib/winston';

const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    await User.deleteOne({ _id: userId });

    res.sendStatus(204);

    logger.info(`User ID: ${userId} deleted successfully.`);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error deleting user by id:', error);
  }
};

export default deleteUserById;
