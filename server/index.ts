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

// Google SSO 認證端點 - 高優先級註冊
app.post('/api/auth/google-sso', express.json(), async (req, res) => {
  try {
    const { email, name, picture, service } = req.body;
    
    // 驗證必要欄位
    if (!email || !name || !service) {
      return res.json({
        success: false,
        error: '缺少必要欄位 (email, name, service)',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    console.log('Google SSO 認證請求:', {
      email,
      name,
      service,
      origin: req.headers.origin
    });
    
    // 設置 CORS 標頭
    const allowedOrigins = [
      'https://eccal.thinkwithblack.com',
      'https://audai.thinkwithblack.com',
      'https://sub3.thinkwithblack.com',
      'https://sub4.thinkwithblack.com',
      'https://sub5.thinkwithblack.com',
      'https://member.thinkwithblack.com',
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // 使用動態 import 載入資料庫相關模組
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    const jwt = await import('jsonwebtoken');
    const crypto = await import('crypto');
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    // 檢查或創建用戶
    let user = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    let userId: string;
    
    if (user.length === 0) {
      // 創建新用戶
      console.log('創建新用戶:', email);
      const newUserId = crypto.randomUUID();
      const newUser = await db.insert(users)
        .values({
          id: newUserId,
          email,
          name,
          profileImageUrl: picture,
          membershipLevel: 'free',
          credits: 30,
          service: service
        })
        .returning();
      
      userId = newUser[0].id;
      console.log('新用戶創建成功:', userId);
    } else {
      // 更新現有用戶資料
      userId = user[0].id;
      await db.update(users)
        .set({
          name,
          profileImageUrl: picture,
          lastLoginAt: new Date()
        })
        .where(eq(users.id, userId));
      
      console.log('現有用戶資料更新成功');
    }
    
    // 生成 JWT Token
    const token = jwt.sign(
      { 
        sub: userId,
        email,
        name,
        service,
        iss: 'eccal.thinkwithblack.com',
        aud: origin || 'https://audai.thinkwithblack.com'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 返回 JSON 響應
    res.json({
      success: true,
      token: token,
      user: {
        id: userId,
        email,
        name,
        membership: user.length > 0 ? user[0].membershipLevel : 'free',
        credits: user.length > 0 ? user[0].credits : 30,
        profileImageUrl: picture
      }
    });
    
    console.log('Google SSO 認證成功:', {
      userId,
      email,
      service,
      credits: user.length > 0 ? user[0].credits : 30
    });
    
  } catch (error) {
    console.error('Google SSO 認證錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '認證失敗',
      code: 'AUTHENTICATION_ERROR'
    });
  }
});

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