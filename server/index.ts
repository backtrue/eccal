import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Process monitoring and graceful shutdown
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，正在優雅關閉...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信號，正在優雅關閉...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('未捕獲的異常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', reason);
});

// Memory usage monitoring - optimized for lower overhead
const logMemoryUsage = () => {
  const usage = process.memoryUsage();
  const mb = (bytes: number) => Math.round(bytes / 1024 / 1024 * 100) / 100;
  
  // Only log if memory usage is concerning (>120MB heap)
  if (usage.heapUsed > 120 * 1024 * 1024) {
    console.log(`記憶體使用: RSS ${mb(usage.rss)}MB, Heap ${mb(usage.heapUsed)}/${mb(usage.heapTotal)}MB`);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
};

// Check memory usage every 60 minutes to reduce overhead
setInterval(logMemoryUsage, 60 * 60 * 1000);

// Trust proxy for production deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 選擇性緩存控制 - 只對 HTML 頁面禁用緩存，保留 API 回應的正常緩存
app.use((req, res, next) => {
  // 只對 HTML 頁面設置 no-cache，讓 API 回應保持可緩存
  if (req.path === '/' || req.path.endsWith('.html') || req.accepts('html')) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

// Authentication routes are now fully enabled

// 完全停用所有 logging - 讓系統靜默運行
app.use((req, res, next) => {
  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
