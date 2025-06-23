import type { Request, Response } from 'express';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { v2 as cloudinary } from 'cloudinary';

import User from '@/models/user';
import Blog from '@/models/blog';
import type { IBlog } from '@/models/blog';

import { logger } from '@/lib/winston';

const deleteBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select('role').lean().exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });

      logger.warn("A user tried to delete a blog that doesn't exist", {
        userId,
        blogId,
      });

      return;
    }

    const blog = await Blog.findById(blogId)
      .select('author banner.publicId')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });

      logger.warn("A user tried to delete a blog that doesn't exist", {
        userId,
        blogId,
      });

      return;
    }

    if (blog.author !== userId && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      });

      logger.warn('A user tried to delete a blog without permission', {
        userId,
        blogId,
      });

      return;
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);

    logger.info('Blog banner deleted fro Cloudinary', {
      publicId: blog.banner.publicId,
    });

    await Blog.deleteOne({ _id: blogId });

    logger.info('Blog deleted successfully.', {
      blogId,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error deleting blog:', error);
  }
};

export default deleteBlogById;
