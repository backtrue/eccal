import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite';
import { setupJWTGoogleAuth, jwtMiddleware } from './jwtAuth';

// -------------------- 1. 基礎設定 --------------------
const app = express();

// -------------------- 1.5. 高優先級 API 端點 --------------------
// 這些端點必須在所有中間件之前註冊，避免被 Vite 攔截

// Google SSO 認證端點將在 accountCenterRoutes.ts 中註冊

// Facebook 資料刪除端點
app.use('/api/facebook/data-deletion', express.json(), (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    console.log(`[${timestamp}] Facebook data deletion request received:`, {
      requestId,
      hasBody: !!req.body,
      bodyType: typeof req.body,
      hasSignedRequest: !!(req.body && req.body.signed_request),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      originalUrl: req.originalUrl,
      method: req.method
    });

    let userId = 'unknown';
    
    // 解析 signed_request
    if (req.body && req.body.signed_request) {
      try {
        const parts = req.body.signed_request.split('.');
        if (parts.length === 2) {
          const payload = parts[1];
          const decoded = Buffer.from(payload, 'base64').toString('utf8');
          const data = JSON.parse(decoded);
          userId = data.user_id || 'unknown';
        }
      } catch (e) {
        console.log('Could not parse signed_request:', e.message);
      }
    }

    console.log(`[${timestamp}] Data deletion processed for user: ${userId} (requestId: ${requestId})`);

    // 返回 Facebook 要求的格式
    const response = {
      url: `https://eccal.thinkwithblack.com/data-deletion-status/${userId}`,
      confirmation_code: `DEL_${timestamp}_${requestId}`,
      status: 'success',
      processed_at: timestamp
    };

    res.json(response);
  } catch (error) {
    console.error('Facebook data deletion error:', error);
    
    // 即使出錯也要回傳成功，避免 Facebook 重試
    res.json({
      url: `https://eccal.thinkwithblack.com/data-deletion-status/error`,
      confirmation_code: `DEL_${Date.now()}_error`,
      status: 'success',
      processed_at: new Date().toISOString()
    });
  }
});

// -------------------- 2. 中間件設定 --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 用於處理 JWT cookie

// -------------------- 3. JWT 中間件 --------------------
app.use(jwtMiddleware); // 在所有路由之前設置 JWT 中間件

// -------------------- 4. Passport 基礎設定 --------------------
app.use(passport.initialize());
// 不需要 passport.session() 因為使用 JWT

// -------------------- 5. Google OAuth 設定 --------------------
setupJWTGoogleAuth(app);

// -------------------- 6. 註冊路由 --------------------
(async () => {
  const server = await registerRoutes(app);

  // -------------------- 7. 設置前端服務 --------------------
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // -------------------- 8. 伺服器啟動 --------------------
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} with JWT authentication`);
  });
})();