import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Types } from 'mongoose';

import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // if there's no Bearer token respond with 401 Unauthorized
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provided',
    });
    return;
  }

  // Split out the token from the `Bearer` prefix
  const [_, token] = authHeader.split(' ');

  try {
    // Verify the token and extract the userId from the payload
    const jwtPayload = verifyAccessToken(token) as {
      userId: Types.ObjectId;
    };

    // Attach the userId to the request object
    req.userId = jwtPayload.userId;

    return next();
  } catch (error) {
    // Handle expired token error
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access denied, token expired',
      });
    }

    // Handle invalid token error
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token invalid',
      });
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error during authentication:', error);
  }
};

export default authenticate;
