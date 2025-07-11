# 子服務 Google SSO 登入整合指引

## 📋 概述

本指引提供完整的子服務 Google SSO 登入整合步驟，適用於所有子域名服務：
- `audai.thinkwithblack.com`
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
2. 重定向到主平台 Google OAuth
3. 用戶完成 Google 授權
4. 系統自動創建/更新用戶資料
5. 返回 JWT token 給子服務
6. 子服務儲存 token 並維持登入狀態
```

### API 端點
- **主平台**: `https://eccal.thinkwithblack.com`
- **Google SSO**: `/api/auth/google-sso`
- **Token 驗證**: `/api/sso/verify-token`
- **用戶資料**: `/api/account-center/user/:userId`

## 🚀 快速開始

### 1. 下載 Authentication SDK

```html
<script src="https://eccal.thinkwithblack.com/eccal-auth-sdk.js"></script>
```

### 2. 基本 HTML 結構

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
            returnURL: window.location.origin // 子服務的 URL
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
                    // Token 無效，清除並顯示登入
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
            const loginURL = `${AUTH_CONFIG.baseURL}/api/auth/google-sso?returnTo=${encodeURIComponent(AUTH_CONFIG.returnURL)}`;
            window.location.href = loginURL;
        }

        // 處理登出
        function handleLogout() {
            localStorage.removeItem('eccal_auth_token');
            showLoginSection();
        }

        // 顯示登入區塊
        function showLoginSection() {
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('user-section').style.display = 'none';
            document.getElementById('loading').style.display = 'none';
        }

        // 顯示用戶區塊
        function showUserSection(userData) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('user-section').style.display = 'block';
            document.getElementById('loading').style.display = 'none';
            
            // 顯示用戶資訊
            document.getElementById('user-info').innerHTML = `
                <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">
                    <h3>用戶資訊</h3>
                    <p><strong>姓名:</strong> ${userData.name}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>點數餘額:</strong> ${userData.credits || 0} 點</p>
                    <p><strong>會員等級:</strong> ${userData.membershipLevel || 'Free'}</p>
                </div>
            `;
        }

        // 顯示載入中
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

## 🔐 Authentication SDK 使用方法

### 初始化和基本操作

```javascript
// 檢查是否已登入
const isLoggedIn = await EccalAuth.isLoggedIn();

// 獲取用戶資料
const userData = await EccalAuth.getUserData();

// 獲取當前 Token
const token = EccalAuth.getToken();

// 登出
EccalAuth.logout();

// 重新整理 Token
const newToken = await EccalAuth.refreshToken();
```

### 進階 API 調用

```javascript
// 獲取用戶點數
const credits = await EccalAuth.getUserCredits();

// 獲取會員資訊
const membership = await EccalAuth.getUserMembership();

// 驗證 Token 有效性
const isValid = await EccalAuth.verifyToken();
```

## 📡 API 端點詳細說明

### 1. Google SSO 登入
```
GET /api/auth/google-sso?returnTo={子服務URL}
```
**用途**: 啟動 Google OAuth 流程
**參數**: 
- `returnTo`: 登入成功後返回的 URL
**回調**: 返回帶有 `auth_success=true&token={JWT}` 參數

### 2. Token 驗證
```
POST /api/sso/verify-token
Content-Type: application/json

{
  "token": "your_jwt_token_here"
}
```
**響應**:
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 3. 用戶資料查詢
```
GET /api/account-center/user/{userId}
Authorization: Bearer {JWT_TOKEN}
```
**響應**:
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "credits": 30,
    "membershipLevel": "Free"
  }
}
```

## 🎨 自定義登入按鈕樣式

### 基本樣式
```css
.google-login-btn {
    background: #4285f4;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.google-login-btn:hover {
    background: #357ae8;
}
```

### 進階樣式（包含 Google 圖標）
```html
<button class="google-login-btn" onclick="handleGoogleLogin()">
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    使用 Google 登入
</button>
```

## 🔄 狀態管理最佳實踐

### 1. Token 存儲
```javascript
// 儲存 Token
localStorage.setItem('eccal_auth_token', token);

// 讀取 Token
const token = localStorage.getItem('eccal_auth_token');

// 清除 Token
localStorage.removeItem('eccal_auth_token');
```

### 2. 自動登入檢查
```javascript
// 頁面載入時自動檢查
window.addEventListener('load', async () => {
    const token = localStorage.getItem('eccal_auth_token');
    if (token) {
        const isValid = await EccalAuth.verifyToken();
        if (!isValid) {
            localStorage.removeItem('eccal_auth_token');
            showLoginForm();
        } else {
            showUserInterface();
        }
    }
});
```

### 3. 跨標籤頁同步
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

## ⚠️ 常見問題解決

### 1. CORS 錯誤
確保子服務域名已在允許清單中：
- `https://audai.thinkwithblack.com`
- `https://sub3.thinkwithblack.com`
- `https://sub4.thinkwithblack.com`
- `https://sub5.thinkwithblack.com`
- `https://member.thinkwithblack.com`

### 2. Token 過期處理
```javascript
async function handleTokenExpiration() {
    try {
        const newToken = await EccalAuth.refreshToken();
        localStorage.setItem('eccal_auth_token', newToken);
        return newToken;
    } catch (error) {
        // Token 無法更新，要求重新登入
        localStorage.removeItem('eccal_auth_token');
        showLoginForm();
        return null;
    }
}
```

### 3. 登入失敗處理
```javascript
// 檢查 URL 參數中的錯誤
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('auth_error') === 'true') {
    const errorMsg = urlParams.get('error') || '登入失敗';
    alert(`登入錯誤: ${errorMsg}`);
    // 清除 URL 參數
    window.history.replaceState({}, document.title, window.location.pathname);
}
```

## 🧪 測試清單

### 基本功能測試
- [ ] Google 登入按鈕正確顯示
- [ ] 點擊登入按鈕跳轉到 Google OAuth
- [ ] 授權後正確返回子服務
- [ ] Token 正確儲存在 localStorage
- [ ] 用戶資料正確顯示
- [ ] 登出功能正常運作

### 進階測試
- [ ] 頁面重新整理後登入狀態保持
- [ ] 跨標籤頁登入狀態同步
- [ ] Token 過期後自動處理
- [ ] 網路錯誤處理
- [ ] 新用戶自動創建並獲得 30 點數

## 📞 技術支援

如有整合問題，請聯繫：
- **技術支援**: backtrue@thinkwithblack.com
- **API 文檔**: 參考 `API_STATUS_REPORT.md`
- **SDK 原始碼**: `/client/public/eccal-auth-sdk.js`

## 🔄 版本更新記錄

- **V1.0** (2025-07-11): 初始版本發布
- **V1.1** (2025-07-11): 修復生產環境 API 路由問題
- **V1.2** (2025-07-11): 完善錯誤處理和狀態管理

---

## 🎯 下一步行動

1. **立即開始**: 複製基本 HTML 結構到你的子服務
2. **自定義樣式**: 根據子服務設計風格調整登入按鈕
3. **測試整合**: 按照測試清單逐項驗證功能
4. **部署上線**: 確認所有功能正常後進行部署

**整合成功後，子服務將自動獲得統一的用戶認證系統，提供無縫的用戶體驗！**