import type { Request, Response } from 'express';

import User from '@/models/user';
import Blog from '@/models/blog';
import Comment from '@/models/comment';

import { logger } from '@/lib/winston';

const deleteCommentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId)
      .select('userId blogId')
      .exec();

    if (!comment) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Comment not found',
      });
      return;
    }

    const user = await User.findById(userId).select('role').lean().exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    const blog = await Blog.findById(comment.blogId)
      .select('commentsCount')
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    if (comment.userId !== userId && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      });

      logger.warn('A user tried to delete a comment without permission', {
        userId,
        commentId,
      });

      return;
    }

    await Comment.deleteOne({ _id: commentId });

    logger.info('Comment deleted successfully', {
      commentId,
    });

    blog.commentsCount--;

    await blog.save();

    logger.info('Blog comments count updated', {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error deleting comment by id:', error);
  }
};

export default deleteCommentById;
