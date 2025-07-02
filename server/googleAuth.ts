import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express } from "express";
import { storage } from "./storage";

export function setupGoogleAuth(app: Express) {
  // Set trust proxy for Replit environment
  app.set('trust proxy', 1);
  
  // Session configuration
  const sessionTtl = 24 * 60 * 60 * 1000; // 24 hours - 按照 PDF 建議
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
    pruneSessionInterval: 2 * 60 * 60 * 1000, // 每2小時清理過期 session
    disableTouch: false, // 重新啟用 touch 操作
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_fallback',
    store: sessionStore,
    resave: false,
    saveUninitialized: false, // 按照 PDF 建議設為 false
    rolling: true, // 重新啟用滾動過期
    unset: 'destroy',
    name: 'connect.sid', // 明確設定 session cookie 名稱
    cookie: {
      httpOnly: true,
      secure: false, // 開發環境設為 false，按照 PDF 建議
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Get the base URL from environment or request
  const getBaseUrl = (req?: any) => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://eccal.thinkwithblack.com';
    }
    return req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:5000';
  };

  // Google OAuth Strategy
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
        tokenExpiresAt: new Date(Math.min(Date.now() + 3600000, 2147483647)), // 32-bit safe max
      });
      
      return done(null, user || false);
    } catch (error) {
      return done(error, false);
    }
  }));

  // User cache to reduce database queries
  const userCache = new Map<string, { user: any; timestamp: number }>();
  const CACHE_TTL = 5 * 60 * 1000; // 5分鐘快取

  // Clean up expired cache entries every 30 minutes to reduce overhead
  setInterval(() => {
    const now = Date.now();
    userCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_TTL) {
        userCache.delete(key);
      }
    });
  }, 30 * 60 * 1000);

  // 每 2 小時清理過期 session 記錄以減少資料庫負擔
  setInterval(async () => {
    try {
      if (sessionStore && typeof sessionStore.clear === 'function') {
        await sessionStore.clear();
      }
    } catch (error) {
      // 靜默處理清理錯誤
    }
  }, 2 * 60 * 60 * 1000);

  // Serialize/Deserialize user for sessions - 按照 PDF 建議修正
  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('Deserializing user:', id);
      
      // Check cache first
      const cached = userCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('User found in cache:', id);
        return done(null, cached.user);
      }

      // Fetch from database
      const user = await storage.getUser(id);
      console.log('User fetched from database:', user ? user.id : 'not found');
      
      // Cache the result
      if (user) {
        userCache.set(id, { user, timestamp: Date.now() });
        console.log('User cached:', id);
      }
      
      done(null, user || null); // 使用 null 而不是 false
    } catch (error) {
      console.error('Deserialization error:', error);
      done(error, null);
    }
  });

  // Auth routes - force consent to ensure refresh token
  app.get('/api/auth/google', (req, res, next) => {
    console.log('Starting Google OAuth');
    
    // Save the referring page for post-login redirect
    const returnTo = req.query.returnTo as string || req.get('Referer') || '/';
    (req.session as any).returnTo = returnTo;
    console.log('Saving returnTo in session:', returnTo);
    
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent'
    })(req, res, next);
  });
  
  app.get('/api/auth/google/callback', (req, res, next) => {
    console.log('Google OAuth callback triggered');
    passport.authenticate('google', (err: any, user: any, info: any) => {
      console.log('Google OAuth authenticate result:', { err: !!err, user: !!user, userInfo: user?.email });
      
      if (err) {
        console.error('Google OAuth error:', err);
        return res.status(500).send('Authentication failed');
      }
      
      if (!user) {
        console.error('Google OAuth failed - no user returned:', info);
        return res.status(401).send('Authentication failed');
      }
      
      console.log('Attempting to log in user:', user.id);
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.status(500).send('Login failed');
        }
        
        console.log('User successfully logged in:', user.id);
        console.log('Session ID:', (req.session as any).id);
        console.log('Is authenticated:', req.isAuthenticated());
        
        try {
          // Process referral if exists
          const referralCode = (req.session as any)?.referralCode;
          if (referralCode && user) {
            try {
              await storage.processReferral(referralCode, user.id);
              delete (req.session as any).referralCode;
            } catch (error) {
              console.error('Error processing referral:', error);
            }
          }
          
          // Temporarily disable Brevo sync due to IP whitelist issues
          console.log('Brevo sync disabled due to IP whitelist - user email:', user.email);
          
          const baseUrl = getBaseUrl(req);
          const returnTo = (req.session as any)?.returnTo || '/';
          delete (req.session as any).returnTo; // Clean up after use
          
          // Ensure the redirect URL is properly formatted
          let redirectUrl: string;
          if (returnTo.startsWith('http')) {
            // Absolute URL - use as is
            redirectUrl = `${returnTo}${returnTo.includes('?') ? '&' : '?'}auth_success=1`;
          } else {
            // Relative URL - prepend base URL
            const cleanPath = returnTo.startsWith('/') ? returnTo : `/${returnTo}`;
            redirectUrl = `${baseUrl}${cleanPath}${cleanPath.includes('?') ? '&' : '?'}auth_success=1`;
          }
          
          console.log('Redirecting to:', redirectUrl);
          res.redirect(redirectUrl);
        } catch (error) {
          console.error('OAuth callback processing error:', error);
          const baseUrl = getBaseUrl(req);
          res.redirect(`${baseUrl}/?error=auth_failed`);
        }
      });
    })(req, res, next);
  });

  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      const baseUrl = getBaseUrl(req);
      res.redirect(`${baseUrl}/`);
    });
  });

  // User auth status endpoint - 按照 PDF 建議實作受保護路由檢查
  app.get('/api/auth/user', (req, res) => {
    try {
      // 添加調試信息
      console.log('Auth check - Session ID:', (req.session as any)?.id);
      console.log('Auth check - isAuthenticated():', req.isAuthenticated());
      console.log('Auth check - req.user exists:', !!req.user);
      console.log('Auth check - User ID:', req.user ? (req.user as any).id : 'none');
      
      // 檢查 session 是否存在
      if (!(req.session as any)?.id) {
        console.log('Auth check failed: no session');
        return res.status(401).json({ error: 'No session' });
      }
      
      // 使用 Passport 的 isAuthenticated() 方法檢查
      if (req.isAuthenticated() && req.user) {
        console.log('Auth check successful:', (req.user as any).email);
        // 設置適當的 cache 標頭
        res.set('Cache-Control', 'private, max-age=300'); // 5分鐘 cache
        res.json(req.user);
      } else {
        console.log('Auth check failed: not authenticated');
        res.status(401).json({ error: 'Not authenticated' });
      }
    } catch (error) {
      console.error('Auth endpoint error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Return 401 for unauthenticated requests - this is the standard HTTP status
  res.status(401).json({ error: 'Authentication required' });
}