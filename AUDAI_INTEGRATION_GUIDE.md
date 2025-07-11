# AudAI 整合指南 - 統一認證系統

## 概述
AudAI 服務現在可以整合 eccal.thinkwithblack.com 的統一認證系統，提供單點登入 (SSO) 功能。

## 快速開始

### 1. 基本 HTML 整合
將以下代碼添加到你的 HTML 頁面：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AudAI - AI 音頻分析</title>
</head>
<body>
    <div id="app">
        <div id="login-section">
            <h2>登入 AudAI</h2>
            <button id="google-login-btn">Google 登入</button>
            <div id="auth-status">尚未登入</div>
        </div>
        
        <div id="user-section" style="display: none;">
            <h2>歡迎回來</h2>
            <p>用戶：<span id="user-name"></span></p>
            <p>Email：<span id="user-email"></span></p>
            <p>會員等級：<span id="user-membership"></span></p>
            <p>剩餘點數：<span id="user-credits"></span></p>
            <button id="logout-btn">登出</button>
        </div>
    </div>

    <!-- 整合認證 SDK -->
    <script src="https://eccal.thinkwithblack.com/eccal-auth-sdk.js"></script>
    
    <script>
        // 初始化認證系統
        const auth = new EccalAuth({
            serviceName: 'audai',
            apiBaseUrl: 'https://eccal.thinkwithblack.com',
            onAuthSuccess: (user) => {
                console.log('認證成功:', user);
                showUserSection(user);
            },
            onAuthError: (error) => {
                console.error('認證失敗:', error);
                showLoginSection();
            }
        });

        // 顯示用戶資訊
        function showUserSection(user) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('user-section').style.display = 'block';
            
            document.getElementById('user-name').textContent = user.name;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('user-membership').textContent = user.membership;
            document.getElementById('user-credits').textContent = user.credits;
        }

        // 顯示登入區域
        function showLoginSection() {
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('user-section').style.display = 'none';
        }

        // Google 登入按鈕
        document.getElementById('google-login-btn').addEventListener('click', () => {
            auth.loginWithGoogle();
        });

        // 登出按鈕
        document.getElementById('logout-btn').addEventListener('click', () => {
            auth.logout();
            showLoginSection();
        });

        // 頁面載入時檢查認證狀態
        window.addEventListener('load', () => {
            auth.checkAuthStatus();
        });
    </script>
</body>
</html>
```

### 2. API 整合方式

#### 直接 API 調用
```javascript
// Google SSO 認證
async function authenticateWithGoogle(googleUserData) {
    try {
        const response = await fetch('https://eccal.thinkwithblack.com/api/auth/google-sso', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://audai.thinkwithblack.com'
            },
            body: JSON.stringify({
                email: googleUserData.email,
                name: googleUserData.name,
                picture: googleUserData.picture,
                service: 'audai'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            // 儲存 JWT Token
            localStorage.setItem('eccal_token', data.token);
            localStorage.setItem('eccal_user', JSON.stringify(data.user));
            
            return data.user;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('認證失敗:', error);
        throw error;
    }
}

// 獲取用戶資料
async function getUserData(userId) {
    const token = localStorage.getItem('eccal_token');
    
    try {
        const response = await fetch(`https://eccal.thinkwithblack.com/api/account-center/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('獲取用戶資料失敗:', error);
        throw error;
    }
}

// 獲取用戶點數
async function getUserCredits(userId) {
    const token = localStorage.getItem('eccal_token');
    
    try {
        const response = await fetch(`https://eccal.thinkwithblack.com/api/account-center/credits/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('獲取點數失敗:', error);
        throw error;
    }
}
```

## 可用的 API 端點

### 認證相關
- `POST /api/auth/google-sso` - Google SSO 認證
- `POST /api/sso/logout` - 單點登出
- `POST /api/sso/verify-token` - 驗證 Token

### 用戶資料
- `GET /api/account-center/user/:userId` - 獲取用戶資料
- `PUT /api/account-center/user/:userId` - 更新用戶資料
- `GET /api/account-center/credits/:userId` - 獲取點數資料
- `GET /api/account-center/membership/:userId` - 獲取會員資料

### 系統狀態
- `GET /api/account-center/health` - 健康檢查
- `GET /api/account-center/allowed-origins` - 允許的域名清單

## 用戶權限和功能

### 免費用戶 (Free)
- 基本功能訪問
- 30 點數歡迎獎勵
- 有限的 API 調用

### 付費用戶 (Pro)
- 完整功能訪問
- 無限制 API 調用
- 優先技術支援

## 整合步驟

### Step 1: 設置 Google OAuth
1. 在 [Google Cloud Console](https://console.cloud.google.com/) 創建 OAuth 2.0 客戶端
2. 添加 `https://audai.thinkwithblack.com` 到授權域名
3. 獲取客戶端 ID 和密鑰

### Step 2: 實作前端認證流程
1. 引入 Google OAuth JavaScript SDK
2. 整合 eccal-auth-sdk.js
3. 設置認證回調函數

### Step 3: 後端整合
1. 處理 Google OAuth 回調
2. 調用 eccal 認證 API
3. 管理 JWT Token 和用戶 session

### Step 4: 測試和除錯
1. 測試認證流程
2. 驗證用戶資料同步
3. 測試跨域請求

## 範例場景

### 場景 1: 用戶首次登入
```javascript
// 用戶點擊 Google 登入後
googleAuth.signIn().then(async (googleUser) => {
    const profile = googleUser.getBasicProfile();
    
    // 調用 eccal 認證 API
    const user = await authenticateWithGoogle({
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl()
    });
    
    // 新用戶自動獲得 30 點數
    console.log('歡迎新用戶！您已獲得 30 點數');
    
    // 跳轉到主應用頁面
    window.location.href = '/dashboard';
});
```

### 場景 2: 檢查用戶會員狀態
```javascript
async function checkMembershipStatus(userId) {
    const membership = await fetch(`https://eccal.thinkwithblack.com/api/account-center/membership/${userId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('eccal_token')}`
        }
    }).then(res => res.json());
    
    if (membership.level === 'free') {
        // 顯示升級提示
        showUpgradePrompt();
    } else {
        // 提供完整功能
        enableProFeatures();
    }
}
```

## 常見問題

### Q: 如何處理 Token 過期？
A: SDK 會自動處理 Token 刷新，你也可以監聽 `tokenExpired` 事件。

### Q: 如何實現單點登出？
A: 調用 `/api/sso/logout` 端點，並清除本地儲存的 Token。

### Q: 如何測試整合是否正常？
A: 使用 `/api/account-center/health` 端點檢查系統狀態。

## 技術支援

如有整合問題，請聯繫：
- Email: tech@thinkwithblack.com
- 技術文檔: https://eccal.thinkwithblack.com/docs
- 測試環境: https://eccal.thinkwithblack.com/test-member-center.html

## 更新日誌

- 2025-07-11: 完成 Google SSO 認證系統
- 2025-07-11: 添加自動點數分配功能
- 2025-07-11: 支援跨域認證和 CORS 設定