import OpenAI from "openai";
import { storage } from "./storage";
import type { User, UserSkill, Skill, Course } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key" 
});

interface SkillGapAnalysis {
  skillGaps: Array<{
    skillName: string;
    currentLevel: string;
    requiredLevel: string;
    priority: 'high' | 'medium' | 'low';
    recommendations: string[];
  }>;
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  careerReadiness: number;
}

interface LearningPathway {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  courses: Array<{
    title: string;
    provider: string;
    duration: string;
    nsqfLevel: number;
    priority: number;
  }>;
  milestones: string[];
  expectedOutcomes: string[];
}

export class AILearningService {
  // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  private model = "gpt-5";

  async generateCareerGuidance(prompt: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are Vidya Varadhi, a knowledgeable and supportive career guidance assistant specializing in Indian vocational education and NSQF-aligned career paths. You help learners navigate their career journey with empathy and practical advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || "I'm here to help with your career questions. Please tell me more about what you'd like to explore.";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate career guidance");
    }
  }

  async analyzeSkillGap(
    user: User,
    userSkills: UserSkill[],
    availableSkills: Skill[],
    targetRole: string
  ): Promise<SkillGapAnalysis> {
    try {
      const prompt = `
        Analyze the skill gap for a learner aspiring to become a ${targetRole}.
        
        User Profile:
        - Academic Background: ${user.academicBackground || 'Not specified'}
        - Current Role: ${user.currentRole || 'Not specified'}
        - Career Aspirations: ${user.careerAspirations || 'Not specified'}
        - Learning Pace: ${user.learningPace || 'moderate'}
        
        Current Skills:
        ${userSkills.map(skill => {
          const skillDetails = availableSkills.find(s => s.id === skill.skillId);
          return `- ${skillDetails?.name || 'Unknown'}: ${skill.proficiencyLevel} (${skill.proficiencyScore}/100)`;
        }).join('\n')}
        
        Available Skills in System:
        ${availableSkills.map(skill => `- ${skill.name} (${skill.category})`).join('\n')}
        
        Please provide a comprehensive skill gap analysis in JSON format with the following structure:
        {
          "skillGaps": [
            {
              "skillName": "string",
              "currentLevel": "beginner|intermediate|advanced|none",
              "requiredLevel": "beginner|intermediate|advanced",
              "priority": "high|medium|low",
              "recommendations": ["string"]
            }
          ],
          "overallScore": number (0-100),
          "strengths": ["string"],
          "improvementAreas": ["string"],
          "careerReadiness": number (0-100)
        }
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor and skill assessment specialist. Provide detailed, actionable skill gap analysis for vocational training aligned with NSQF standards."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Save analysis to database
      await storage.saveAIAnalysis({
        userId: user.id,
        analysisType: 'skill_gap',
        input: {
          userProfile: {
            academicBackground: user.academicBackground,
            currentRole: user.currentRole,
            careerAspirations: user.careerAspirations,
          },
          targetRole,
          currentSkills: userSkills.length
        },
        output: analysis,
        confidence: 0.85
      });

      return analysis as SkillGapAnalysis;
    } catch (error) {
      console.error("Error analyzing skill gap:", error);
      throw new Error("Failed to analyze skill gap: " + (error as Error).message);
    }
  }

  async generateLearningPathway(
    user: User,
    skillGapAnalysis: SkillGapAnalysis,
    availableCourses: Course[],
    targetRole: string
  ): Promise<LearningPathway> {
    try {
      const prompt = `
        Generate a personalized learning pathway for a ${targetRole} aspirant.
        
        User Profile:
        - Academic Background: ${user.academicBackground || 'Not specified'}
        - Learning Pace: ${user.learningPace || 'moderate'}
        - Career Aspirations: ${user.careerAspirations || 'Not specified'}
        
        Skill Gap Analysis Results:
        - Overall Score: ${skillGapAnalysis.overallScore}/100
        - Career Readiness: ${skillGapAnalysis.careerReadiness}/100
        - Key Skill Gaps: ${skillGapAnalysis.skillGaps.map(gap => 
          `${gap.skillName} (${gap.currentLevel} → ${gap.requiredLevel}, Priority: ${gap.priority})`
        ).join(', ')}
        - Strengths: ${skillGapAnalysis.strengths.join(', ')}
        - Improvement Areas: ${skillGapAnalysis.improvementAreas.join(', ')}
        
        Available Courses:
        ${availableCourses.slice(0, 50).map(course => 
          `- ${course.title} by ${course.provider} (${course.skillLevel}, NSQF Level ${course.nsqfLevel}, Duration: ${course.duration})`
        ).join('\n')}
        
        Create a comprehensive learning pathway in JSON format:
        {
          "title": "string",
          "description": "string",
          "duration": "string (e.g., '6 months')",
          "difficulty": "beginner|intermediate|advanced",
          "courses": [
            {
              "title": "string",
              "provider": "string", 
              "duration": "string",
              "nsqfLevel": number,
              "priority": number (1-10, higher is more important)
            }
          ],
          "milestones": ["string"],
          "expectedOutcomes": ["string"]
        }
        
        Ensure the pathway is:
        1. Aligned with NSQF standards
        2. Progressive (builds from basics to advanced)
        3. Industry-relevant
        4. Realistic for the user's pace and background
        5. Focused on high-priority skill gaps
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system", 
            content: "You are an expert learning path designer with deep knowledge of NSQF framework and industry requirements. Create practical, achievable learning pathways."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const pathway = JSON.parse(response.choices[0].message.content || '{}');

      // Save pathway recommendation to database
      await storage.saveAIAnalysis({
        userId: user.id,
        analysisType: 'pathway_recommendation',
        input: {
          targetRole,
          skillGapAnalysis: {
            overallScore: skillGapAnalysis.overallScore,
            careerReadiness: skillGapAnalysis.careerReadiness,
            skillGapsCount: skillGapAnalysis.skillGaps.length
          },
          availableCoursesCount: availableCourses.length
        },
        output: pathway,
        confidence: 0.90
      });

      return pathway as LearningPathway;
    } catch (error) {
      console.error("Error generating learning pathway:", error);
      throw new Error("Failed to generate learning pathway: " + (error as Error).message);
    }
  }

  async generateCareerGuidance(
    user: User,
    industryTrends: any[],
    userProgress: { completedCourses: number; totalSkills: number; averageScore: number }
  ): Promise<{
    careerAdvice: string[];
    industryInsights: string[];
    nextSteps: string[];
    salaryExpectations: string;
    jobMarketOutlook: string;
  }> {
    try {
      const prompt = `
        Provide comprehensive career guidance for a learner.
        
        User Profile:
        - Academic Background: ${user.academicBackground || 'Not specified'}
        - Current Role: ${user.currentRole || 'Not specified'}  
        - Career Aspirations: ${user.careerAspirations || 'Not specified'}
        - Location Context: ${user.socioEconomicContext || 'Not specified'}
        
        Learning Progress:
        - Completed Courses: ${userProgress.completedCourses}
        - Total Skills Assessed: ${userProgress.totalSkills}
        - Average Skill Score: ${userProgress.averageScore}/100
        
        Industry Trends:
        ${industryTrends.slice(0, 10).map(trend => 
          `- ${trend.skillName} in ${trend.sector}: ${trend.demandGrowth}% growth, Salary: ${trend.salaryRange}, Jobs: ${trend.jobCount}`
        ).join('\n')}
        
        Provide career guidance in JSON format:
        {
          "careerAdvice": ["string"],
          "industryInsights": ["string"], 
          "nextSteps": ["string"],
          "salaryExpectations": "string",
          "jobMarketOutlook": "string"
        }
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a senior career counselor with expertise in Indian job market trends and vocational training. Provide practical, actionable career guidance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const guidance = JSON.parse(response.choices[0].message.content || '{}');

      await storage.saveAIAnalysis({
        userId: user.id,
        analysisType: 'career_guidance',
        input: {
          userProgress,
          industryTrendsCount: industryTrends.length
        },
        output: guidance,
        confidence: 0.88
      });

      return guidance;
    } catch (error) {
      console.error("Error generating career guidance:", error);
      throw new Error("Failed to generate career guidance: " + (error as Error).message);
    }
  }

  async recommendCourses(
    user: User,
    userSkills: UserSkill[],
    availableCourses: Course[],
    limit: number = 10
  ): Promise<Course[]> {
    try {
      const prompt = `
        Recommend the most suitable courses for this learner.
        
        User Profile:
        - Academic Background: ${user.academicBackground || 'Not specified'}
        - Career Aspirations: ${user.careerAspirations || 'Not specified'}
        - Learning Pace: ${user.learningPace || 'moderate'}
        
        Current Skills:
        ${userSkills.map(skill => `- Skill ID ${skill.skillId}: ${skill.proficiencyLevel} (${skill.proficiencyScore}/100)`).join('\n')}
        
        Available Courses (provide course IDs for recommendations):
        ${availableCourses.map(course => 
          `ID: ${course.id} - ${course.title} (${course.skillLevel}, NSQF ${course.nsqfLevel}, ${course.category})`
        ).join('\n')}
        
        Return JSON with array of recommended course IDs in order of relevance:
        {
          "recommendedCourseIds": ["course_id_1", "course_id_2", ...],
          "reasoning": "Brief explanation of recommendation logic"
        }
        
        Limit to ${limit} recommendations.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an AI learning advisor. Recommend courses that best match the user's skill level, career goals, and learning preferences."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const recommendedIds = result.recommendedCourseIds || [];
      
      // Filter and return actual course objects
      return availableCourses.filter(course => recommendedIds.includes(course.id));
    } catch (error) {
      console.error("Error recommending courses:", error);
      // Fallback to simple filtering if AI fails
      return availableCourses
        .filter(course => {
          if (user.careerAspirations && course.description) {
            return course.description.toLowerCase().includes(user.careerAspirations.toLowerCase());
          }
          return true;
        })
        .slice(0, limit);
    }
  }
}

export const aiService = new AILearningService();
