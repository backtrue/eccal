# Replit 子域名服務整合指南 - 共用認證系統

## 概述

本指南專門為架設在 Replit 平台上的子域名服務提供完整的認證系統整合說明。所有子服務都將使用 `eccal.thinkwithblack.com` 作為中央認證中心。

## 系統架構

### 中央認證中心
- **域名**: `eccal.thinkwithblack.com`
- **平台**: Replit (主要認證服務)
- **功能**: 處理所有 Google OAuth、JWT 管理、用戶資料儲存
- **資料庫**: PostgreSQL (包含所有用戶資料)

### 子服務架構
- **平台**: Replit (每個子服務獨立專案)
- **域名**: `*.thinkwithblack.com` (例如: audai, sub3, sub4 等)
- **認證方式**: 通過 JavaScript SDK 與中央認證中心通信
- **資料存取**: 透過 JWT token 呼叫中央 API

## 已設定的子域名清單

以下域名已在中央認證中心的 CORS 設定中：

```javascript
const ALLOWED_ORIGINS = [
  'https://eccal.thinkwithblack.com',     // 主服務
  'https://audai.thinkwithblack.com',     // 子服務 1
  'https://sub3.thinkwithblack.com',      // 子服務 2
  'https://sub4.thinkwithblack.com',      // 子服務 3
  'https://sub5.thinkwithblack.com',      // 子服務 4
  'https://member.thinkwithblack.com',    // 會員中心
  'http://localhost:3000',                // 開發環境
  'http://localhost:5000'                 // 開發環境
];
```

## Replit 子服務整合步驟

### 1. Replit 專案設定

#### 1.1 建立新的 Replit 專案
```bash
# 建議使用 Node.js 或 HTML/CSS/JS 模板
# 專案名稱範例: audai-service, sub3-service 等
```

#### 1.2 設定自訂域名
在 Replit 專案設定中：
1. 前往 "Deployment" 頁面
2. 設定自訂域名 (例如: `audai.thinkwithblack.com`)
3. 確認 SSL 憑證正常

### 2. 認證系統整合

