
# 子域名 SSO 統一認證整合指南

## 📋 概述

本指南提供完整的子域名服務 Google SSO 登入整合方案，適用於所有 `thinkwithblack.com` 子域名服務：
- `audai.thinkwithblack.com`
- `quote.thinkwithblack.com`
- `sub3.thinkwithblack.com`
- `sub4.thinkwithblack.com`
- `sub5.thinkwithblack.com`
- `member.thinkwithblack.com`

## 🎯 整合目標

1. **統一認證** - 所有子服務共享同一個用戶資料庫
2. **無縫體驗** - 用戶在任何子服務登入後，其他服務自動同步登入狀態
3. **JWT 安全** - 使用 JWT token 進行跨域身份驗證
4. **自動用戶創建** - 新用戶自動獲得 30 點數獎勵

## 🔧 技術架構

### 認證流程
```
1. 用戶點擊 Google 登入按鈕
2. 重定向到主平台 /api/auth/google-sso (GET)
3. 主平台重定向到 Google OAuth 授權頁面
4. 用戶完成 Google 授權
5. Google 回調到 /api/auth/google-sso/callback
6. 系統自動創建/更新用戶資料並生成 JWT token
7. 重定向回子服務並攜帶 token
8. 子服務儲存 token 並維持登入狀態
```

### API 端點
- **主平台**: `https://eccal.thinkwithblack.com`
- **Google SSO 啟動**: `/api/auth/google-sso` (GET)
- **Google SSO 回調**: `/api/auth/google-sso/callback` (GET)
- **Token 驗證**: `/api/sso/verify-token` (POST)
- **用戶資料**: `/api/account-center/user/:userId` (GET)
- **點數扣除**: `/api/account-center/credits/:userId/deduct` (POST)

## 🚀 快速整合

### 方法一：使用 Authentication SDK（推薦）

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>子服務 - Google SSO 登入</title>
    <script src="https://eccal.thinkwithblack.com/eccal-auth-sdk.js"></script>
</head>
<body>
    <div id="app">
        <!-- 登入前顯示 -->
        <div id="login-section">
            <h2>請登入以繼續使用服務</h2>
            <button id="google-login-btn" onclick="handleGoogleLogin()">
                🔍 Google 登入
            </button>
        </div>
        
        <!-- 登入後顯示 -->
        <div id="user-section" style="display: none;">
            <h2>歡迎回來！</h2>
            <div id="user-info"></div>
            <button onclick="handleLogout()">登出</button>
        </div>
        
        <!-- 載入中狀態 -->
        <div id="loading" style="display: none;">
            <p>正在載入用戶資料...</p>
        </div>
    </div>

    <script>
        // 子服務登入整合腳本
        const AUTH_CONFIG = {
            baseURL: 'https://eccal.thinkwithblack.com',
            returnURL: window.location.origin
        };

        // 頁面載入時檢查登入狀態
        document.addEventListener('DOMContentLoaded', function() {
            checkAuthStatus();
        });

        // 檢查用戶登入狀態
        async function checkAuthStatus() {
            const token = localStorage.getItem('eccal_auth_token');
            
            if (!token) {
                showLoginSection();
                return;
            }

            try {
                showLoading();
                const userData = await EccalAuth.getUserData();
                
                if (userData) {
                    showUserSection(userData);
                } else {
                    localStorage.removeItem('eccal_auth_token');
                    showLoginSection();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                showLoginSection();
            }
        }

        // 處理 Google 登入
        function handleGoogleLogin() {
            const returnUrl = encodeURIComponent(window.location.href);
            const serviceName = encodeURIComponent(window.location.hostname.split('.')[0]);
            const loginURL = `${AUTH_CONFIG.baseURL}/api/auth/google-sso?returnTo=${returnUrl}&service=${serviceName}`;
            
            console.log('Redirecting to Google SSO:', loginURL);
            window.location.href = loginURL;
        }

        // 處理登出
        function handleLogout() {
            localStorage.removeItem('eccal_auth_token');
            showLoginSection();
        }

        // 顯示相關區塊的函數
        function showLoginSection() {
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('user-section').style.display = 'none';
            document.getElementById('loading').style.display = 'none';
        }

        function showUserSection(userData) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('user-section').style.display = 'block';
            document.getElementById('loading').style.display = 'none';
            
            // 正確的會員等級顯示
            const membershipBadge = userData.membership === 'pro' ? 
                '<span style="color: gold; font-weight: bold;">PRO</span>' : 
                '<span style="color: gray;">FREE</span>';
            
            document.getElementById('user-info').innerHTML = `
                <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">
                    <h3>用戶資訊</h3>
                    <p><strong>姓名:</strong> ${userData.name}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>會員等級:</strong> ${membershipBadge}</p>
                    <p><strong>點數餘額:</strong> ${userData.credits || 0} 點</p>
                    <p><strong>用戶 ID:</strong> ${userData.id}</p>
                </div>
            `;
        }

        function showLoading() {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('user-section').style.display = 'none';
            document.getElementById('loading').style.display = 'block';
        }

        // 處理 OAuth 回調
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auth_success') === 'true') {
            const token = urlParams.get('token');
            if (token) {
                localStorage.setItem('eccal_auth_token', token);
                // 清除 URL 參數
                window.history.replaceState({}, document.title, window.location.pathname);
                // 重新檢查登入狀態
                checkAuthStatus();
            }
        }
    </script>
