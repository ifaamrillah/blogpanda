import type { Request, Response } from 'express';

import User from '@/models/user';

import { logger } from '@/lib/winston';

const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;

  try {
    await User.deleteOne({ _id: userId });

    res.sendStatus(204);

    logger.info(`Current User ID: ${userId} deleted successfully.`);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error deleting current user:', error);
  }
};

export default deleteCurrentUser;