#### 2.1 引入認證 SDK
在你的 HTML 檔案中加入：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>你的子服務名稱</title>
</head>
<body>
    <div id="app">
        <!-- 認證狀態區域 -->
        <div id="auth-section">
            <div id="login-area" style="display: none;">
                <h3>請先登入</h3>
                <button id="login-btn" class="auth-btn">Google 登入</button>
                <p class="auth-note">使用 Google 帳號登入，與其他服務共用會員資料</p>
            </div>
            
            <div id="user-area" style="display: none;">
                <h3>歡迎回來！</h3>
                <div id="user-info"></div>
                <div id="user-actions">
                    <button id="logout-btn" class="auth-btn logout">登出</button>
                    <button id="refresh-btn" class="auth-btn">重新整理資料</button>
                </div>
            </div>
            
            <div id="loading-area" style="display: none;">
                <p>載入中...</p>
            </div>
        </div>
        
        <!-- 主要應用程式內容 -->
        <div id="main-content" style="display: none;">
            <h1>你的服務標題</h1>
            <p>這裡放你的主要功能</p>
            <!-- 你的服務功能在這裡 -->
        </div>
    </div>

    <!-- 載入中央認證 SDK -->
    <script src="https://eccal.thinkwithblack.com/eccal-auth-sdk.js"></script>
    <script>
        // 初始化認證系統
        const auth = new EccalAuth({
            baseUrl: 'https://eccal.thinkwithblack.com',
            siteName: '你的服務名稱', // 例如: 'AudAI', 'Sub3Service'
            onLogin: (user) => {
                console.log('用戶登入成功:', user);
                showUserArea(user);
                showMainContent();
            },
            onLogout: () => {
                console.log('用戶登出');
                showLoginArea();
                hideMainContent();
            },
            onError: (error) => {
                console.error('認證錯誤:', error);
                alert('認證發生錯誤，請重試: ' + error.message);
            }
        });

        // 頁面載入時檢查認證狀態
        document.addEventListener('DOMContentLoaded', async () => {
            showLoadingArea();
            try {
                const user = await auth.checkAuth();
                if (user) {
                    console.log('發現現有登入狀態:', user);
                    showUserArea(user);
                    showMainContent();
                } else {
                    console.log('未登入，顯示登入區域');
                    showLoginArea();
                }
            } catch (error) {
                console.error('認證檢查失敗:', error);
                showLoginArea();
            }
        });

        // 登入按鈕事件
        document.getElementById('login-btn').addEventListener('click', () => {
            console.log('開始登入流程');
            auth.login();
        });

        // 登出按鈕事件
        document.getElementById('logout-btn').addEventListener('click', () => {
            console.log('開始登出流程');
            auth.logout();
        });

        // 重新整理資料按鈕
        document.getElementById('refresh-btn').addEventListener('click', async () => {
            try {
                const user = await auth.checkAuth(true); // 強制重新檢查
                if (user) {
                    showUserArea(user);
                } else {
                    showLoginArea();
                }
            } catch (error) {
                console.error('重新整理失敗:', error);
                alert('重新整理失敗，請重試');
            }
        });

        // 顯示載入區域
        function showLoadingArea() {
            document.getElementById('loading-area').style.display = 'block';
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('user-area').style.display = 'none';
        }

        // 顯示登入區域
        function showLoginArea() {
            document.getElementById('loading-area').style.display = 'none';
            document.getElementById('login-area').style.display = 'block';
            document.getElementById('user-area').style.display = 'none';
        }

        // 顯示用戶區域
        function showUserArea(user) {
            document.getElementById('loading-area').style.display = 'none';
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('user-area').style.display = 'block';
            
            // 顯示用戶資訊
            document.getElementById('user-info').innerHTML = `
                <div class="user-card">
                    <img src="${user.picture || 'https://via.placeholder.com/50'}" alt="用戶頭像" class="user-avatar">
                    <div class="user-details">
                        <p><strong>姓名:</strong> ${user.name || '未設定'}</p>
                        <p><strong>Email:</strong> ${user.email || '未設定'}</p>
                        <p><strong>會員等級:</strong> <span class="membership-badge ${user.membership || 'free'}">${user.membership || 'Free'}</span></p>
                        <p><strong>剩餘點數:</strong> <span class="credits-count">${user.credits || 0}</span></p>
                        <p><strong>登入時間:</strong> ${new Date().toLocaleString('zh-TW')}</p>
                    </div>
                </div>
            `;
        }

        // 顯示主要內容
        function showMainContent() {
            document.getElementById('main-content').style.display = 'block';
        }

        // 隱藏主要內容
        function hideMainContent() {
            document.getElementById('main-content').style.display = 'none';
        }

        // 呼叫中央 API 的輔助函數
        async function callCentralAPI(endpoint, options = {}) {
            const token = await auth.getToken();
            if (!token) {
                throw new Error('未登入或 token 已過期');
            }

            const response = await fetch(`https://eccal.thinkwithblack.com${endpoint}`, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`API 呼叫失敗: ${response.status}`);
            }

            return await response.json();
        }

        // 使用範例：獲取用戶資料
        async function getUserData() {
            try {
                const userData = await callCentralAPI('/api/account-center/user');
                console.log('用戶資料:', userData);
                return userData;
            } catch (error) {
                console.error('獲取用戶資料失敗:', error);
                throw error;
            }
        }

        // 使用範例：更新用戶點數
        async function updateUserCredits(amount) {
            try {
                const result = await callCentralAPI('/api/account-center/credits', {
                    method: 'POST',
                    body: JSON.stringify({ amount })
                });
                console.log('點數更新結果:', result);
                return result;
            } catch (error) {
                console.error('更新點數失敗:', error);
                throw error;
            }
        }
    </script>

    <!-- 基礎樣式 -->
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        #app {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        #auth-section {
            border: 2px solid #e1e5e9;
            padding: 25px;
            margin: 20px 0;
            border-radius: 10px;
            background: #f8f9fa;
        }
        
        .auth-btn {
            background: #4285f4;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
            margin: 5px;
        }
        
        .auth-btn:hover {
            background: #3367d6;
            transform: translateY(-2px);
        }
        
        .auth-btn.logout {
            background: #dc3545;
        }
        
        .auth-btn.logout:hover {
            background: #c82333;
        }
        
        .auth-note {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
        
        .user-card {
            display: flex;
            align-items: center;
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #e1e5e9;
        }
        
        .user-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin-right: 20px;
            border: 3px solid #4285f4;
        }
        
        .user-details p {
            margin: 8px 0;
            font-size: 15px;
        }
        
        .membership-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .membership-badge.free {
            background: #e9ecef;
            color: #495057;
        }
        
        .membership-badge.pro {
            background: #28a745;
            color: white;
        }
        
        .credits-count {
            font-weight: bold;
            color: #28a745;
        }
        
        #user-actions {
            margin-top: 15px;
        }
        
        #main-content {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 20px;
        }
        
        h3 {
            color: #495057;
            margin-bottom: 15px;
        }
    </style>
