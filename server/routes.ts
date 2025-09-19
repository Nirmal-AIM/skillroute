import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./openai";
import { z } from "zod";
import { insertUserSchema, insertCourseSchema, insertPathwaySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = insertUserSchema.parse(req.body);
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        ...updateData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Skills routes
  app.get('/api/skills', async (req, res) => {
    try {
      const { category } = req.query;
      const skills = category 
        ? await storage.getSkillsByCategory(category as string)
        : await storage.getSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get('/api/user/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userSkills = await storage.getUserSkills(userId);
      res.json(userSkills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user skills" });
    }
  });

  app.post('/api/user/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { skillId, proficiencyLevel, proficiencyScore } = req.body;
      
      const userSkill = await storage.updateUserSkill(userId, skillId, proficiencyLevel, proficiencyScore);
      res.json(userSkill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user skill" });
    }
  });

  // Courses routes
  app.get('/api/courses', async (req, res) => {
    try {
      const { category, skillLevel, nsqfLevel, search } = req.query;
      
      const filters: any = {};
      if (category && category !== '') filters.category = category as string;
      if (skillLevel && skillLevel !== '') filters.skillLevel = skillLevel as string;  
      if (nsqfLevel && nsqfLevel !== '') filters.nsqfLevel = nsqfLevel as string;
      if (search && search !== '') filters.search = search as string;
      
      const courses = await storage.getCourses(filters);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // AI-powered recommendations
  app.post('/api/ai/skill-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetRole } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userSkills = await storage.getUserSkills(userId);
      const availableSkills = await storage.getSkills();
      
      const analysis = await aiService.analyzeSkillGap(user, userSkills, availableSkills, targetRole);
      res.json(analysis);
    } catch (error) {
      console.error("Error in skill analysis:", error);
      res.status(500).json({ message: "Failed to analyze skills" });
    }
  });

  app.post('/api/ai/generate-pathway', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { skillGapAnalysis, targetRole } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const availableCourses = await storage.getCourses();
      const pathway = await aiService.generateLearningPathway(user, skillGapAnalysis, availableCourses, targetRole);
      
      // Save the pathway
      const savedPathway = await storage.createPathway({
        userId,
        title: pathway.title,
        description: pathway.description,
        targetRole,
        estimatedDuration: pathway.duration,
        difficulty: pathway.difficulty,
        aiGenerated: true,
        courseIds: pathway.courses.map(c => c.title) // Store course titles for now
      });
      
      res.json({ pathway, savedPathway });
    } catch (error) {
      console.error("Error generating pathway:", error);
      res.status(500).json({ message: "Failed to generate pathway" });
    }
  });

  app.get('/api/ai/course-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userSkills = await storage.getUserSkills(userId);
      const availableCourses = await storage.getCourses();
      
      const recommendations = await aiService.recommendCourses(user, userSkills, availableCourses, limit);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting course recommendations:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  // Learning pathways
  app.get('/api/pathways', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pathways = await storage.getUserPathways(userId);
      res.json(pathways);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pathways" });
    }
  });

  app.post('/api/pathways', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pathwayData = insertPathwaySchema.parse({ ...req.body, userId });
      
      const pathway = await storage.createPathway(pathwayData);
      res.json(pathway);
    } catch (error) {
      res.status(400).json({ message: "Failed to create pathway" });
    }
  });

  // Enrollments
  app.get('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.body;
      
      const enrollment = await storage.createEnrollment({ userId, courseId });
      res.json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.put('/api/enrollments/:courseId/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.params;
      const { progress } = req.body;
      
      const enrollment = await storage.updateEnrollmentProgress(userId, courseId, progress);
      res.json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Achievements
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/user/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Industry trends
  app.get('/api/industry-trends', async (req, res) => {
    try {
      const { sector } = req.query;
      const trends = await storage.getIndustryTrends(sector as string);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch industry trends" });
    }
  });

  // Dashboard analytics
  app.get('/api/dashboard/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [enrollments, pathways, userSkills, achievements] = await Promise.all([
        storage.getUserEnrollments(userId),
        storage.getUserPathways(userId),
        storage.getUserSkills(userId),
        storage.getUserAchievements(userId)
      ]);

      const completedCourses = enrollments.filter(e => e.status === 'completed').length;
      const inProgressCourses = enrollments.filter(e => e.status === 'in_progress').length;
      const averageProgress = enrollments.length > 0 
        ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length 
        : 0;
      const averageSkillScore = userSkills.length > 0
        ? userSkills.reduce((sum, s) => sum + (s.proficiencyScore || 0), 0) / userSkills.length
        : 0;

      res.json({
        totalEnrollments: enrollments.length,
        completedCourses,
        inProgressCourses,
        totalPathways: pathways.length,
        totalSkills: userSkills.length,
        badgesEarned: achievements.length,
        averageProgress: Math.round(averageProgress),
        averageSkillScore: Math.round(averageSkillScore),
        studyTimeThisMonth: Math.floor(Math.random() * 50) + 20, // Placeholder - would be tracked
        industryAlignment: Math.round(averageSkillScore * 0.85)
      });
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
