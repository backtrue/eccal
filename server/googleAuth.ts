import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express } from "express";
import { storage } from "./storage";

export function setupGoogleAuth(app: Express) {
  // Session configuration
  const sessionTtl = 8 * 60 * 60 * 1000; // 8 hours - 減少系統負擔
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
    pruneSessionInterval: 2 * 60 * 60 * 1000, // 每2小時清理過期 session
    disableTouch: true, // 停用 touch 操作減少資料庫負擔
  });

  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: false, // 停用滾動過期以減少資料庫更新
    unset: 'destroy', // 刪除 session 時立即清理
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
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

  // Serialize/Deserialize user for sessions
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log(`[AUTH] Deserializing user: ${id}`);
      
      // Check cache first
      const cached = userCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[AUTH] User found in cache: ${id}`);
        return done(null, cached.user);
      }

      // Fetch from database
      const user = await storage.getUser(id);
      console.log(`[AUTH] User from DB:`, user ? `Found ${user.email}` : 'Not found');
      
      if (!user) {
        console.log(`[AUTH] User not found in database: ${id}`);
        return done(null, false);
      }
      
      // Cache the result
      userCache.set(id, { user, timestamp: Date.now() });
      console.log(`[AUTH] User successfully deserialized: ${user.email}`);
      
      done(null, user);
    } catch (error) {
      console.error(`[AUTH] Error deserializing user ${id}:`, error);
      done(null, false); // Don't propagate error, just fail silently
    }
  });

  // Auth routes - force consent to ensure refresh token
  app.get('/api/auth/google', (req, res, next) => {
    console.log('Starting Google OAuth');
    
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
          const redirectUrl = `${baseUrl}/?auth_success=1`;
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

  // 完全移除 /api/auth/user 路由 - 問題是瀏覽器緩存的舊 JavaScript
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  console.log(`[AUTH] requireAuth called for ${req.method} ${req.path}`);
  console.log(`[AUTH] isAuthenticated():`, req.isAuthenticated ? req.isAuthenticated() : 'method not available');
  console.log(`[AUTH] User exists:`, !!req.user);
  console.log(`[AUTH] Session ID:`, req.sessionID || 'no session');
  console.log(`[AUTH] Session keys:`, req.session ? Object.keys(req.session) : 'no session');
  
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    console.log(`[AUTH] Authentication successful for user:`, req.user.email || req.user.id || 'unknown');
    return next();
  }
  
  console.log(`[AUTH] Authentication failed - returning 401`);
  // Return 401 for unauthenticated requests - this is the standard HTTP status
  res.status(401).json({ error: 'Authentication required' });
}