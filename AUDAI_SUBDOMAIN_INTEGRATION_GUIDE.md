# AudAI 子域名整合指南 - 共用登入系統

## 概述

為 `audai.thinkwithblack.com` 設置與主系統 `eccal.thinkwithblack.com` 共用的 JWT 認證系統。

## 系統架構

### 主認證中心
- **域名**: `eccal.thinkwithblack.com`
- **功能**: 中央認證服務器，處理所有 Google OAuth 和 JWT 管理
- **API 端點**: `/api/sso/*` 和 `/api/account-center/*`

### 子服務
- **域名**: `audai.thinkwithblack.com`
- **功能**: 使用共用認證系統的獨立應用程式
- **認證方式**: 通過 JavaScript SDK 與主系統通信

## 設置步驟

### 1. 配置 CORS 和允許域名

已將 `audai.thinkwithblack.com` 添加到允許的域名清單：

```javascript
// server/accountCenterRoutes.ts
const ALLOWED_ORIGINS = [
  'https://eccal.thinkwithblack.com',
  'https://audai.thinkwithblack.com',  // 新增
  // ... 其他域名
];
```

### 2. 在 AudAI 網站中整合認證

在 `audai.thinkwithblack.com` 的 HTML 頁面中加入以下程式碼：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AudAI - AI 音頻分析服務</title>
</head>
<body>
    <div id="app">
        <!-- 認證狀態區域 -->
        <div id="auth-section">
            <div id="login-area" style="display: none;">
                <h3>請先登入</h3>
                <button id="login-btn" class="auth-btn">登入 AudAI</button>
            </div>
            
            <div id="user-area" style="display: none;">
                <h3>歡迎回來！</h3>
                <div id="user-info"></div>
                <button id="logout-btn" class="auth-btn logout">登出</button>
            </div>
        </div>
        
        <!-- 主要應用程式內容 -->
        <div id="main-content" style="display: none;">
            <h1>AudAI - AI 音頻分析</h1>
            <p>這裡是你的主要應用程式內容</p>
            <!-- 你的 AudAI 功能在這裡 -->
        </div>
    </div>

    <!-- 載入認證 SDK -->
    <script src="https://eccal.thinkwithblack.com/eccal-auth-sdk.js"></script>
    <script>
        // 初始化認證系統
        const auth = new EccalAuth({
            baseUrl: 'https://eccal.thinkwithblack.com',
            siteName: 'AudAI',
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
                alert('認證發生錯誤，請重試');
            }
        });

        // 頁面載入時檢查認證狀態
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const user = await auth.checkAuth();
                if (user) {
                    showUserArea(user);
                    showMainContent();
                } else {
                    showLoginArea();
                }
            } catch (error) {
                console.error('認證檢查失敗:', error);
                showLoginArea();
            }
        });

        // 登入按鈕事件
        document.getElementById('login-btn').addEventListener('click', () => {
            auth.login();
        });

        // 登出按鈕事件
        document.getElementById('logout-btn').addEventListener('click', () => {
            auth.logout();
        });

        // 顯示登入區域
        function showLoginArea() {
            document.getElementById('login-area').style.display = 'block';
            document.getElementById('user-area').style.display = 'none';
        }

        // 顯示用戶區域
        function showUserArea(user) {
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('user-area').style.display = 'block';
            document.getElementById('user-info').innerHTML = `
                <p><strong>姓名:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>會員等級:</strong> ${user.membership || 'Free'}</p>
                <p><strong>點數:</strong> ${user.credits || 0}</p>
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
    </script>

    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        #app {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        #auth-section {
            border: 2px solid #e0e0e0;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            background: #f9f9f9;
        }
        
        #user-info {
            background: #f0f8ff;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        
        .auth-btn {
            background: #007cba;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
        }
        
        .auth-btn:hover {
            background: #005a8a;
        }
        
        .auth-btn.logout {
            background: #dc3545;
        }
        
        .auth-btn.logout:hover {
            background: #c82333;
        }
        
        #main-content {
            margin-top: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
    </style>
</body>
</html>
```

### 3. 認證流程說明

#### 登入流程
1. 用戶點擊「登入 AudAI」按鈕
2. 系統重定向到 `eccal.thinkwithblack.com/api/sso/login?origin=https://audai.thinkwithblack.com`
3. 用戶完成 Google OAuth 認證
4. 系統生成 JWT token 並重定向回 AudAI
5. AudAI 接收 token 並顯示用戶資訊

#### 認證檢查流程
1. 頁面載入時，SDK 自動檢查本地存儲的 JWT token
2. 向 `eccal.thinkwithblack.com/api/sso/verify-token` 驗證 token 有效性
3. 如果有效，獲取用戶資訊並顯示
4. 如果無效，顯示登入介面

#### 登出流程
1. 用戶點擊「登出」按鈕
2. SDK 調用 `eccal.thinkwithblack.com/api/sso/logout` 端點
3. 清除本地存儲的 token
4. 重定向到登入狀態

### 4. 可用的 API 端點

#### 認證相關
- `GET /api/sso/login` - 單點登入
- `GET /api/sso/callback` - 登入回調
- `POST /api/sso/logout` - 單點登出
- `POST /api/sso/verify-token` - 驗證 token
- `POST /api/sso/refresh-token` - 刷新 token

#### 用戶資料相關
- `GET /api/account-center/user/:userId` - 獲取用戶資料
- `PUT /api/account-center/user/:userId` - 更新用戶資料
- `GET /api/account-center/membership/:userId` - 獲取會員資訊
- `GET /api/account-center/credits/:userId` - 獲取點數資訊

### 5. 使用範例

#### 檢查用戶認證狀態
```javascript
const user = await auth.checkAuth();
if (user) {
    console.log('用戶已登入:', user);
    // 顯示用戶專屬內容
} else {
    console.log('用戶未登入');
    // 顯示登入按鈕
}
```

#### 獲取用戶詳細資訊
```javascript
const user = await auth.checkAuth();
if (user) {
    const userDetails = await auth.getUserDetails(user.id);
    console.log('用戶詳細資訊:', userDetails);
    console.log('會員等級:', userDetails.membership);
    console.log('點數餘額:', userDetails.credits);
}
```

#### 執行需要認證的 API 呼叫
```javascript
// 假設 AudAI 有自己的 API 端點
const response = await fetch('/api/audai/analyze', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.getToken()}`
    },
    body: JSON.stringify({
        audioFile: 'path/to/audio.mp3'
    })
});
```

### 6. 安全性考量

1. **HTTPS 必須**: 所有通信都必須使用 HTTPS
2. **Token 過期**: JWT token 有 7 天有效期
3. **自動刷新**: SDK 會自動處理 token 刷新
4. **CORS 限制**: 只允許指定域名訪問認證 API
5. **httpOnly Cookies**: 敏感 token 使用 httpOnly cookies 存儲

### 7. 測試步驟

1. 部署 AudAI 網站到 `audai.thinkwithblack.com`
2. 訪問網站，應該看到登入介面
3. 點擊登入按鈕，會跳轉到 Google OAuth
4. 完成認證後，自動返回 AudAI 並顯示用戶資訊
5. 點擊登出按鈕，確認清除認證狀態

### 8. 故障排除

#### 常見問題
1. **CORS 錯誤**: 確認 `audai.thinkwithblack.com` 已添加到允許域名清單
2. **Token 無效**: 檢查 JWT_SECRET 環境變數是否正確
3. **重定向錯誤**: 確認回調 URL 設置正確
4. **Cookie 問題**: 確認兩個域名都使用 HTTPS

#### 除錯方法
1. 打開瀏覽器開發者工具
2. 檢查 Console 是否有錯誤訊息
3. 檢查 Network 標籤頁的 API 呼叫
4. 檢查 Application 標籤頁的 localStorage 和 cookies

## 總結

這個共用登入系統讓 AudAI 能夠：
- 使用與主系統相同的用戶帳戶
- 共享會員等級和點數資訊
- 提供無縫的用戶體驗
- 維護統一的認證標準

系統已經配置完成，你只需要按照上述步驟在 AudAI 網站中整合認證功能即可。