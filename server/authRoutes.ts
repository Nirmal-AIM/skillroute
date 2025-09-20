import { Router } from 'express';
import type { Response } from 'express';
import { registerUserSchema, loginUserSchema } from '@shared/schema';
import { storage } from './storage';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  setAuthCookie, 
  clearAuthCookie,
  type AuthRequest,
  authenticateJWT 
} from './auth';

const router = Router();

// Register endpoint
router.post('/register', async (req, res: Response) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // SECURITY: Force all new registrations to be 'learner' role for security
    // TODO: Implement admin approval flow for trainer/policymaker roles  
    const safeUserData = {
      ...validatedData,
      role: 'learner' as const, // Override client-supplied role to prevent privilege escalation
    };

    // Hash password and create user
    const passwordHash = await hashPassword(safeUserData.password);
    const user = await storage.createUser({
      ...safeUserData,
      passwordHash
    });

    // Generate token and set cookie
    const token = generateToken(user.id);
    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        surveyCompleted: user.surveyCompleted
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: error.message || 'Registration failed'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = loginUserSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked (3+ failed attempts)
    if ((user.failedLoginCount || 0) >= 3) {
      return res.status(423).json({ 
        message: 'Account locked due to multiple failed attempts. Please contact support.' 
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      // Increment failed login count
      await storage.updateUser(user.id, { 
        failedLoginCount: (user.failedLoginCount || 0) + 1 
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Reset failed login count and update last login
    await storage.updateUser(user.id, { 
      failedLoginCount: 0,
      lastLogin: new Date()
    });

    // Generate token and set cookie
    const token = generateToken(user.id);
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        surveyCompleted: user.surveyCompleted
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(400).json({ 
      message: error.message || 'Login failed'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: 'Logout successful' });
});

// Get current user info
router.get('/me', authenticateJWT, (req: AuthRequest, res: Response) => {
  res.json({
    user: req.user
  });
});

export default router;