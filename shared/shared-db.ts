
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as authSchema from "./auth-schema";

neonConfig.webSocketConstructor = ws;

// 共享資料庫連線 - 使用相同的 DATABASE_URL 或獨立的 SHARED_DATABASE_URL
const sharedDatabaseUrl = process.env.SHARED_DATABASE_URL || process.env.DATABASE_URL;

if (!sharedDatabaseUrl) {
  throw new Error(
    "SHARED_DATABASE_URL or DATABASE_URL must be set for shared authentication.",
  );
}

export const sharedPool = new Pool({ 
  connectionString: sharedDatabaseUrl,
  max: 2,
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});

export const sharedDb = drizzle({ 
  client: sharedPool, 
  schema: authSchema 
});

// 資料庫健康檢查
export async function checkSharedDbConnection() {
  try {
    const result = await sharedDb.select().from(authSchema.sharedUsers).limit(1);
    return { success: true, message: "Shared database connection OK" };
  } catch (error) {
    return { success: false, message: `Shared database connection failed: ${error}` };
  }
}
