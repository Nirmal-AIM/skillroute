import { Router } from 'express';
import type { Response } from 'express';
import { storage } from './storage';
import { aiService } from './openai';
import { 
  type AuthRequest,
  authenticateJWT,
  requireRole,
  requireSurveyCompletion
} from './auth';
import { z } from 'zod';

const router = Router();

// Schema for chatbot messages
const chatbotMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationId: z.string().optional(),
});

// Career guidance chatbot endpoint (learners only, survey required)
router.post('/career-guidance', 
  authenticateJWT, 
  requireRole('learner'), 
  requireSurveyCompletion, 
  async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message, conversationId } = chatbotMessageSchema.parse(req.body);

    // Get user profile and survey data
    const user = await storage.getUserById(userId);
    const survey = await storage.getUserSurvey(userId);
    const userSkills = await storage.getUserSkills(userId);

    if (!user || !survey) {
      return res.status(400).json({ 
        message: 'User profile or survey data not found' 
      });
    }

    // Get relevant NCVET/NSQF data for context
    const qualifications = await storage.getQualifications();
    const trainingPrograms = await storage.getTrainingPrograms();
    const jobRoles = await storage.getJobRoles();

    // Prepare context for AI
    const context = {
      user: {
        academicBackground: survey.academicBackground,
        aspirations: survey.aspirations,
        learningPace: survey.learningPace,
        socioEconomicContext: survey.socioEconomicContext,
        priorSkillsFreeform: survey.priorSkillsFreeform,
        currentSkills: userSkills
      },
      ncvetData: {
        qualifications: qualifications.slice(0, 10), // Limit for token efficiency
        trainingPrograms: trainingPrograms.slice(0, 10),
        jobRoles: jobRoles.slice(0, 10)
      }
    };

    // Generate AI response with career guidance using the local function
    const aiResponse = await generateCareerGuidance(message, context);

    // Save the conversation for future reference
    await storage.saveAIAnalysis({
      userId,
      analysisType: 'career_guidance',
      input: { message, conversationId },
      output: { response: aiResponse.response, suggestions: aiResponse.suggestions },
      confidence: 0.85 // Default confidence for chatbot responses
    });

    res.json({
      response: aiResponse.response,
      suggestions: aiResponse.suggestions,
      conversationId: conversationId || generateConversationId()
    });

  } catch (error: any) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      message: 'Failed to process your message. Please try again.' 
    });
  }
});

// Generate career guidance using AI
async function generateCareerGuidance(userMessage: string, context: any) {
  const prompt = `You are Vidya Varadhi, a career guidance assistant for Indian learners. Help users explore career paths based on NCVET qualifications and NSQF levels.

User Profile:
- Academic Background: ${context.user.academicBackground}
- Career Aspirations: ${context.user.aspirations}
- Learning Pace: ${context.user.learningPace}
- Socio-Economic Context: ${context.user.socioEconomicContext}
- Prior Skills: ${context.user.priorSkillsFreeform}

Available NCVET Qualifications (sample):
${context.ncvetData.qualifications.map(q => `- ${q.code}: ${q.title} (NSQF Level ${q.nsqfLevel}, ${q.sector})`).join('\n')}

Available Training Programs (sample):
${context.ncvetData.trainingPrograms.map(p => `- ${p.title} by ${p.provider} (${p.duration}, NSQF Level ${p.nsqfLevel})`).join('\n')}

Job Roles (sample):
${context.ncvetData.jobRoles.map(j => `- ${j.title} in ${j.sector} (NSQF Level ${j.nsqfLevel}, Salary: ${j.salaryRange})`).join('\n')}

User Message: "${userMessage}"

Provide career guidance that:
1. Is relevant to their background and aspirations
2. References specific NCVET qualification codes when relevant
3. Suggests appropriate NSQF levels based on their current skills
4. Recommends specific training programs from the available options
5. Mentions salary ranges and job market demand
6. Is encouraging and culturally appropriate for Indian context
7. Uses simple, easy to understand language

Respond in a conversational, helpful tone. Keep responses under 300 words.`;

  try {
    const aiResponse = await aiService.generateCareerGuidance(prompt);
    
    // Extract suggestions from the response
    const suggestions = extractCareerSuggestions(aiResponse, context.ncvetData);
    
    return {
      response: aiResponse,
      suggestions
    };
  } catch (error) {
    console.error('AI service error:', error);
    return {
      response: "I'm here to help with your career guidance questions. Could you please tell me more about what specific career area you're interested in exploring?",
      suggestions: []
    };
  }
}

// Extract structured career suggestions from AI response
function extractCareerSuggestions(response: string, ncvetData: any) {
  const suggestions = [];

  // Look for NCVET codes mentioned in the response
  const codePattern = /([A-Z]{3}\/Q\d{4})/g;
  const mentionedCodes = response.match(codePattern) || [];

  for (const code of mentionedCodes) {
    const qualification = ncvetData.qualifications.find((q: any) => q.code === code);
    const relatedProgram = ncvetData.trainingPrograms.find((p: any) => 
      p.qualificationCodes?.includes(code)
    );
    const relatedJobRole = ncvetData.jobRoles.find((j: any) => 
      j.qualificationCodes?.includes(code)
    );

    if (qualification) {
      suggestions.push({
        type: 'qualification',
        code: qualification.code,
        title: qualification.title,
        nsqfLevel: qualification.nsqfLevel,
        sector: qualification.sector,
        relatedProgram: relatedProgram?.title,
        relatedJobRole: relatedJobRole?.title
      });
    }
  }

  return suggestions.slice(0, 3); // Limit to top 3 suggestions
}

// Generate a simple conversation ID
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default router;