import type { Request, Response } from 'express';

import Blog from '@/models/blog';
import Comment from '@/models/comment';

import { logger } from '@/lib/winston';

const getCommentsByBlogId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();
    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    const comments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      comments,
    });

    logger.info('Comments fetched successfully', {
      blogId,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error getting comments by blog id:', error);
  }
};

export default getCommentsByBlogId;