</body>
</html>
```

### 3. 可用的 API 端點

#### 3.1 用戶資料相關
```javascript
// 獲取用戶資料
GET /api/account-center/user

// 更新用戶點數
POST /api/account-center/credits
Body: { amount: number }

// 獲取用戶會員狀態
GET /api/account-center/membership
```

#### 3.2 認證相關
```javascript
// SSO 登入
POST /api/sso/login
Body: { googleToken: string, siteName: string }

// 登出
POST /api/sso/logout

// 驗證 token
GET /api/sso/verify
Headers: { Authorization: 'Bearer <token>' }
```

#### 3.3 診斷工具
```javascript
// CORS 和認證診斷
GET /api/account-center/debug
```

### 4. 常見問題解決

#### 4.1 CORS 錯誤
如果遇到 CORS 錯誤，檢查：
1. 你的域名是否在允許清單中
2. 請求是否包含正確的 Origin header
3. 使用診斷 API 檢查設定

#### 4.2 認證失敗
如果認證失敗，檢查：
1. JWT token 是否正確
2. token 是否過期
3. 使用 `auth.checkAuth(true)` 強制重新檢查

#### 4.3 API 呼叫失敗
如果 API 呼叫失敗，檢查：
1. Authorization header 是否正確
2. 端點 URL 是否正確
3. 使用 `callCentralAPI()` 輔助函數

### 5. 部署到 Replit

#### 5.1 基本設定
1. 在 Replit 中建立新專案
2. 上傳你的 HTML/CSS/JS 檔案
3. 設定 `.replit` 檔案：

```ini
[deployment]
run = ["python", "-m", "http.server", "3000"]
deploymentTarget = "static"

[nix]
channel = "stable-21_11"

[languages.html]
pattern = "**/*.html"
[languages.html.languageServer]
start = "vscode-html-language-server --stdio"
[languages.html.languageServer.configuration.html]
customData = [ ]
[languages.html.languageServer.configuration.html.completion]
attributeDefaultValue = "doublequotes"
[languages.html.languageServer.configuration.html.format]
enable = true
wrapLineLength = 120
unformatted = "wbr"
contentUnformatted = "pre,code,textarea"
indentInnerHtml = false
preserveNewLines = true
indentHandlebars = false
endWithNewline = false
insertFinalNewline = false
wrapAttributes = "auto"
wrapAttributesIndentSize = 4
maxPreserveNewLines = 32767
```

#### 5.2 自訂域名設定
1. 在 Replit 專案設定中選擇 "Deployments"
2. 點擊 "Custom Domain"
3. 輸入你的子域名 (例如: `audai.thinkwithblack.com`)
4. 按照指示設定 DNS 記錄

### 6. 測試檢查清單

部署完成後，請檢查以下項目：

- [ ] 頁面能正常載入
- [ ] Google 登入按鈕能正常顯示
- [ ] 點擊登入能跳轉到 Google OAuth
- [ ] 登入後能正常顯示用戶資訊
- [ ] 能正常呼叫中央 API
- [ ] 登出功能正常運作
- [ ] 重新整理頁面後登入狀態保持

### 7. 範例專案結構

```
your-replit-project/
├── index.html          # 主頁面 (包含上述完整程式碼)
├── style.css           # 額外樣式 (可選)
├── script.js           # 額外功能 (可選)
├── .replit             # Replit 設定檔
└── README.md           # 專案說明
```

### 8. 支援與維護

如有問題，請檢查：
1. 瀏覽器開發者工具的 Console 錯誤訊息
2. 網路請求是否正常
3. 中央認證系統是否正常運作

如需協助，請聯繫主系統維護人員。

---

**重要提醒**: 
- 確保你的域名已在中央系統的允許清單中
- 測試時請使用 HTTPS 連線
- 定期更新 SDK 以獲得最新功能
- 保持與中央認證系統的版本同步