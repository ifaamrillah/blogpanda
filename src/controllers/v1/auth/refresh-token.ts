import type { Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Types } from 'mongoose';

import Token from '@/models/token';

import { logger } from '@/lib/winston';
import { generateAccessToken, verifyRefreshToken } from '@/lib/jwt';

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken as string;

  try {
    const tokenExists = await Token.exists({ token });

    if (!tokenExists) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    // verify refresh token
    const jwtPayload = verifyRefreshToken(token) as {
      userId: Types.ObjectId;
    };

    const accessToken = generateAccessToken(jwtPayload.userId);

    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token expired, please login again',
      });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error during refresh token:', error);
  }
};

export default refreshToken;
