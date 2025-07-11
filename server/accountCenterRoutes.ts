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
      
      // 生成新的 JWT Token 給外部網站使用
      const token = jwt.sign(
        { 
          sub: user.id,
          email: user.email,
          name: user.name,
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
  
  /**
   * Google SSO 認證端點
   * 專門為子域名服務提供的 Google OAuth 整合
   */
  app.post('/api/auth/google-sso', async (req: Request, res: Response) => {
    try {
      const { email, name, picture, service } = req.body;
      
      // 驗證必要欄位
      if (!email || !name || !service) {
        return res.status(400).json({
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
      
      // 檢查或創建用戶
      let user = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      let userId: string;
      
      if (user.length === 0) {
        // 創建新用戶
        console.log('創建新用戶:', email);
        const newUserId = crypto.randomUUID(); // 生成唯一 ID
        const newUser = await db.insert(users)
          .values({
            id: newUserId,
            email,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || '',
            profileImageUrl: picture,
            membershipLevel: 'free',
            membershipExpires: null,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        userId = newUser[0].id;
        
        // 為新用戶創建初始點數記錄
        await db.insert(userCredits)
          .values({
            userId: userId,
            totalEarned: 30, // 新用戶贈送 30 點
            totalSpent: 0,
            balance: 30,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        
        console.log('新用戶創建成功，贈送 30 點數');
      } else {
        userId = user[0].id;
        
        // 更新現有用戶資料
        await db.update(users)
          .set({
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || '',
            profileImageUrl: picture,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
        
        console.log('現有用戶資料更新成功');
      }
      
      // 獲取完整的用戶資料
      const fullUser = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (fullUser.length === 0) {
        return res.status(500).json({
          success: false,
          error: '用戶資料獲取失敗',
          code: 'USER_DATA_ERROR'
        });
      }
      
      // 獲取用戶點數
      const userCreditsData = await db.select()
        .from(userCredits)
        .where(eq(userCredits.userId, userId))
        .limit(1);
      
      const credits = userCreditsData.length > 0 ? userCreditsData[0].balance : 0;
      
      // 生成 JWT Token
      const token = jwt.sign(
        {
          sub: userId,
          email: fullUser[0].email,
          name: fullUser[0].name,
          service: service,
          iss: 'eccal.thinkwithblack.com',
          aud: req.headers.origin || 'unknown'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // 準備回應資料
      const responseData = {
        success: true,
        token,
        user: {
          id: userId,
          email: fullUser[0].email,
          name: fullUser[0].name,
          membership: fullUser[0].membershipLevel || 'Free',
          credits: credits,
          profileImageUrl: fullUser[0].picture
        }
      };
      
      console.log('Google SSO 認證成功:', {
        userId,
        email: fullUser[0].email,
        service,
        credits
      });
      
      res.json(responseData);
      
    } catch (error) {
      console.error('Google SSO 認證錯誤:', error);
      res.status(500).json({
        success: false,
        error: '認證處理失敗',
        code: 'AUTHENTICATION_ERROR'
      });
    }
  });

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
        valid: true, 
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name
        }
      });
    } catch (error) {
      res.status(401).json({ valid: false, error: 'Invalid token' });
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
      
      // 獲取用戶基本資料
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // 獲取用戶點數
      const credits = await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, userId)
      });
      
      // 會員資訊已包含在 user 資料中
      
      // 獲取推薦統計
      const referralStats = await db.query.userReferrals.findMany({
        where: eq(userReferrals.referrerId, userId)
      });
      
      const userData = {
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        profilePicture: user.profileImageUrl,
        credits: credits?.balance || 0,
        membership: {
          level: user.membershipLevel || 'free',
          expiresAt: user.membershipExpires,
          isActive: user.membershipLevel === 'pro' && 
                   (!user.membershipExpires || new Date(user.membershipExpires) > new Date())
        },
        referrals: {
          count: referralStats.length,
          totalEarned: referralStats.reduce((sum, ref) => sum + (ref.creditAwarded ? 50 : 0), 0)
        },
        analytics: {
          googleAccessToken: user.googleAccessToken ? '已連接' : null
        },
        facebook: {
          metaAccessToken: user.metaAccessToken ? '已連接' : null,
          metaAdAccountId: user.metaAdAccountId
        }
      };
      
      res.json(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
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
      
      const credits = await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, userId)
      });
      
      const creditsData = {
        userId,
        balance: credits?.balance || 0,
        earned: credits?.earned || 0,
        spent: credits?.spent || 0,
        lastUpdated: credits?.updatedAt
      };
      
      res.json(creditsData);
    } catch (error) {
      console.error('Error fetching credits:', error);
      res.status(500).json({ error: 'Failed to fetch credits data' });
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