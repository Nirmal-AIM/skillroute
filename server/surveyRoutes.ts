import { Router } from 'express';
import type { Response } from 'express';
import { insertSurveySchema } from '@shared/schema';
import { storage } from './storage';
import { 
  type AuthRequest,
  authenticateJWT,
  requireRole
} from './auth';

const router = Router();

// Get user's survey (learners only)
router.get('/me', authenticateJWT, requireRole('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const survey = await storage.getUserSurvey(userId);
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    
    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ message: 'Failed to fetch survey' });
  }
});

// Create or update user's survey (learners only)
router.post('/me', authenticateJWT, requireRole('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const surveyData = insertSurveySchema.parse({
      ...req.body,
      userId
    });

    // Check if survey already exists
    const existingSurvey = await storage.getUserSurvey(userId);
    
    let survey;
    if (existingSurvey) {
      // Update existing survey
      survey = await storage.updateSurvey(userId, surveyData);
    } else {
      // Create new survey
      survey = await storage.createSurvey(surveyData);
    }

    // CRITICAL: Mark user as having completed the survey for authentication flow
    await storage.updateUser(userId, { surveyCompleted: true });

    res.json({
      message: 'Survey saved successfully',
      survey
    });
  } catch (error: any) {
    console.error('Error saving survey:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to save survey'
    });
  }
});

// Check if user has completed survey
router.get('/status', authenticateJWT, requireRole('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const survey = await storage.getUserSurvey(userId);
    
    res.json({
      completed: !!survey,
      hasBasicInfo: !!survey?.academicBackground && !!survey?.aspirations
    });
  } catch (error) {
    console.error('Error checking survey status:', error);
    res.status(500).json({ message: 'Failed to check survey status' });
  }
});

export default router;