import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// JWT configuration - Require JWT_SECRET for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for security');
}
const JWT_EXPIRES_IN = '7d';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    surveyCompleted: boolean;
  };
}

// JWT Authentication Middleware
export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.vidya_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      res.clearCookie('vidya_token');
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: user.role!,
      surveyCompleted: user.surveyCompleted || false
    };
    
    next();
  } catch (error) {
    res.clearCookie('vidya_token');
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Role-based access control middleware
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    next();
  };
};

// Survey completion middleware (for learners)
export const requireSurveyCompletion = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === 'learner' && !req.user.surveyCompleted) {
    return res.status(403).json({ 
      message: 'Survey completion required',
      redirectTo: '/survey'
    });
  }

  next();
};

// Utility functions
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('vidya_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie('vidya_token');
};