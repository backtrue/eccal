import { Express, Request, Response } from 'express';
import { requireJWTAuth } from './jwtAuth';
import { db } from './db';
import { users, userCredits, userReferrals } from '@shared/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 允許的外部域名清單
const ALLOWED_ORIGINS = [
  'https://eccal.thinkwithblack.com',
  'https://audai.thinkwithblack.com',
  'https://quote.thinkwithblack.com',
  'https://sub3.thinkwithblack.com',
  'https://sub4.thinkwithblack.com',
  'https://sub5.thinkwithblack.com',
  'https://member.thinkwithblack.com',
  'http://localhost:3000', // 開發環境
  'http://localhost:5000', // 開發環境
];

// CORS 中間件
const corsMiddleware = (req: Request, res: Response, next: any) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // 詳細日誌用於診斷
  console.log('CORS check:', {
    origin,
    referer,
    method: req.method,
    url: req.url,
    allowedOrigins: ALLOWED_ORIGINS
  });
  
  // 檢查 origin 或 referer
  let isAllowed = false;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    isAllowed = true;
    res.header('Access-Control-Allow-Origin', origin);
  } else if (referer) {
    // 如果沒有 origin，檢查 referer
    const refererOrigin = new URL(referer).origin;
    if (ALLOWED_ORIGINS.includes(refererOrigin)) {
      isAllowed = true;
      res.header('Access-Control-Allow-Origin', refererOrigin);
    }
  }
  
  // 如果都沒有匹配，但是是開發環境，也允許
  if (!isAllowed && process.env.NODE_ENV === 'development') {
    console.log('Development mode: allowing all origins');
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
};

