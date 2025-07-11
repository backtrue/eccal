import { Express, Request, Response } from 'express';
import { requireJWTAuth } from './jwtAuth';
import { db } from './db';
import { users, userCredits, userReferrals } from '@shared/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 允許的外部域名清單
const ALLOWED_ORIGINS = [
  'https://eccal.thinkwithblack.com',
  'https://audai.thinkwithblack.com',
  'https://site-a.com',
  'https://site-b.com',
  'http://localhost:3000', // 開發環境
  'http://localhost:5000', // 開發環境
];

// CORS 中間件
const corsMiddleware = (req: Request, res: Response, next: any) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
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

  // ==================== SSO 認證端點 ====================
  
  /**
   * 單點登入 - 重定向到帳號中心登入頁面
   */
  app.get('/api/sso/login', (req: Request, res: Response) => {
    const { returnTo, origin } = req.query;
    
    // 驗證來源域名
    if (origin && !ALLOWED_ORIGINS.includes(origin as string)) {
      return res.status(403).json({ error: 'Unauthorized origin' });
    }
    
    // 將 returnTo 和 origin 儲存到 session 或 state
    const state = Buffer.from(JSON.stringify({ 
      returnTo: returnTo || '/',
      origin: origin || req.headers.origin
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

  console.log('Account Center SSO routes initialized');
}