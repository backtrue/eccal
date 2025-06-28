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
  max: 2, // 最小連線池大小
  min: 0, // 無最小連線
  idleTimeoutMillis: 10000, // 10秒後關閉閒置連線
  connectionTimeoutMillis: 2000, // 2秒連線超時
});
export const db = drizzle({ client: pool, schema });