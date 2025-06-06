import type { Request, Response } from 'express';

import config from '@/config';

import User from '@/models/user';
import type { IUser } from '@/models/user';
import Token from '@/models/token';

import { logger } from '@/lib/winston';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

import { generateUsername } from '@/utils';

type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;

  if (role === 'admin' && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
    res.status(403).json({
      code: 'AuthorizationError',
      message: 'You cannot register as an admin',
    });

    logger.warn(
      `User with email ${email} tried to register as an admin, but is not in the whitelist`,
    );
    return;
  }

  try {
    // generate username
    const username = generateUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    // generate access token and refresh token for new user
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // store refresh token in database
    await Token.create({ token: refreshToken, userId: newUser._id });
    logger.info('Refresh token stored successfully.', {
      token: refreshToken,
      userId: newUser._id,
    });

    // set cookies for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    const data = {
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    };

    res.status(201).json(data);

    logger.info(`User ID: ${newUser._id} registered successfully.`);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error during user registration:', error);
  }
};

export default register;