</body>
</html>
```

### 方法二：直接使用 SDK API

```javascript
// 初始化 SDK
const auth = new EccalAuth();

// 檢查是否已登入
const isLoggedIn = await auth.isLoggedIn();

// 獲取用戶資料
const userData = await auth.getUserData();

// 登出
auth.logout();

// 扣除點數
const result = await auth.deductCredits(userId, amount, reason, service);
```

## 📡 SDK API 參考

### EccalAuth 類別方法

```javascript
// 認證相關
async isLoggedIn()              // 檢查登入狀態
async getUserData()             // 獲取用戶資料
async verifyToken(token)        // 驗證 Token
logout()                        // 登出
getToken()                      // 獲取當前 Token

// 用戶資料
async getUserCredits()          // 獲取用戶點數
async getUserMembership()       // 獲取會員資訊

// 點數系統
async deductCredits(userId, amount, reason, service)  // 扣除點數
```

## 🔐 Manual Integration（手動整合）

如果不使用 SDK，可以直接調用 API：

```javascript
const EccalAuth = {
  baseURL: 'https://eccal.thinkwithblack.com',
  
  // Google SSO 登入
  async googleLogin(service = 'subdomain') {
    const params = new URLSearchParams({
      service: service,
      origin: window.location.origin,
      returnTo: window.location.href
    });
    
    window.location.href = `${this.baseURL}/api/auth/google-sso?${params}`;
  },
  
  // 驗證 JWT Token
  async verifyToken(token) {
    try {
      const response = await fetch(`${this.baseURL}/api/sso/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Token verification failed:', error);
      return { success: false, error: 'Network error' };
    }
  },
  
  // 獲取用戶資料
  async getUserData(userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/account-center/user/${userId}`, {
        headers: { 'Origin': window.location.origin }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return { success: false, error: 'Network error' };
    }
  },
  
  // 扣除用戶點數
  async deductCredits(userId, amount, reason, service) {
    try {
      const response = await fetch(`${this.baseURL}/api/account-center/credits/${userId}/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          amount: amount,
          reason: reason,
          service: service
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Credit deduction failed:', error);
      return { success: false, error: 'Network error' };
    }
  }
};
```

## 🔄 狀態管理最佳實踐

### Token 存儲
```javascript
// 儲存 Token
localStorage.setItem('eccal_auth_token', token);

// 讀取 Token
const token = localStorage.getItem('eccal_auth_token');

// 清除 Token
localStorage.removeItem('eccal_auth_token');
```

### 跨標籤頁同步
```javascript
// 監聽 localStorage 變化
window.addEventListener('storage', (e) => {
    if (e.key === 'eccal_auth_token') {
        if (e.newValue) {
            // 用戶在其他標籤頁登入
            checkAuthStatus();
        } else {
            // 用戶在其他標籤頁登出
            showLoginForm();
        }
    }
});
```

## 📋 API 端點詳細說明

### 1. Google SSO 登入
```
GET /api/auth/google-sso?returnTo={子服務URL}&service={服務名稱}
```

### 2. Token 驗證
```
POST /api/sso/verify-token
Content-Type: application/json

{
  "token": "your_jwt_token_here"
}
```

**響應格式**：
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "membership": "pro", // 或 "free"
    "credits": 30
  }
}
```

### 3. 用戶資料查詢
```
GET /api/account-center/user/{userId}
Origin: {your_subdomain_origin}
```

### 4. 點數扣除
```
POST /api/account-center/credits/{userId}/deduct
Content-Type: application/json

{
  "amount": 1,
  "reason": "使用服務",
  "service": "subdomain_name"
}
```

## 🚨 重要注意事項

### CORS 設定
系統已預設允許以下域名：
- `https://eccal.thinkwithblack.com`
- `https://audai.thinkwithblack.com`
- `https://quote.thinkwithblack.com`
- `https://sub3.thinkwithblack.com`
- `https://sub4.thinkwithblack.com`
- `https://sub5.thinkwithblack.com`
- `https://member.thinkwithblack.com`

### JWT Token 結構
```json
{
  "sub": "用戶ID",
  "email": "用戶郵箱",
  "name": "用戶姓名",
  "membership": "會員等級（free/pro）",
  "credits": "可用點數",
  "service": "服務名稱",
  "iss": "eccal.thinkwithblack.com",
  "aud": "目標域名",
  "iat": "發行時間",
  "exp": "過期時間"
}
```

### 🔥 重要修正：會員等級欄位映射
**最新修正（2025-01-14）：**
- ✅ JWT Token 中的會員等級欄位名稱為 `membership`
- ✅ 資料庫中的會員等級欄位名稱為 `membership_level`
- ✅ 所有 API 回應都使用 `membership` 欄位名稱
- ✅ 子服務應使用 `user.membership` 來判斷會員等級

**正確的會員等級判斷：**
```javascript
// 正確方式：使用 membership 欄位
if (user.membership === 'pro') {
    // 提供 Pro 功能
} else {
    // 提供免費功能
}
```

## ⚠️ 常見問題解決

### 1. CORS 錯誤
確保子服務域名已在允許清單中，所有請求都需要包含正確的 `Origin` 標頭。

### 2. Token 過期處理
```javascript
async function handleTokenExpiration() {
    try {
        const newToken = await EccalAuth.refreshToken();
        localStorage.setItem('eccal_auth_token', newToken);
        return newToken;
    } catch (error) {
        localStorage.removeItem('eccal_auth_token');
        showLoginForm();
        return null;
    }
}
```

### 3. 錯誤處理
所有 API 回應都包含以下結構：
```json
{
  "success": true/false,
  "error": "錯誤訊息",
  "code": "錯誤代碼",
  "data": {...}
}
```

## 🧪 測試清單

### 基本功能測試
- [ ] Google 登入按鈕正確顯示
- [ ] 點擊登入按鈕跳轉到 Google OAuth
- [ ] 授權後正確返回子服務
- [ ] Token 正確儲存在 localStorage
- [ ] 用戶資料正確顯示（確認 `membership` 欄位）
- [ ] 登出功能正常運作

### 進階測試
- [ ] 頁面重新整理後登入狀態保持
- [ ] 跨標籤頁登入狀態同步
- [ ] Token 過期後自動處理
- [ ] 網路錯誤處理
- [ ] 新用戶自動創建並獲得 30 點數
- [ ] 點數扣除功能正常運作

### 測試指令
```javascript
// 在瀏覽器控制台執行
const token = localStorage.getItem('eccal_auth_token');
EccalAuth.verifyToken(token).then(result => {
    console.log('Token verification:', result);
    console.log('Membership:', result.user?.membership);
    console.log('Credits:', result.user?.credits);
});
```

## 🔧 Google SSO 回調狀態

✅ **Google SSO 回調端點已完全實現並正常工作**

### 回調端點詳細資訊
- **端點位置**: `/api/auth/google-sso/callback`
- **實現狀況**: 完整實現，包含所有必要邏輯
- **重定向邏輯**: 正確實現，會重定向到 `returnTo` URL 並附帶 JWT token

### 回調流程
1. Google OAuth 完成後回調到 eccal 端點
2. 系統解析 `state` 參數獲取 `returnTo` 和 `service` 信息
3. 使用授權碼交換 Google access token
4. 獲取用戶資料並創建/更新用戶記錄
5. 生成 JWT token (包含正確的 membership 資訊)
6. 重定向到子服務: `{returnTo}?auth_success=true&token={JWT}&user_id={USER_ID}`

## 📞 技術支援

如有整合問題，請聯繫：
- **技術支援**: backtrue@thinkwithblack.com
- **API 文檔**: 參考 `API_STATUS_REPORT.md`
- **SDK 原始碼**: `/client/public/eccal-auth-sdk.js`

## 🔄 版本更新記錄

- **V2.0** (2025-01-14): 整合兩份文件，修正會員等級欄位問題
- **V1.2** (2025-01-14): 修復 Google SSO 回調問題
- **V1.1** (2025-01-11): 修復生產環境 API 路由問題
- **V1.0** (2025-01-11): 初始版本發布

---

**最後更新：2025-01-14**  
**重要修正：統一整合文件，修復會員等級欄位映射問題**
