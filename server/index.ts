import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy for production deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 超級詳細的攔截器 - 記錄所有可能的信息
app.use('/api/auth', (req, res) => {
  console.error(`=== 🚫 AUTH REQUEST BLOCKED ===`);
  console.error(`Time: ${new Date().toISOString()}`);
  console.error(`Method: ${req.method}`);
  console.error(`Path: ${req.path}`);
  console.error(`Full URL: ${req.url}`);
  console.error(`Headers:`, JSON.stringify(req.headers, null, 2));
  console.error(`Body:`, req.body);
  console.error(`Query:`, req.query);
  console.error(`IP: ${req.ip}`);
  console.error(`Socket Remote Address: ${req.socket.remoteAddress}`);
  console.error(`Connection Info:`, {
    localAddress: req.socket.localAddress,
    localPort: req.socket.localPort,
    remoteFamily: req.socket.remoteFamily,
    remotePort: req.socket.remotePort
  });
  console.error(`=== END AUTH REQUEST ===`);
  res.status(404).json({ error: 'Authentication system disabled' });
});

// 也攔截 /user 路徑 (因為 log 顯示的是 /user 而不是 /api/auth/user)
app.use('/user', (req, res) => {
  console.error(`=== 🚫 /user REQUEST BLOCKED ===`);
  console.error(`Time: ${new Date().toISOString()}`);
  console.error(`Method: ${req.method}`);
  console.error(`Path: ${req.path}`);
  console.error(`Headers:`, JSON.stringify(req.headers, null, 2));
  console.error(`=== END /user REQUEST ===`);
  res.status(404).json({ error: 'User endpoint disabled' });
});

// 完全停用所有 middleware 和 logging
app.use((req, res, next) => {
  // 直接通過，不做任何處理
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