export function setupAccountCenterRoutes(app: Express) {
  // 應用 CORS 中間件到所有帳號中心路由
  app.use('/api/sso', corsMiddleware);
  app.use('/api/account-center', corsMiddleware);
  app.use('/api/auth', corsMiddleware);

  // ==================== SSO 認證端點 ====================
  
  /**
   * 單點登入 - 重定向到帳號中心登入頁面
   */
  app.get('/api/sso/login', (req: Request, res: Response) => {
    const { returnTo, origin } = req.query;
    const requestOrigin = (origin as string) || req.headers.origin || req.headers.referer;
    
    console.log('SSO login request:', {
      returnTo,
      origin,
      requestOrigin,
      headers: {
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent']
      }
    });
    
    // 驗證來源域名 - 更寬鬆的檢查
    if (requestOrigin) {
      try {
        const checkOrigin = requestOrigin.startsWith('http') ? requestOrigin : `https://${requestOrigin}`;
        const originUrl = new URL(checkOrigin);
        const originBase = `${originUrl.protocol}//${originUrl.hostname}`;
        
        if (!ALLOWED_ORIGINS.includes(originBase)) {
          console.log('Origin not allowed:', { requestOrigin, originBase, allowedOrigins: ALLOWED_ORIGINS });
          return res.status(403).json({ 
            error: 'Unauthorized origin',
            requestOrigin: originBase,
            allowedOrigins: ALLOWED_ORIGINS
          });
        }
      } catch (e) {
        console.log('Origin parsing error:', e.message);
      }
    }
    
    // 將 returnTo 和 origin 儲存到 session 或 state
    const state = Buffer.from(JSON.stringify({ 
      returnTo: returnTo || '/',
      origin: requestOrigin || req.headers.origin
    })).toString('base64');
    
    // 重定向到 Google OAuth 登入
    res.redirect(`/api/auth/google?state=${state}`);
  });

  /**
   * SSO 回調處理
   */
  app.get('/api/sso/callback', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const { state } = req.query;
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      // 解析 state 獲取 returnTo 和 origin
      let returnTo = '/';
      let origin = req.headers.origin;
      
      if (state) {
        try {
          const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
          returnTo = decodedState.returnTo || '/';
          origin = decodedState.origin || req.headers.origin;
        } catch (error) {
          console.error('Error decoding state:', error);
        }
      }
      
      // 生成新的 JWT Token 給外部網站使用 (包含 membership 和 credits)
      const token = jwt.sign(
        { 
          sub: user.id,
          email: user.email,
          name: user.name,
          membership: user.membershipLevel,
          credits: user.credits,
          iss: 'eccal.thinkwithblack.com',
          aud: origin
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // 構建回調 URL
      const callbackUrl = new URL(returnTo as string);
      callbackUrl.searchParams.set('token', token);
      callbackUrl.searchParams.set('user_id', user.id);
      
      res.redirect(callbackUrl.toString());
    } catch (error) {
      console.error('SSO callback error:', error);
      res.status(500).json({ error: 'SSO callback failed' });
    }
  });

  /**
   * 單點登出
   */
  app.post('/api/sso/logout', (req: Request, res: Response) => {
    const { returnTo, origin } = req.body;
    
    // 清除 Cookie
    res.clearCookie('jwt');
    
    // 如果有 returnTo，重定向回去
    if (returnTo) {
      res.redirect(returnTo);
    } else {
      res.json({ success: true, message: 'Logged out successfully' });
    }
  });

  // ==================== Google SSO 認證端點 ====================
  // 注意：Google SSO 端點已移至 server/index.ts 的高優先級位置
  // 這是為了避免在生產環境中被 Vite 靜態檔案服務攔截

  // ==================== Token 驗證端點 ====================
  
  /**
   * 驗證 JWT Token
   */
  app.post('/api/sso/verify-token', (req: Request, res: Response) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      res.json({ 
        success: true,
        valid: true, 
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          membership: decoded.membership,
          credits: decoded.credits
        }
      });
    } catch (error) {
      res.status(401).json({ 
        success: false,
        valid: false, 
        error: 'Invalid token' 
      });
    }
  });

  /**
   * 刷新 Token
   */
  app.post('/api/sso/refresh-token', requireJWTAuth, (req: Request, res: Response) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const newToken = jwt.sign(
      { 
        sub: user.id,
        email: user.email,
        name: user.name,
        membership: user.membershipLevel,
        credits: user.credits,
        iss: 'eccal.thinkwithblack.com'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token: newToken });
  });

  // ==================== 用戶資料 API ====================
  
  /**
   * 獲取用戶完整資料
   */
  app.get('/api/account-center/user/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // 支援通過 email 或 userId 查詢
      let user;
      if (userId.includes('@')) {
        // 如果是 email 格式，通過 email 查詢
        user = await db.query.users.findFirst({
          where: eq(users.email, userId)
        });
      } else {
        // 否則通過 userId 查詢
        user = await db.query.users.findFirst({
          where: eq(users.id, userId)
        });
      }
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: '用戶未找到',
          code: 'USER_NOT_FOUND' 
        });
      }
      
      // 返回符合 API 規格的回應
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          membership: user.membershipLevel || 'free',
          credits: user.credits || 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ 
        success: false,
        error: '無法獲取用戶資料',
        code: 'INTERNAL_ERROR' 
      });
    }
  });

  /**
   * 更新用戶資料
   */
  app.put('/api/account-center/user/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { name, profilePicture } = req.body;
      
      const updatedUser = await db.update(users)
        .set({ 
          name, 
          profilePicture,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (updatedUser.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ success: true, user: updatedUser[0] });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  /**
   * 獲取用戶會員資訊
   */
  app.get('/api/account-center/membership/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const membershipData = {
        userId,
        level: user.membershipLevel || 'free',
        expiresAt: user.membershipExpires,
        isActive: user.membershipLevel === 'pro' && 
                 (!user.membershipExpires || new Date(user.membershipExpires) > new Date()),
        features: user.membershipLevel === 'pro' ? [
          'unlimited_campaign_planner',
          'advanced_analytics',
          'priority_support'
        ] : [
          'basic_calculator',
          'limited_campaign_planner'
        ]
      };
      
      res.json(membershipData);
    } catch (error) {
      console.error('Error fetching membership:', error);
      res.status(500).json({ error: 'Failed to fetch membership data' });
    }
  });

  /**
   * 獲取用戶點數資訊
   */
  app.get('/api/account-center/credits/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // 支援通過 email 或 userId 查詢
      let user;
      if (userId.includes('@')) {
        user = await db.query.users.findFirst({
          where: eq(users.email, userId)
        });
      } else {
        user = await db.query.users.findFirst({
          where: eq(users.id, userId)
        });
      }
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: '用戶未找到',
          code: 'USER_NOT_FOUND' 
        });
      }
      
      res.json({
        success: true,
        userId: user.id,
        balance: user.credits || 0,
        email: user.email,
        lastUpdated: user.updatedAt
      });
    } catch (error) {
      console.error('Error fetching credits:', error);
      res.status(500).json({ 
        success: false,
        error: '無法獲取點數資訊',
        code: 'INTERNAL_ERROR' 
      });
    }
  });

  /**
   * 點數扣除端點
   */
  app.post('/api/account-center/credits/:userId/deduct', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { amount, reason, service } = req.body;
      
      // 驗證輸入
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: '扣除金額必須大於 0',
          code: 'INVALID_AMOUNT'
        });
      }
      
      // 支援通過 email 或 userId 查詢
      let user;
      if (userId.includes('@')) {
        user = await db.query.users.findFirst({
          where: eq(users.email, userId)
        });
      } else {
        user = await db.query.users.findFirst({
          where: eq(users.id, userId)
        });
      }
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用戶未找到',
          code: 'USER_NOT_FOUND'
        });
      }
      
      const currentCredits = user.credits || 0;
      
      // 檢查餘額是否足夠
      if (currentCredits < amount) {
        return res.status(400).json({
          success: false,
          error: '點數不足',
          code: 'INSUFFICIENT_CREDITS',
          currentCredits: currentCredits,
          requestedAmount: amount
        });
      }
      
      // 扣除點數
      const newCredits = currentCredits - amount;
      await db.update(users)
        .set({ credits: newCredits })
        .where(eq(users.id, user.id));
      
      // 生成交易 ID
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`點數扣除成功:`, {
        userId: user.id,
        email: user.email,
        deductedAmount: amount,
        remainingCredits: newCredits,
        reason,
        service,
        transactionId
      });
      
      res.json({
        success: true,
        remainingCredits: newCredits,
        deductedAmount: amount,
        transactionId,
        reason,
        service
      });
      
    } catch (error) {
      console.error('Error deducting credits:', error);
      res.status(500).json({
        success: false,
        error: '點數扣除失敗',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // ==================== 健康檢查端點 ====================
  
  /**
   * 帳號中心健康檢查
   */
  app.get('/api/account-center/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'account-center',
      version: '1.0.0'
    });
  });

  /**
   * 獲取允許的域名清單（用於外部網站驗證）
   */
  app.get('/api/account-center/allowed-origins', (req: Request, res: Response) => {
    res.json({ 
      origins: ALLOWED_ORIGINS,
      timestamp: new Date().toISOString()
    });
  });

  // 診斷端點 - 幫助調試 CORS 問題
  app.get('/api/account-center/debug', (req: Request, res: Response) => {
    const info = {
      timestamp: new Date().toISOString(),
      headers: req.headers,
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent'],
      allowedOrigins: ALLOWED_ORIGINS,
      method: req.method,
      url: req.url,
      query: req.query
    };
    
    console.log('Debug request:', info);
    res.json(info);
  });

  console.log('Account Center SSO routes initialized');
}