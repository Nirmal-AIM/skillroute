import {
  users,
  skills,
  courses,
  learningPathways,
  enrollments,
  achievements,
  userAchievements,
  userSkills,
  industryTrends,
  aiAnalysis,
  type User,
  type UpsertUser,
  type Skill,
  type InsertSkill,
  type Course,
  type InsertCourse,
  type LearningPathway,
  type InsertPathway,
  type Enrollment,
  type InsertEnrollment,
  type Achievement,
  type UserSkill,
  type IndustryTrend,
  type AIAnalysis,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Skills operations
  getSkills(): Promise<Skill[]>;
  getSkillsByCategory(category: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getUserSkills(userId: string): Promise<UserSkill[]>;
  updateUserSkill(userId: string, skillId: string, proficiencyLevel: string, proficiencyScore: number): Promise<UserSkill>;

  // Courses operations
  getCourses(filters?: { category?: string; skillLevel?: string; nsqfLevel?: number; search?: string }): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  searchCourses(query: string): Promise<Course[]>;

  // Learning pathways
  getUserPathways(userId: string): Promise<LearningPathway[]>;
  createPathway(pathway: InsertPathway): Promise<LearningPathway>;
  updatePathwayProgress(id: string, progress: number): Promise<LearningPathway | undefined>;

  // Enrollments
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<Enrollment | undefined>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  awardAchievement(userId: string, achievementId: string): Promise<void>;

  // Industry trends
  getIndustryTrends(sector?: string): Promise<IndustryTrend[]>;

  // AI Analysis
  saveAIAnalysis(analysis: Omit<AIAnalysis, 'id' | 'createdAt'>): Promise<AIAnalysis>;
  getAIAnalysis(userId: string, analysisType?: string): Promise<AIAnalysis[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Skills operations
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(skills.name);
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.category, category)).orderBy(skills.name);
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return await db.select().from(userSkills).where(eq(userSkills.userId, userId));
  }

  async updateUserSkill(userId: string, skillId: string, proficiencyLevel: string, proficiencyScore: number): Promise<UserSkill> {
    const [updated] = await db
      .insert(userSkills)
      .values({ userId, skillId, proficiencyLevel, proficiencyScore })
      .onConflictDoUpdate({
        target: [userSkills.userId, userSkills.skillId],
        set: { proficiencyLevel, proficiencyScore, lastAssessed: new Date() }
      })
      .returning();
    return updated;
  }

  // Courses operations
  async getCourses(filters: any = {}): Promise<Course[]> {
    try {
      let query = db.select().from(courses);
      let whereConditions = [];

      if (filters.category && filters.category !== '') {
        whereConditions.push(eq(courses.category, filters.category));
      }
      if (filters.skillLevel && filters.skillLevel !== '') {
        whereConditions.push(eq(courses.skillLevel, filters.skillLevel));
      }
      if (filters.nsqfLevel && filters.nsqfLevel !== '') {
        whereConditions.push(eq(courses.nsqfLevel, parseInt(filters.nsqfLevel)));
      }
      if (filters.search && filters.search !== '') {
        whereConditions.push(
          sql`(LOWER(${courses.title}) LIKE LOWER(${`%${filters.search}%`}) OR 
               LOWER(${courses.description}) LIKE LOWER(${`%${filters.search}%`}) OR
               LOWER(${courses.provider}) LIKE LOWER(${`%${filters.search}%`}))`
        );
      }

      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }

      return await query.orderBy(desc(courses.createdAt));
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async searchCourses(query: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(
        or(
          ilike(courses.title, `%${query}%`),
          ilike(courses.description, `%${query}%`),
          ilike(courses.provider, `%${query}%`)
        )
      )
      .orderBy(desc(courses.createdAt));
  }

  // Learning pathways
  async getUserPathways(userId: string): Promise<LearningPathway[]> {
    return await db
      .select()
      .from(learningPathways)
      .where(eq(learningPathways.userId, userId))
      .orderBy(desc(learningPathways.createdAt));
  }

  async createPathway(pathway: InsertPathway): Promise<LearningPathway> {
    const [newPathway] = await db.insert(learningPathways).values(pathway).returning();
    return newPathway;
  }

  async updatePathwayProgress(id: string, progress: number): Promise<LearningPathway | undefined> {
    const [updated] = await db
      .update(learningPathways)
      .set({ progress, updatedAt: new Date() })
      .where(eq(learningPathways.id, id))
      .returning();
    return updated;
  }

  // Enrollments
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<Enrollment | undefined> {
    const [updated] = await db
      .update(enrollments)
      .set({ 
        progress,
        status: progress >= 100 ? 'completed' : 'in_progress',
        completedAt: progress >= 100 ? new Date() : null
      })
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
      .returning();
    return updated;
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).orderBy(achievements.title);
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const results = await db
      .select({
        id: achievements.id,
        title: achievements.title,
        description: achievements.description,
        icon: achievements.icon,
        category: achievements.category,
        points: achievements.points,
        requirements: achievements.requirements,
        createdAt: achievements.createdAt,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    return results;
  }

  async awardAchievement(userId: string, achievementId: string): Promise<void> {
    await db.insert(userAchievements).values({ userId, achievementId }).onConflictDoNothing();
  }

  // Industry trends
  async getIndustryTrends(sector?: string): Promise<IndustryTrend[]> {
    const query = db.select().from(industryTrends);
    const finalQuery = sector 
      ? query.where(eq(industryTrends.sector, sector))
      : query;

    return await finalQuery.orderBy(desc(industryTrends.updatedAt));
  }

  // AI Analysis
  async saveAIAnalysis(analysis: Omit<AIAnalysis, 'id' | 'createdAt'>): Promise<AIAnalysis> {
    const [saved] = await db.insert(aiAnalysis).values(analysis).returning();
    return saved;
  }

  async getAIAnalysis(userId: string, analysisType?: string): Promise<AIAnalysis[]> {
    const conditions = [eq(aiAnalysis.userId, userId)];

    if (analysisType) {
      conditions.push(eq(aiAnalysis.analysisType, analysisType));
    }

    return await db
      .select()
      .from(aiAnalysis)
      .where(and(...conditions))
      .orderBy(desc(aiAnalysis.createdAt));
  }

  async initializeDatabase() {
    console.log("Initializing database with sample data...");

    // Add sample skills
    const sampleSkills = [
      { name: "Python Programming", category: "Programming", nsqfLevel: 5, description: "Programming in Python language", industryDemand: "95.5" },
      { name: "Data Analysis", category: "Analytics", nsqfLevel: 6, description: "Analyzing data using statistical methods", industryDemand: "92.3" },
      { name: "Machine Learning", category: "AI/ML", nsqfLevel: 7, description: "Building and training ML models", industryDemand: "88.7" },
      { name: "SQL Database Management", category: "Database", nsqfLevel: 5, description: "Managing relational databases", industryDemand: "89.2" },
      { name: "JavaScript Development", category: "Programming", nsqfLevel: 5, description: "Frontend and backend JavaScript development", industryDemand: "91.8" },
    ];

    for (const skill of sampleSkills) {
      try {
        await db.insert(skills).values(skill).onConflictDoNothing();
      } catch (error) {
        console.error("Error inserting skill:", error);
      }
    }

    // Add sample courses
    const sampleCourses = [
      {
        title: "Python for Data Analysis",
        description: "Comprehensive introduction to data analysis using Python and pandas. Learn to manipulate, analyze, and visualize data effectively.",
        provider: "DataCamp",
        duration: "8 weeks",
        skillLevel: "beginner",
        nsqfLevel: 4,
        category: "Data Analytics",
        isCertified: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        tags: ["python", "data analysis", "pandas", "visualization"]
      },
      {
        title: "Advanced Machine Learning",
        description: "Deep dive into ML algorithms, neural networks, and practical implementation using TensorFlow and PyTorch.",
        provider: "AI Academy",
        duration: "12 weeks",
        skillLevel: "advanced",
        nsqfLevel: 7,
        category: "AI & Machine Learning",
        isCertified: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        tags: ["machine learning", "tensorflow", "neural networks", "ai"]
      },
      {
        title: "Web Development Fundamentals",
        description: "Learn HTML, CSS, JavaScript, and modern web development practices including responsive design and frameworks.",
        provider: "CodeCraft",
        duration: "10 weeks",
        skillLevel: "intermediate",
        nsqfLevel: 5,
        category: "Software Development",
        isCertified: false,
        thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        tags: ["html", "css", "javascript", "responsive design"]
      },
      {
        title: "Digital Marketing Strategy",
        description: "Master digital marketing including SEO, social media marketing, content marketing, and analytics.",
        provider: "Marketing Pro",
        duration: "6 weeks",
        skillLevel: "beginner",
        nsqfLevel: 3,
        category: "Digital Marketing",
        isCertified: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        tags: ["seo", "social media", "content marketing", "analytics"]
      },
      {
        title: "Cybersecurity Fundamentals",
        description: "Introduction to cybersecurity principles, threat detection, and security best practices for organizations.",
        provider: "SecureLearn",
        duration: "8 weeks",
        skillLevel: "intermediate",
        nsqfLevel: 6,
        category: "Cybersecurity",
        isCertified: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        tags: ["security", "threat detection", "network security", "compliance"]
      },
      {
        title: "Cloud Computing with AWS",
        description: "Learn Amazon Web Services including EC2, S3, Lambda, and cloud architecture best practices.",
        provider: "CloudTech",
        duration: "10 weeks",
        skillLevel: "intermediate",
        nsqfLevel: 6,
        category: "Cloud Computing",
        isCertified: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
        tags: ["aws", "cloud computing", "ec2", "lambda"]
      }
    ];

    for (const course of sampleCourses) {
      try {
        await db.insert(courses).values(course).onConflictDoNothing();
      } catch (error) {
        console.error("Error inserting course:", error);
      }
    }
  }
}

export const storage = new DatabaseStorage();

// Export the initialization function for use in index.ts
export const initializeDatabase = () => storage.initializeDatabase();