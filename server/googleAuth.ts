import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express } from "express";
import { storage } from "./storage";

export function setupGoogleAuth(app: Express) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
        tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Serialize/Deserialize user for sessions
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth routes - force consent to ensure refresh token
  app.get('/api/auth/google', passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent'
  }));
  
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req: any, res) => {
      try {
        const user = req.user;
        
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
        
        // Sync to Brevo (non-blocking)
        if (user?.email) {
          brevoService.addContactToList({
            email: user.email,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            gaResourceName: '',
          }).catch(error => {
            console.error('Error syncing to Brevo:', error);
          });
        }
        
        const baseUrl = getBaseUrl(req);
        res.redirect(`${baseUrl}/`);
      } catch (error) {
        console.error('OAuth callback error:', error);
        const baseUrl = getBaseUrl(req);
        res.redirect(`${baseUrl}/?error=auth_failed`);
      }
    }
  );

  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      const baseUrl = getBaseUrl(req);
      res.redirect(`${baseUrl}/`);
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}