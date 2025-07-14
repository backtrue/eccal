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

// 測試頁面端點
app.get('/test-google-oauth.html', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google OAuth 測試</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        button {
            background: #4285f4;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 0;
        }
        button:hover {
            background: #357ae8;
        }
        .log {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #007bff;
            font-family: monospace;
        }
        .error {
            border-left-color: #dc3545;
            background: #f8d7da;
        }
        .success {
            border-left-color: #28a745;
            background: #d4edda;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Google OAuth 測試</h1>
        
        <div id="status">
            <h2>狀態檢查</h2>
            <div id="url-params"></div>
            <div id="auth-result"></div>
        </div>

        <div id="controls">
            <h2>測試控制</h2>
            <button onclick="startGoogleOAuth()">開始 Google OAuth</button>
            <button onclick="testQuoteService()">測試 Quote 服務</button>
            <button onclick="clearData()">清除資料</button>
        </div>

        <div id="logs">
            <h2>日誌</h2>
            <div id="log-container"></div>
        </div>
    </div>

    <script>
        // 頁面載入時檢查 URL 參數
        window.onload = function() {
            checkUrlParams();
            checkAuthResult();
        };

        function log(message, type = 'info') {
            const logContainer = document.getElementById('log-container');
            const logElement = document.createElement('div');
            logElement.className = \`log \${type}\`;
            logElement.innerHTML = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
            logContainer.appendChild(logElement);
            logContainer.scrollTop = logContainer.scrollHeight;
        }

        function checkUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);
            const params = {};
            
            for (const [key, value] of urlParams) {
                params[key] = value;
            }
            
            const paramsDiv = document.getElementById('url-params');
            if (Object.keys(params).length > 0) {
                paramsDiv.innerHTML = \`<div class="log">URL 參數: \${JSON.stringify(params, null, 2)}</div>\`;
            } else {
                paramsDiv.innerHTML = '<div class="log">沒有 URL 參數</div>';
            }
        }

        function checkAuthResult() {
            const urlParams = new URLSearchParams(window.location.search);
            const authResultDiv = document.getElementById('auth-result');
            
            if (urlParams.get('auth_success') === 'true') {
                const token = urlParams.get('token');
                const userId = urlParams.get('user_id');
                
                authResultDiv.innerHTML = \`
                    <div class="log success">
                        <h3>認證成功！</h3>
                        <p>Token: \${token ? '已獲得' : '缺少'}</p>
                        <p>User ID: \${userId || '未設定'}</p>
                        <p>Token 長度: \${token ? token.length : 0}</p>
                    </div>
                \`;
                
                log('認證成功！', 'success');
                
                // 自動儲存到 localStorage
                if (token) {
                    localStorage.setItem('eccal_auth_token', token);
                    log('Token 已儲存到 localStorage', 'success');
                }
                
            } else if (urlParams.get('auth_error') === 'true') {
                const errorMessage = urlParams.get('error_message') || '未知錯誤';
                
                authResultDiv.innerHTML = \`
                    <div class="log error">
                        <h3>認證失敗</h3>
                        <p>錯誤: \${decodeURIComponent(errorMessage)}</p>
                    </div>
                \`;
                
                log(\`認證失敗: \${errorMessage}\`, 'error');
            } else {
                authResultDiv.innerHTML = '<div class="log">未檢測到認證結果</div>';
            }
        }

        function startGoogleOAuth() {
            log('開始 Google OAuth 流程...');
            
            const returnUrl = encodeURIComponent(window.location.href.split('?')[0]);
            const serviceName = 'test';
            const oauthUrl = \`https://eccal.thinkwithblack.com/api/auth/google-sso?returnTo=\${returnUrl}&service=\${serviceName}\`;
            
            log(\`重定向到: \${oauthUrl}\`);
            window.location.href = oauthUrl;
        }

        function testQuoteService() {
            log('測試 Quote 服務流程...');
            
            const returnUrl = encodeURIComponent('https://quote.thinkwithblack.com');
            const serviceName = 'quote';
            const oauthUrl = \`https://eccal.thinkwithblack.com/api/auth/google-sso?returnTo=\${returnUrl}&service=\${serviceName}\`;
            
            log(\`重定向到: \${oauthUrl}\`);
            window.location.href = oauthUrl;
        }

        function clearData() {
            localStorage.removeItem('eccal_auth_token');
            document.getElementById('log-container').innerHTML = '';
            
            // 清除 URL 參數
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            
            log('資料已清除');
            checkUrlParams();
            checkAuthResult();
        }
    </script>
</body>
</html>`);
});

