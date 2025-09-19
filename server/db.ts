import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use a fallback connection string if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || process.env.REPLIT_DB_URL;

if (!databaseUrl) {
  console.warn("Warning: No database URL found. Using fallback connection.");
  // Use a fallback that won't crash the app
  const fallbackUrl = "postgresql://user:password@localhost:5432/fallback_db";
  process.env.DATABASE_URL = fallbackUrl;
}

export const pool = new Pool({ connectionString: databaseUrl || process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });