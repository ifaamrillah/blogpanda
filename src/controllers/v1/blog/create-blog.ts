import type { Request, Response } from 'express';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import Blog from '@/models/blog';
import type { IBlog } from '@/models/blog';

import { logger } from '@/lib/winston';

type BlogData = Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>;

const window = new JSDOM('').window;
const purify = createDOMPurify(window);

const createBlog = async (req: Request, res: Response): Promise<void> => {
  const { title, content, banner, status } = req.body as BlogData;
  const userId = req.userId;

  try {
    const cleanContent = purify.sanitize(content);

    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status,
      author: userId,
    });

    res.status(201).json({
      blog: newBlog,
    });

    logger.info(`New blog created.`, newBlog);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error creating blog:', error);
  }
};

export default createBlog;
