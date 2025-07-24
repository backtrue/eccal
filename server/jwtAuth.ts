import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import type { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// JWT 設定
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // 7天有效期

// JWT 用戶介面
interface JWTUser {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  googleAccessToken?: string | null;
  googleRefreshToken?: string | null;
  tokenExpiresAt?: Date | null;
}

// JWT 工具函數
export const jwtUtils = {
  // 生成 JWT token
  generateToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        sub: user.id // 標準 JWT subject claim
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  // 驗證 JWT token
  verifyToken(token: string): JWTUser | null {
    try {
      // 檢查 token 格式
      if (!token || typeof token !== 'string') {
        console.log('JWT verification failed: invalid token format');
        return null;
      }
      
      // 清理 token（移除可能的前綴或空白）
      const cleanToken = token.trim();
      if (cleanToken.length === 0) {
        console.log('JWT verification failed: empty token');
        return null;
      }
      
      const decoded = jwt.verify(cleanToken, JWT_SECRET) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        profileImageUrl: decoded.profileImageUrl,
        sub: decoded.sub
      } as JWTUser;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  },

  // 從 request 中提取 JWT token
  extractTokenFromRequest(req: Request): string | null {
    // 1. 從 Authorization header 中提取
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. 從 cookie 中提取
    const cookieToken = req.cookies?.auth_token;
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }
};

// JWT 中間件
export async function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = jwtUtils.extractTokenFromRequest(req);
  
  if (token) {
    const jwtUser = jwtUtils.verifyToken(token);
    if (jwtUser) {
      // 從資料庫重新載入最新的用戶資料（包括 Facebook access token）
      try {
        const { storage } = await import('./storage');
        const fullUser = await storage.getUser(jwtUser.id);
        if (fullUser) {
          console.log('JWT middleware: User loaded from database:', fullUser.email);
          (req as any).user = fullUser;
          (req as any).isAuthenticated = () => true;
        } else {
          // 如果資料庫中找不到用戶，使用 JWT 中的基本資料
          console.log('JWT middleware: User not found in database, using JWT data:', jwtUser.email);
          (req as any).user = jwtUser;
          (req as any).isAuthenticated = () => true;
        }
      } catch (error) {
        console.error('Error loading user from database:', error);
        // 發生錯誤時，使用 JWT 中的基本資料
        console.log('JWT middleware: Database error, falling back to JWT data:', jwtUser.email);
        (req as any).user = jwtUser;
        (req as any).isAuthenticated = () => true;
      }
    }
  }

  next();
}

// 需要認證的路由保護中間件
export function requireJWTAuth(req: Request, res: Response, next: NextFunction) {
  if ((req as any).user) {
    return next();
  }

  res.status(401).json({ error: 'Authentication required' });
}