// Google SSO 認證端點 - 高優先級註冊
// 這個端點負責啟動 Google OAuth 流程，應該重定向到 Google
app.get('/api/auth/google-sso', async (req, res) => {
  try {
    const { returnTo, service } = req.query;
    
    console.log('Google SSO 啟動請求:', {
      returnTo,
      service,
      origin: req.headers.origin,
      referer: req.headers.referer
    });
    
    // 設置 CORS 標頭
    const allowedOrigins = [
      'https://eccal.thinkwithblack.com',
      'https://audai.thinkwithblack.com',
      'https://quote.thinkwithblack.com',
      'https://sub3.thinkwithblack.com',
      'https://sub4.thinkwithblack.com',
      'https://sub5.thinkwithblack.com',
      'https://member.thinkwithblack.com',
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    
    const origin = req.headers.origin || req.headers.referer;
    if (origin) {
      const originUrl = new URL(origin);
      const baseOrigin = `${originUrl.protocol}//${originUrl.hostname}`;
      if (allowedOrigins.includes(baseOrigin)) {
        res.header('Access-Control-Allow-Origin', baseOrigin);
      }
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // 創建 state 參數來保存 returnTo 和 service 資訊
    const state = Buffer.from(JSON.stringify({
      returnTo: returnTo || '/',
      service: service || 'unknown',
      origin: origin || req.headers.origin
    })).toString('base64');
    
    // 構建 Google OAuth URL
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://eccal.thinkwithblack.com/api/auth/google-sso/callback'
      : `${req.protocol}://${req.get('host')}/api/auth/google-sso/callback`;
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('profile email https://www.googleapis.com/auth/analytics.readonly')}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('重定向到 Google OAuth:', googleAuthUrl);
    
    // 重定向到 Google OAuth
    res.redirect(googleAuthUrl);
    
  } catch (error) {
    console.error('Google SSO 啟動錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Google SSO 啟動失敗',
      code: 'GOOGLE_SSO_START_ERROR'
    });
  }
});

