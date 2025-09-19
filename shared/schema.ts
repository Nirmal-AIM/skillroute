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

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
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
