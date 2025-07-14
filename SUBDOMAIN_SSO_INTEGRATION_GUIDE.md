# 子域名 SSO 整合指南

## 概述
本指南協助其他 Replit 專案整合 eccal.thinkwithblack.com 的統一認證系統。

## 1. 快速整合步驟

### 步驟 1: 下載認證 SDK
```javascript
// 複製以下 SDK 到你的專案
const EccalAuth = {
  baseURL: 'https://eccal.thinkwithblack.com',
  
  // Google SSO 登入
  async googleLogin(service = 'subdomain') {
    const params = new URLSearchParams({
      service: service,
      origin: window.location.origin,
      returnTo: window.location.href
    });
    
    window.location.href = `${this.baseURL}/api/sso/login?${params}`;
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

### 步驟 2: 基本 HTML 整合
```html
<!DOCTYPE html>
<html>
<head>
    <title>子域名服務</title>
    <style>
        .auth-container { max-width: 600px; margin: 50px auto; padding: 20px; }
        .login-btn { background: #4285f4; color: white; padding: 10px 20px; border: none; cursor: pointer; }
        .user-info { background: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <div class="auth-container">
        <h1>子域名服務 - 統一認證</h1>
        
        <div id="loginSection">
            <h2>請登入</h2>
            <button class="login-btn" onclick="login()">使用 Google 登入</button>
        </div>
        
        <div id="userSection" style="display: none;">
            <h2>用戶資料</h2>
            <div id="userInfo" class="user-info"></div>
            <button onclick="testDeductCredits()">測試扣除 1 點數</button>
            <button onclick="logout()">登出</button>
        </div>
        
        <div id="messages"></div>
    </div>

    <script>
        // SDK 代碼在此處...
        
        // 初始化
        window.onload = function() {
            initAuth();
        };
        
        function initAuth() {
            // 檢查 URL 是否有 token 參數
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            
            if (token) {
                // 儲存 token
                localStorage.setItem('eccal_token', token);
                
                // 清除 URL 參數
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // 驗證 token
                verifyAndDisplayUser(token);
            } else {
                // 檢查是否有儲存的 token
                const savedToken = localStorage.getItem('eccal_token');
                if (savedToken) {
                    verifyAndDisplayUser(savedToken);
                }
            }
        }
        
        async function verifyAndDisplayUser(token) {
            const result = await EccalAuth.verifyToken(token);
            
            if (result.success && result.valid) {
                // 獲取完整用戶資料
                const userData = await EccalAuth.getUserData(result.user.id);
                
                if (userData.success) {
                    displayUserInfo(userData.user);
                } else {
                    showError('無法獲取用戶資料');
                }
            } else {
                showError('Token 驗證失敗，請重新登入');
                localStorage.removeItem('eccal_token');
            }
        }
        
        function displayUserInfo(user) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('userSection').style.display = 'block';
            
            // 正確的會員等級顯示和判斷
            const membershipBadge = user.membership === 'pro' ? 
                '<span style="color: gold; font-weight: bold;">PRO</span>' : 
                '<span style="color: gray;">FREE</span>';
            
            document.getElementById('userInfo').innerHTML = `
                <p><strong>姓名：</strong> ${user.name}</p>
                <p><strong>Email：</strong> ${user.email}</p>
                <p><strong>會員等級：</strong> ${membershipBadge}</p>
                <p><strong>可用點數：</strong> ${user.credits}</p>
                <p><strong>用戶 ID：</strong> ${user.id}</p>
            `;
            
            // 基於會員等級的功能控制示例
            if (user.membership === 'pro') {
                console.log('用戶是 Pro 會員，提供完整功能');
                // 啟用 Pro 功能
            } else {
                console.log('用戶是免費會員，提供基本功能');
                // 限制功能或提示升級
            }
        }
        
        function login() {
            EccalAuth.googleLogin('subdomain');
        }
        
        function logout() {
            localStorage.removeItem('eccal_token');
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('userSection').style.display = 'none';
            document.getElementById('messages').innerHTML = '';
        }
        
        async function testDeductCredits() {
            const token = localStorage.getItem('eccal_token');
            if (!token) {
                showError('請先登入');
                return;
            }
            
            const result = await EccalAuth.verifyToken(token);
            if (!result.success) {
                showError('Token 無效，請重新登入');
                return;
            }
            
            const deductResult = await EccalAuth.deductCredits(
                result.user.id,
                1,
                '測試扣除',
                'subdomain'
            );
            
            if (deductResult.success) {
                showSuccess(`扣除成功！剩餘點數：${deductResult.remainingCredits}`);
                
                // 重新載入用戶資料
                verifyAndDisplayUser(token);
            } else {
                showError(`扣除失敗：${deductResult.error}`);
            }
        }
        
        function showError(message) {
            document.getElementById('messages').innerHTML = `<div class="error">${message}</div>`;
        }
        
        function showSuccess(message) {
            document.getElementById('messages').innerHTML = `<div class="success">${message}</div>`;
        }
    </script>
</body>
</html>
```

## 2. API 端點說明

### 認證端點
- `POST /api/auth/google-sso` - Google SSO 登入
- `POST /api/sso/verify-token` - 驗證 JWT Token
- `POST /api/sso/refresh-token` - 刷新 Token

### 用戶資料端點
- `GET /api/account-center/user/{userId}` - 獲取用戶資料
- `GET /api/account-center/credits/{userId}` - 獲取用戶點數
- `POST /api/account-center/credits/{userId}/deduct` - 扣除用戶點數

## 3. 重要注意事項

### CORS 設定
系統已預設允許以下域名：
- https://eccal.thinkwithblack.com
- https://audai.thinkwithblack.com
- https://quote.thinkwithblack.com
- https://sub3.thinkwithblack.com
- https://sub4.thinkwithblack.com
- https://sub5.thinkwithblack.com
- https://member.thinkwithblack.com

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

### 錯誤處理
所有 API 回應都包含以下結構：
```json
{
  "success": true/false,
  "error": "錯誤訊息",
  "code": "錯誤代碼",
  "data": {...}
}
```

## 4. 測試指南

1. **部署你的子域名服務**
2. **添加 HTML 整合代碼**
3. **測試登入流程**
4. **測試 API 調用**
5. **測試點數扣除**

## 5. 故障排除

### 常見問題
1. **CORS 錯誤** - 確認域名已在允許清單中
2. **Token 驗證失敗** - 檢查 token 是否過期
3. **API 調用失敗** - 檢查 Origin 標頭是否正確

### 調試端點
- `GET /api/account-center/debug` - 獲取請求詳情
- `GET /api/account-center/health` - 檢查系統狀態

## 6. 支援

如需技術支援，請聯繫：
- Email: backtrue@thinkwithblack.com
- 技術文檔：本指南

---

**最後更新：2025-01-14**
**重要修正：修復了會員等級欄位映射問題 (membership vs membership_level)**