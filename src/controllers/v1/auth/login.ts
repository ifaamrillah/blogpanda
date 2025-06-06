import type { Request, Response } from 'express';

import config from '@/config';

import User from '@/models/user';
import type { IUser } from '@/models/user';
import Token from '@/models/token';

import { logger } from '@/lib/winston';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

type UserData = Pick<IUser, 'email' | 'password'>;

const login = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as UserData;

  try {
    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    // generate access token and refresh token for new user
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // store refresh token in database
    await Token.create({ token: refreshToken, userId: user._id });
    logger.info('Refresh token stored successfully.', {
      token: refreshToken,
      userId: user._id,
    });

    // set cookies for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    const data = {
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };

    res.status(201).json(data);

    logger.info(`User ID: ${user._id} logged in successfully.`);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error during user login:', error);
  }
};

export default login;
