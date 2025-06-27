import type { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

import User from '@/models/user';
import Blog from '@/models/blog';

import { logger } from '@/lib/winston';

const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;

  try {
    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();
    const publicIds = blogs.map(({ banner }) => banner.publicId);

    await cloudinary.api.delete_resources(publicIds);

    logger.info('Multiple blog banner deleted from Cloudinary', {
      publicIds,
    });

    await Blog.deleteMany({ author: userId });

    logger.info('Multiple blogs deleted', {
      userId,
      blogs,
    });

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
