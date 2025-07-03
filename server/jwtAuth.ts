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
      const decoded = jwt.verify(token, JWT_SECRET) as any;
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
export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = jwtUtils.extractTokenFromRequest(req);
  
  if (token) {
    const user = jwtUtils.verifyToken(token);
    if (user) {
      (req as any).user = user;
      (req as any).isAuthenticated = () => true;
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
    console.log('Starting Google OAuth with JWT');
    
    // 儲存 returnTo 參數到 session (暫時需要，用於回調)
    const returnTo = req.query.returnTo as string || req.get('Referer') || '/';
    (req as any).returnTo = returnTo;
    
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent'
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
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
        });

        // 處理推薦碼 (如果有)
        // Note: 這裡需要從 query 或其他地方獲取推薦碼
        // 因為沒有 session，我們可以用 query parameter 或其他方式

        console.log('JWT token generated for user:', user.id);

        const baseUrl = getBaseUrl(req);
        const returnTo = (req as any).returnTo || '/';
        
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
    res.clearCookie('auth_token');
    const baseUrl = getBaseUrl(req);
    res.redirect(`${baseUrl}/`);
  });

  // 用戶認證狀態 API - 使用 JWT
  app.get('/api/auth/user', jwtMiddleware, (req, res) => {
    try {
      if ((req as any).user) {
        console.log('JWT auth check successful:', (req as any).user.email);
        res.set('Cache-Control', 'private, max-age=300'); // 5分鐘 cache
        res.json((req as any).user);
      } else {
        console.log('JWT auth check failed: no valid token');
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