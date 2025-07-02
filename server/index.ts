// =================================================================
// 請完整複製以下所有程式碼，並直接覆蓋掉您 server/index.ts 的內容
// =================================================================

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import http from 'http';
import { storage } from './storage';
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite';

// -------------------- 1. 基礎設定 --------------------
const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1); // 如果您的應用程式在反向代理後方，這很重要

// -------------------- 2. Session 中介軟體設定 --------------------
if (!process.env.SESSION_SECRET) {
  console.error("FATAL ERROR: SESSION_SECRET is not defined.");
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  }
}));

// -------------------- 3. Passport 中介軟體設定 (必須在 Session 之後) --------------------
app.use(passport.initialize());
app.use(passport.session());

// -------------------- 4. Passport 策略 (Strategy) 設定 --------------------
const getBaseUrl = () => {
  return process.env.NODE_ENV === 'production'
    ? 'https://eccal.thinkwithblack.com'
    : 'http://localhost:5000'; // 開發時請確保端口正確
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${getBaseUrl()}/api/auth/google/callback`,
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/analytics.readonly'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await storage.users.findUnique({ where: { email: profile._json.email! } });
      if (!user) {
        user = await storage.users.create({
          data: {
            name: profile.displayName,
            email: profile._json.email!,
            googleId: profile.id,
            avatarUrl: profile._json.picture,
          },
        });
      }
      
      if (accessToken) {
        await storage.users.update({
            where: { id: user.id },
            data: { accessToken },
        });
      }

      console.log('User authenticated and found/created:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('Error in Google Strategy:', error);
      return done(error, undefined);
    }
  }
));

// -------------------- 5. Passport 序列化與反序列化 --------------------
passport.serializeUser((user: any, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id); // 只將 user ID 存入 session
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.users.findUnique({ where: { id: id } });
    console.log('Deserializing user:', user ? user.email : 'not found');
    done(null, user); // 從 session ID 找回完整 user 物件
  } catch (err) {
    done(err, null);
  }
});

// -------------------- 6. 路由設定 (必須在所有中介軟體之後) --------------------
// 登入路由
app.get('/api/auth/google',
  passport.authenticate('google')
);

// Google 回呼路由
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('Callback successful, redirecting to dashboard.');
    res.redirect('/dashboard');
  }
);

// 登出路由
app.get('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// 檢查使用者狀態的受保護路由
app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('Auth status check: User is authenticated.', (req.user as any).email);
    res.json(req.user);
  } else {
    console.log('Auth status check: User is NOT authenticated.');
    res.status(401).json({ error: 'Not authenticated' });
  }
});


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
    console.log(`Server is running on port ${PORT}`);
  });
})();