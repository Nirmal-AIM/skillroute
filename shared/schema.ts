import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Legacy Replit Auth sessions table removed - using JWT authentication now

// User storage table with role-based authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Authentication fields
  role: varchar("role").notNull().default('learner'), // learner, trainer, policymaker
  passwordHash: varchar("password_hash").notNull(),
  surveyCompleted: boolean("survey_completed").default(false),
  lastLogin: timestamp("last_login"),
  failedLoginCount: integer("failed_login_count").default(0),
  // Additional fields for learning platform  
  academicBackground: varchar("academic_background"),
  currentRole: varchar("current_role"),
  careerAspirations: text("career_aspirations"),
  socioEconomicContext: varchar("socio_economic_context"),
  preferredLanguage: varchar("preferred_language").default('en'),
  learningPace: varchar("learning_pace").default('moderate'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skills table
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  nsqfLevel: integer("nsqf_level"),
  description: text("description"),
  industryDemand: decimal("industry_demand", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User skills (many-to-many relationship)
export const userSkills = pgTable("user_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  skillId: varchar("skill_id").notNull().references(() => skills.id),
  proficiencyLevel: varchar("proficiency_level").notNull(), // beginner, intermediate, advanced
  proficiencyScore: integer("proficiency_score"), // 0-100
  lastAssessed: timestamp("last_assessed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  provider: varchar("provider").notNull(),
  duration: varchar("duration"),
  nsqfLevel: integer("nsqf_level"),
  skillLevel: varchar("skill_level"), // beginner, intermediate, advanced
  category: varchar("category").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  tags: text("tags").array(),
  isCertified: boolean("is_certified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning pathways
export const learningPathways = pgTable("learning_pathways", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  targetRole: varchar("target_role"),
  estimatedDuration: varchar("estimated_duration"),
  difficulty: varchar("difficulty"),
  progress: integer("progress").default(0), // 0-100
  aiGenerated: boolean("ai_generated").default(false),
  courseIds: text("course_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User course enrollments
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  progress: integer("progress").default(0), // 0-100
  status: varchar("status").default('enrolled'), // enrolled, in_progress, completed, dropped
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Achievements/Badges
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  icon: varchar("icon").notNull(),
  category: varchar("category").notNull(),
  points: integer("points").default(0),
  requirements: jsonb("requirements"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Industry trends data
export const industryTrends = pgTable("industry_trends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sector: varchar("sector").notNull(),
  skillName: varchar("skill_name").notNull(),
  demandGrowth: decimal("demand_growth", { precision: 5, scale: 2 }),
  salaryRange: varchar("salary_range"),
  jobCount: integer("job_count"),
  location: varchar("location"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learner survey responses
export const learnerSurveys = pgTable("learner_surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  academicBackground: varchar("academic_background").notNull(),
  priorSkillsFreeform: text("prior_skills_freeform"),
  socioEconomicContext: varchar("socio_economic_context"),
  learningPace: varchar("learning_pace").notNull(),
  aspirations: text("aspirations").notNull(),
  priorSkillIds: text("prior_skill_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// NCVET qualifications data
export const ncvetQualifications = pgTable("ncvet_qualifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(),
  title: varchar("title").notNull(),
  sector: varchar("sector").notNull(),
  nsqfLevel: integer("nsqf_level").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// NSQF-based training programs
export const trainingPrograms = pgTable("training_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  provider: varchar("provider").notNull(),
  mode: varchar("mode").notNull(), // online, offline, hybrid
  duration: varchar("duration").notNull(),
  nsqfLevel: integer("nsqf_level").notNull(),
  sector: varchar("sector").notNull(),
  qualificationCodes: text("qualification_codes").array(),
  mappedSkillIds: text("mapped_skill_ids").array(),
  isCertified: boolean("is_certified").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job roles aligned with NSQF/NCVET
export const jobRoles = pgTable("job_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  sector: varchar("sector").notNull(),
  nsqfLevel: integer("nsqf_level").notNull(),
  qualificationCodes: text("qualification_codes").array(),
  description: text("description"),
  salaryRange: varchar("salary_range"),
  demandLevel: varchar("demand_level"), // high, medium, low
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Analysis results
export const aiAnalysis = pgTable("ai_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  analysisType: varchar("analysis_type").notNull(), // skill_gap, pathway_recommendation, career_guidance
  input: jsonb("input"),
  output: jsonb("output"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true, createdAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export const insertPathwaySchema = createInsertSchema(learningPathways).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, enrolledAt: true });
export const insertSurveySchema = createInsertSchema(learnerSurveys).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQualificationSchema = createInsertSchema(ncvetQualifications).omit({ id: true, createdAt: true });
export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms).omit({ id: true, createdAt: true });
export const insertJobRoleSchema = createInsertSchema(jobRoles).omit({ id: true, createdAt: true });

// Registration schema for new users
export const registerUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  role: z.enum(['learner', 'trainer', 'policymaker']).default('learner'),
});

// Login schema
export const loginUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Safe profile update schema (excludes security-sensitive fields)
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
  academicBackground: z.string().max(200).optional(),
  currentRole: z.string().max(100).optional(),
  careerAspirations: z.string().max(500).optional(),
  socioEconomicContext: z.string().max(200).optional(),
  preferredLanguage: z.string().max(10).optional(),
  learningPace: z.enum(['slow', 'moderate', 'fast']).optional(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type LearningPathway = typeof learningPathways.$inferSelect;
export type InsertPathway = z.infer<typeof insertPathwaySchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;
export type IndustryTrend = typeof industryTrends.$inferSelect;
export type AIAnalysis = typeof aiAnalysis.$inferSelect;
export type LearnerSurvey = typeof learnerSurveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type NCVETQualification = typeof ncvetQualifications.$inferSelect;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type JobRole = typeof jobRoles.$inferSelect;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;