import type { Request, Response } from 'express';

import config from '@/config';

import Blog from '@/models/blog';
import User from '@/models/user';

import { logger } from '@/lib/winston';

interface IQueryType {
  status?: 'draft' | 'published';
}

const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const limit = (req.query.limit as string) || config.defaultResLimit;
    const offset = (req.query.offset as string) || config.defaultResOffset;
    const total = await Blog.countDocuments();

    const user = await User.findById(userId).select('role').lean().exec();
    const query: IQueryType = {};

    // Show only the published post to a normal user
    if (user?.role === 'user') {
      query.status = 'published';
    }

    const blogs = await Blog.find(query)
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .limit(Number(limit))
      .skip(Number(offset) - 1)
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec();

    res.status(200).json({
      blogs,
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

    logger.error('Error getting all blogs:', error);
  }
};

export default getAllBlogs;
