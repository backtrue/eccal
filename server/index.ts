import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Ultimate solution: Completely silence TimeoutOverflowWarning at system level
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name !== 'TimeoutOverflowWarning') {
    console.warn(warning);
  }
});

// Comprehensive error filtering to eliminate proxy connection noise
const originalConsoleError = console.error;
const originalStderrWrite = process.stderr.write;

console.error = function(message: any, ...args: any[]) {
  // Filter out all Vite proxy connection errors
  const messageStr = String(message);
  if (messageStr.includes('connect: connection refused') || 
      messageStr.includes('ECONNREFUSED') ||
      messageStr.includes('dial tcp 127.0.0.1:5000') ||
      messageStr.includes('error proxying request') ||
      messageStr.includes('starting up user application')) {
    return; // Silently ignore these connection errors
  }
  originalConsoleError(message, ...args);
};

// Also intercept direct stderr writes
process.stderr.write = function(chunk: any, encoding?: any, callback?: any) {
  const chunkStr = String(chunk);
  if (chunkStr.includes('connect: connection refused') || 
      chunkStr.includes('ECONNREFUSED') ||
      chunkStr.includes('dial tcp 127.0.0.1:5000') ||
      chunkStr.includes('error proxying request') ||
      chunkStr.includes('starting up user application')) {
    // Silently ignore proxy connection errors
    if (typeof encoding === 'function') {
      encoding(); // Call callback if encoding is actually callback
    } else if (callback) {
      callback();
    }
    return true;
  }
  return originalStderrWrite.call(process.stderr, chunk, encoding, callback);
};

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
  
  // Force garbage collection every time to maintain lower memory
  if (global.gc) {
    global.gc();
  }
  
  const newUsage = process.memoryUsage();
  
  // Only log if memory usage is still concerning after GC (>150MB RSS)
  if (newUsage.rss > 150 * 1024 * 1024) {
    console.log(`記憶體使用 (GC後): RSS ${mb(newUsage.rss)}MB, Heap ${mb(newUsage.heapUsed)}/${mb(newUsage.heapTotal)}MB`);
  }
};

// Check memory usage every 2 hours to reduce overhead
setInterval(logMemoryUsage, 2 * 60 * 60 * 1000);

// Trust proxy for production deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Request monitoring for debugging (no blocking)
app.use((req: Request, res: Response, next: NextFunction) => {
  // Only log auth endpoint requests for monitoring
  if (req.path === '/api/auth/user') {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    console.log(`[DEBUG] Auth request: IP=${clientIP}, UA=${userAgent.substring(0, 50)}...`);
  }
  
  next();
});

app.use(express.json({ 
  limit: '10mb',
  // Custom reviver to handle large integers safely
  reviver: (key: string, value: any) => {
    if (typeof value === 'number' && value > 2147483647) {
      return 2147483647; // Cap large numbers
    }
    return value;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

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

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error for debugging but don't throw - this was causing service instability
    console.error(`[ERROR] ${req.method} ${req.path}:`, {
      status,
      message,
      userAgent: req.headers['user-agent']?.substring(0, 50),
      ip: req.ip
    });

    // Send error response without throwing - prevents service crashes
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
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
