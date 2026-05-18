import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (res: Response, userId: string) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};
