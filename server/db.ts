import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for better stability
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5, // 增加最大連線數
  min: 1, // 保持最少1個連線
  idleTimeoutMillis: 30000, // 30秒後關閉閒置連線
  connectionTimeoutMillis: 10000, // 10秒連線超時
  ssl: true, // 確保 SSL 連線
});
export const db = drizzle({ client: pool, schema });