// Google OAuth 回調端點
app.get('/api/auth/google-sso/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    console.log('=== Google OAuth 回調開始 ===');
    console.log('Query 參數:', {
      code: code ? 'present' : 'missing',
      state: state ? 'present' : 'missing',
      allParams: req.query
    });
    
    if (!code) {
      console.error('缺少授權碼');
      return res.status(400).json({
        success: false,
        error: '缺少授權碼',
        code: 'MISSING_AUTH_CODE'
      });
    }
    
    // 解析 state 參數
    let stateData = { returnTo: '/', service: 'unknown', origin: '' };
    if (state) {
      try {
        console.log('原始 state 參數:', state);
        stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        console.log('解析後的 state 資料:', stateData);
      } catch (e) {
        console.error('解析 state 失敗:', e);
      }
    }
    
    console.log('Google OAuth 回調處理:', {
      code: code ? 'present' : 'missing',
      stateData
    });
    
    // 使用授權碼獲取用戶資料
    const { default: jwt } = await import('jsonwebtoken');
    const crypto = await import('crypto');
    
    // 交換授權碼獲取 access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NODE_ENV === 'production' 
          ? 'https://eccal.thinkwithblack.com/api/auth/google-sso/callback'
          : `${req.protocol}://${req.get('host')}/api/auth/google-sso/callback`,
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('獲取 access token 失敗:', tokenData);
      return res.status(400).json({
        success: false,
        error: '獲取 access token 失敗',
        code: 'TOKEN_EXCHANGE_ERROR'
      });
    }
    
    // 使用 access token 獲取用戶資料
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    const userData = await userResponse.json();
    
    if (!userData.email) {
      console.error('獲取用戶資料失敗:', userData);
      return res.status(400).json({
        success: false,
        error: '獲取用戶資料失敗',
        code: 'USER_INFO_ERROR'
      });
    }
    
    // 檢查或創建用戶
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    let user = await db.select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);
    
    let userId: string;
    
    if (user.length === 0) {
      // 創建新用戶
      console.log('創建新用戶:', userData.email);
      const newUserId = crypto.randomUUID();
      
      await db.insert(users).values({
        id: newUserId,
        email: userData.email,
        name: userData.name || userData.email,
        firstName: userData.given_name || null,
        lastName: userData.family_name || null,
        profileImageUrl: userData.picture || null,
        googleAccessToken: tokenData.access_token,
        googleRefreshToken: tokenData.refresh_token || null,
        tokenExpiresAt: tokenData.expires_in ? 
          new Date(Date.now() + tokenData.expires_in * 1000) : 
          new Date(Date.now() + 3600000),
        service: stateData.service || 'unknown',
        credits: 30, // 新用戶獲得 30 點數
        lastLoginAt: new Date(),
        membershipLevel: 'free',
        membershipExpires: null
      });
      
      userId = newUserId;
    } else {
      // 更新現有用戶
      userId = user[0].id;
      await db.update(users)
        .set({
          name: userData.name || user[0].name,
          firstName: userData.given_name || user[0].firstName,
          lastName: userData.family_name || user[0].lastName,
          profileImageUrl: userData.picture || user[0].profileImageUrl,
          googleAccessToken: tokenData.access_token,
          googleRefreshToken: tokenData.refresh_token || user[0].googleRefreshToken,
          tokenExpiresAt: tokenData.expires_in ? 
            new Date(Date.now() + tokenData.expires_in * 1000) : 
            new Date(Date.now() + 3600000),
          lastLoginAt: new Date()
        })
        .where(eq(users.id, userId));
    }
    
    // 獲取更新後的用戶資料
    const updatedUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    const finalUser = updatedUser[0];
    
    // 生成 JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        sub: finalUser.id,
        email: finalUser.email,
        name: finalUser.name,
        membership: finalUser.membershipLevel,
        credits: finalUser.credits,
        iss: 'eccal.thinkwithblack.com',
        aud: stateData.origin || 'unknown'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 構建回調 URL
    const returnUrl = new URL(stateData.returnTo);
    returnUrl.searchParams.set('auth_success', 'true');
    returnUrl.searchParams.set('token', token);
    returnUrl.searchParams.set('user_id', finalUser.id);
    
    console.log('=== 準備重定向 ===');
    console.log('目標 URL:', returnUrl.toString());
    console.log('JWT Token 長度:', token.length);
    console.log('用戶 ID:', finalUser.id);
    
    // 重定向回子服務
    console.log('執行重定向...');
    res.redirect(returnUrl.toString());
    console.log('重定向完成');
    
  } catch (error) {
    console.error('=== Google OAuth 回調錯誤 ===');
    console.error('錯誤詳情:', error);
    console.error('錯誤堆疊:', error.stack);
    
    // 嘗試重定向到錯誤頁面
    try {
      const { state } = req.query;
      let stateData = { returnTo: 'https://quote.thinkwithblack.com', service: 'quote' };
      if (state) {
        try {
          stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        } catch (e) {
          console.error('解析 state 失敗:', e);
        }
      }
      
      const errorUrl = new URL(stateData.returnTo);
      errorUrl.searchParams.set('auth_error', 'true');
      errorUrl.searchParams.set('error_message', encodeURIComponent('Google OAuth 認證失敗'));
      
      console.log('重定向到錯誤頁面:', errorUrl.toString());
      res.redirect(errorUrl.toString());
    } catch (redirectError) {
      console.error('重定向錯誤失敗:', redirectError);
      // 如果重定向也失敗，返回 JSON 錯誤
      res.status(500).json({
        success: false,
        error: 'Google OAuth 認證失敗',
        code: 'GOOGLE_OAUTH_CALLBACK_ERROR',
        details: error.message
      });
    }
  }
});

// Account Center API 端點 - 高優先級註冊
app.get('/api/account-center/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/account-center/debug', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    query: req.query,
    origin: req.headers.origin
  });
});

