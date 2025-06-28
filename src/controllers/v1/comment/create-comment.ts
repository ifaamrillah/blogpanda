import type { Request, Response } from 'express';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import Blog from '@/models/blog';
import Comment from '@/models/comment';
import type { IComment } from '@/models/comment';

import { logger } from '@/lib/winston';

type CommentData = Pick<IComment, 'content'>;

const window = new JSDOM('').window;
const purify = createDOMPurify(window);

const createComment = async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body as CommentData;
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select('_id commentsCount').exec();
    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    const cleanContent = purify.sanitize(content);
    const newComment = await Comment.create({
      blogId,
      userId,
      content: cleanContent,
    });

    logger.info('Comment created successfully', {
      newComment,
    });

    blog.commentsCount++;
    await blog.save();

    logger.info('Blog comments count updated', {
      blogId,
      userId,
      commentsCount: blog.commentsCount,
    });

    res.status(200).json({
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error creating comment in blog:', error);
  }
};

export default createComment;
