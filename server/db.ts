import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3, // 進一步減少最大連線數
  min: 0, // 允許沒有最小連線
  idleTimeoutMillis: 20000, // 20秒後關閉閒置連線
  connectionTimeoutMillis: 3000, // 3秒連線超時
});
export const db = drizzle({ client: pool, schema });