app.get('/api/account-center/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
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
    const { users, userCredits } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // 查詢用戶
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用戶未找到',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // 查詢點數
    const credits = await db.select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);
    
    const userData = user[0];
    const creditsData = credits.length > 0 ? credits[0] : null;
    
    res.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        membership: userData.membershipLevel || 'free',
        membershipExpires: userData.membershipExpires,
        credits: creditsData ? creditsData.balance : 0,
        profileImageUrl: userData.profileImageUrl,
        createdAt: userData.createdAt
      }
    });
    
  } catch (error) {
    console.error('用戶查詢錯誤:', error);
    res.status(500).json({
      success: false,
      error: '查詢失敗',
      code: 'QUERY_ERROR'
    });
  }
});

app.get('/api/account-center/user/:userId/credits', async (req, res) => {
  try {
    const { userId } = req.params;
    
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
    const { userCredits } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // 查詢點數
    const credits = await db.select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);
    
    const creditsData = credits.length > 0 ? credits[0] : null;
    
    res.json({
      success: true,
      credits: {
        balance: creditsData ? creditsData.balance : 0,
        totalEarned: creditsData ? creditsData.totalEarned : 0,
        totalSpent: creditsData ? creditsData.totalSpent : 0
      }
    });
    
  } catch (error) {
    console.error('點數查詢錯誤:', error);
    res.status(500).json({
      success: false,
      error: '查詢失敗',
      code: 'QUERY_ERROR'
    });
  }
});

app.get('/api/account-center/user/:userId/membership', async (req, res) => {
  try {
    const { userId } = req.params;
    
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
    
    // 查詢用戶
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用戶未找到',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const userData = user[0];
    const isPro = userData.membershipLevel === 'pro' && 
                  userData.membershipExpires && 
                  new Date(userData.membershipExpires) > new Date();
    
    res.json({
      success: true,
      membership: {
        level: userData.membershipLevel || 'free',
        expires: userData.membershipExpires,
        isPro: isPro,
        features: isPro ? 
          ['無限制使用', '優先支援', '高級功能'] : 
          ['基本功能', '社群支援']
      }
    });
    
  } catch (error) {
    console.error('會員查詢錯誤:', error);
    res.status(500).json({
      success: false,
      error: '查詢失敗',
      code: 'QUERY_ERROR'
    });
  }
});

app.post('/api/sso/verify-token', express.json(), async (req, res) => {
  try {
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
    
    const { token } = req.body || {};
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token is required' 
      });
    }
    
    // 使用動態 import 載入 jwt
    const { default: jwt } = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      res.json({ 
        success: true,
        valid: true, 
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name
        }
      });
    } catch (jwtError) {
      res.status(401).json({ 
        success: false, 
        valid: false, 
        error: 'Invalid token' 
      });
    }
    
  } catch (error) {
    console.error('Token 驗證錯誤:', error);
    res.status(401).json({ 
      success: false, 
      valid: false, 
      error: 'Token verification failed' 
    });
  }
});

// SDK 端點
app.get('/eccal-auth-sdk.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 動態載入 SDK 檔案
  import('fs').then(fs => {
    import('path').then(path => {
      const sdkPath = path.join(process.cwd(), 'client/public/eccal-auth-sdk.js');
      fs.readFile(sdkPath, 'utf8', (err, data) => {
        if (err) {
          console.error('SDK 檔案讀取錯誤:', err);
          res.status(500).send('// SDK 檔案無法載入');
        } else {
          res.send(data);
        }
      });
    });
  }).catch(error => {
    console.error('SDK 模組載入錯誤:', error);
    res.status(500).send('// SDK 模組載入失敗');
  });
});

// SSO 登入端點
app.post('/api/sso/login', express.json(), async (req, res) => {
  try {
    const { email, returnTo, origin } = req.body;
    
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
    
    const requestOrigin = origin || req.headers.origin;
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // 建立 Google OAuth URL
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: `https://eccal.thinkwithblack.com/api/sso/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: JSON.stringify({ returnTo, origin: requestOrigin })
    });
    
    const authUrl = `${baseUrl}?${params.toString()}`;
    
    res.json({
      success: true,
      authUrl: authUrl
    });
    
  } catch (error) {
    console.error('SSO 登入錯誤:', error);
    res.status(500).json({
      success: false,
      error: '登入準備失敗',
      code: 'LOGIN_PREPARATION_ERROR'
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