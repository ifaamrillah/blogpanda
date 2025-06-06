import { Request, Response } from 'express';

import User from '@/models/user';

import { logger } from '@/lib/winston';

const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    socialLinks,
    website,
    facebook,
    instagram,
    linkedin,
    youtube,
    x,
  } = req.body;

  try {
    const user = await User.findById(userId).select('+password -__v').exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    if (!user?.socialLinks) {
      user.socialLinks = {};
    }
    if (website) user.socialLinks.website = website;
    if (facebook) user.socialLinks.facebook = facebook;
    if (instagram) user.socialLinks.instagram = instagram;
    if (linkedin) user.socialLinks.linkedin = linkedin;
    if (youtube) user.socialLinks.youtube = youtube;
    if (x) user.socialLinks.x = x;

    await user?.save();

    const userObj = user.toObject() as any;
    delete userObj.password;

    res.status(200).json({ user: userObj });

    logger.info(`Current User ID: ${userId} updated successfully.`);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error updating current user:', error);
  }
};

export default updateCurrentUser;