// 設置 JWT 為主的 Google OAuth 認證
export function setupJWTGoogleAuth(app: Express) {
  const getBaseUrl = (req?: any) => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://eccal.thinkwithblack.com';
    }
    
    // 在 Replit 環境中，使用實際的外部 URL
    if (req && req.get('host') && req.get('host').includes('replit.dev')) {
      return `${req.protocol}://${req.get('host')}`;
    }
    
    return req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:5000';
  };

  // Google OAuth Strategy (保持相同)
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? "https://eccal.thinkwithblack.com/api/auth/google/callback"
      : "/api/auth/google/callback",
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/analytics.readonly'
    ]
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await storage.upsertUser({
        id: profile.id,
        email: profile.emails?.[0]?.value || null,
        firstName: profile.name?.givenName || null,
        lastName: profile.name?.familyName || null,
        profileImageUrl: profile.photos?.[0]?.value || null,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        tokenExpiresAt: new Date(Math.min(Date.now() + 3600000, 2147483647)),
      });

      return done(null, user || false);
    } catch (error) {
      return done(error, false);
    }
  }));

  // 簡化的 serialize/deserialize (JWT 不需要)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth 起始點
  app.get('/api/auth/google', (req, res, next) => {
    console.log('[GOOGLE-OAUTH] Starting Google OAuth with JWT');
    
    // 防止無限重定向循環
    const userAgent = req.get('User-Agent') || '';
    if (userAgent.includes('HeadlessChrome') || userAgent.includes('bot')) {
      console.log('[GOOGLE-OAUTH] Blocking OAuth for automated request');
      return res.status(400).json({ error: 'OAuth not available for automated requests' });
    }
    
    // 儲存 returnTo 參數到 req 物件 (因為沒有 session)
    const returnTo = req.query.returnTo as string || req.get('Referer') || '/';
    console.log('[GOOGLE-OAUTH] Saving returnTo in request:', returnTo);
    
    // 將 returnTo 作為 state 參數傳遞
    const state = Buffer.from(JSON.stringify({ returnTo })).toString('base64');
    
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent',
      state: state
    })(req, res, next);
  });

  // Google OAuth 回調 - 生成 JWT
  app.get('/api/auth/google/callback', (req, res, next) => {
    console.log('Google OAuth callback with JWT');
    
    passport.authenticate('google', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.status(500).send('Authentication failed');
      }

      if (!user) {
        console.error('Google OAuth failed - no user returned:', info);
        return res.status(401).send('Authentication failed');
      }

      try {
        // 生成 JWT token
        const token = jwtUtils.generateToken(user);
        
        // 設置 httpOnly cookie (更安全)
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
          path: '/' // 確保整個網站都能訪問 cookie
        };
        
        console.log('Setting JWT cookie with options:', cookieOptions);
        res.cookie('auth_token', token, cookieOptions);

        // 處理推薦碼 (如果有)
        // Note: 這裡需要從 query 或其他地方獲取推薦碼
        // 因為沒有 session，我們可以用 query parameter 或其他方式

        console.log('JWT token generated for user:', user.id);

        const baseUrl = getBaseUrl(req);
        
        // 從 state 參數中解析 returnTo
        let returnTo = '/';
        try {
          const stateParam = req.query.state as string;
          if (stateParam) {
            const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString());
            returnTo = decoded.returnTo || '/';
          }
        } catch (error) {
          console.error('Error parsing state parameter:', error);
          returnTo = '/';
        }
        
        console.log('Extracted returnTo from state:', returnTo);
        
        let redirectUrl: string;
        if (returnTo.startsWith('http')) {
          redirectUrl = `${returnTo}${returnTo.includes('?') ? '&' : '?'}auth_success=1`;
        } else {
          const cleanPath = returnTo.startsWith('/') ? returnTo : `/${returnTo}`;
          redirectUrl = `${baseUrl}${cleanPath}${cleanPath.includes('?') ? '&' : '?'}auth_success=1`;
        }

        console.log('Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('JWT generation error:', error);
        const baseUrl = getBaseUrl(req);
        res.redirect(`${baseUrl}/?error=auth_failed`);
      }
    })(req, res, next);
  });

  // 登出 - 清除 JWT cookie
  app.get('/api/auth/logout', (req, res) => {
    console.log('Clearing JWT cookie for logout');
    res.clearCookie('auth_token', { path: '/' });
    const baseUrl = getBaseUrl(req);
    res.redirect(`${baseUrl}/`);
  });

  // 清除 cookie 測試端點 (僅開發環境)
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/auth/clear-cookie', (req, res) => {
      console.log('Clearing JWT cookie for testing');
      res.clearCookie('auth_token', { path: '/' });
      res.json({ 
        success: true, 
        message: 'JWT cookie cleared',
        timestamp: new Date().toISOString()
      });
    });
  }

  // JWT 狀態診斷端點
  app.get('/api/auth/debug', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.auth_token;
      const hasPassportUser = !!(req as any).user;
      let tokenVerification = 'No token';
      
      if (cookieToken) {
        const verified = jwtUtils.verifyToken(cookieToken);
        tokenVerification = verified ? `Valid: ${verified.email}` : 'Invalid token';
      }
      
      console.log('JWT Debug:', {
        authHeader: authHeader ? 'Present' : 'Missing',
        cookieToken: cookieToken ? 'Present' : 'Missing',
        hasPassportUser,
        cookies: Object.keys(req.cookies || {}),
        tokenVerification
      });
      
      res.json({
        authHeader: authHeader ? 'Present' : 'Missing',
        cookieToken: cookieToken ? 'Present' : 'Missing',
        hasPassportUser,
        cookies: Object.keys(req.cookies || {}),
        jwtVerification: tokenVerification
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({ error: 'Debug failed' });
    }
  });

  // 測試 JWT 設置端點 (僅開發環境)
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/auth/test-jwt', async (req, res) => {
      try {
        // 創建測試用戶
        const testUser = {
          id: 'test-user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        };
        
        // 生成 JWT token
        const token = jwtUtils.generateToken(testUser);
        
        // 設置 cookie
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
          path: '/' // 確保整個網站都能訪問 cookie
        };
        
        console.log('Test JWT: Setting cookie with options:', cookieOptions);
        res.cookie('auth_token', token, cookieOptions);
        
        console.log('Test JWT cookie set for:', testUser.email);
        res.json({ 
          success: true, 
          message: 'Test JWT cookie set',
          user: testUser
        });
      } catch (error) {
        console.error('Test JWT error:', error);
        res.status(500).json({ error: 'Test JWT failed' });
      }
    });
  }

  // 前端檢查 cookie 存在性端點
  app.get('/api/auth/check-cookie', (req, res) => {
    const cookies = req.cookies;
    const authToken = cookies?.auth_token;
    
    res.json({
      hasCookie: !!authToken,
      cookieExists: authToken ? 'Yes' : 'No',
      allCookies: Object.keys(cookies || {}),
      timestamp: new Date().toISOString()
    });
  });

  // 簡單的測試登入端點 (開發環境)
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/auth/test-login', async (req, res) => {
      try {
        const testUser = {
          id: 'test-admin-' + Date.now(),
          email: 'backtrue@gmail.com',
          firstName: 'Test',
          lastName: 'Admin'
        };

        const token = jwtUtils.generateToken(testUser);
        
        const cookieOptions = {
          httpOnly: true,
          secure: false,
          sameSite: 'lax' as const,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/'
        };
        
        res.cookie('auth_token', token, cookieOptions);
        console.log('[TEST-LOGIN] Test admin login created for:', testUser.email);
        
        res.json({ 
          success: true, 
          message: 'Test admin login successful',
          user: testUser,
          redirectTo: '/bdmin'
        });
      } catch (error) {
        console.error('[TEST-LOGIN] Test login error:', error);
        res.status(500).json({ error: 'Test login failed' });
      }
    });
  }

  // 用戶認證狀態 API - 使用 JWT
  app.get('/api/auth/user', jwtMiddleware, (req, res) => {
    try {
      const token = jwtUtils.extractTokenFromRequest(req);
      console.log('Auth check - token present:', !!token);
      
      if ((req as any).user) {
        console.log('JWT auth check successful:', (req as any).user.email);
        res.set('Cache-Control', 'private, max-age=300'); // 5分鐘 cache
        res.json((req as any).user);
      } else {
        console.log('JWT auth check failed: no valid user in request');
        res.status(401).json({ error: 'Not authenticated' });
      }
    } catch (error) {
      console.error('JWT auth endpoint error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// 工具函數：為現有用戶生成 JWT (一次性遷移用)
export async function generateJWTForExistingUser(userId: string): Promise<string | null> {
  try {
    const user = await storage.getUser(userId);
    if (!user) return null;
    
    return jwtUtils.generateToken(user);
  } catch (error) {
    console.error('Error generating JWT for existing user:', error);
    return null;
  }
}