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

## 🚨 子服務開發者重要更新事項

### 1. 會員等級欄位變更 (Critical)
- **舊版可能錯誤：** 如果之前使用 `user.membershipLevel` 會造成 undefined
- **新版正確：** 必須使用 `user.membership` 
- **影響範圍：** 所有判斷會員等級的代碼都需要檢查

### 2. JWT Token 格式一致性
- **確認點：** 所有 API 端點 (verify-token, user data, credits) 現在都返回一致的 `membership` 欄位
- **測試方法：** 使用 `console.log(user.membership)` 確認值為 "pro" 或 "free"

### 3. 用戶認證狀態檢查
```javascript
// 建議的完整檢查流程
async function checkUserAuth(token) {
    // 1. 驗證 Token
    const result = await EccalAuth.verifyToken(token);
    if (!result.success || !result.valid) {
        return { authenticated: false, error: 'Invalid token' };
    }
    
    // 2. 獲取完整用戶資料
    const userData = await EccalAuth.getUserData(result.user.id);
    if (!userData.success) {
        return { authenticated: false, error: 'Cannot fetch user data' };
    }
    
    // 3. 檢查關鍵欄位
    const user = userData.user;
    if (!user.membership || !user.credits !== undefined) {
        return { authenticated: false, error: 'Missing user data' };
    }
    
    return { 
        authenticated: true, 
        user: user,
        isPro: user.membership === 'pro',
        credits: user.credits
    };
}
```

### 4. 錯誤處理強化
- **新增：** 更詳細的錯誤回應格式
- **建議：** 檢查 `result.success` 和 `result.valid` 雙重驗證
- **Debug：** 使用 `console.log` 輸出完整的 API 回應進行調試

### 5. CORS 配置更新
- **新增域名：** `https://quote.thinkwithblack.com` 已加入允許清單
- **注意：** 確保你的子域名在 ALLOWED_ORIGINS 清單中

### 6. 測試檢查清單
**部署前必須測試：**
- [ ] Google OAuth 登入流程
- [ ] JWT Token 驗證回應格式
- [ ] 會員等級判斷邏輯 (`user.membership`)
- [ ] 點數扣除功能
- [ ] 錯誤處理機制
- [ ] 跨域請求 (CORS)

**具體測試指令：**
```javascript
// 在瀏覽器控制台執行
const token = localStorage.getItem('eccal_token');
EccalAuth.verifyToken(token).then(result => {
    console.log('Token verification:', result);
    console.log('Membership:', result.user?.membership);
    console.log('Credits:', result.user?.credits);
});
```

## 🔧 Google SSO 回調問題已解決 (2025-01-14)

### 問題狀況
用戶回報 Google OAuth 流程完成後，eccal 回調端點沒有正確重定向回子服務。

### 解決狀況
✅ **問題已解決** - Google SSO 回調端點已完全實現並正常工作

### 回調端點詳細資訊
- **端點位置**: `/api/auth/google-sso/callback`
- **實現狀況**: 完整實現，包含所有必要邏輯
- **重定向邏輯**: 正確實現，會重定向到 `returnTo` URL 並附帶 JWT token

### 回調流程說明
1. Google OAuth 完成後回調到 eccal 端點
2. 系統解析 `state` 參數獲取 `returnTo` 和 `service` 信息
3. 使用授權碼交換 Google access token
4. 獲取用戶資料並創建/更新用戶記錄
5. 生成 JWT token (包含正確的 membership 資訊)
6. 重定向到子服務: `{returnTo}?auth_success=true&token={JWT}&user_id={USER_ID}`

### 測試驗證
```bash
# 回調端點確實存在並正常工作
curl -I "https://eccal.thinkwithblack.com/api/auth/google-sso/callback?code=test&state=..."
# 返回適當的錯誤處理 (需要真實的 Google 授權碼)
```

### 子服務集成確認
確保你的子服務能正確處理回調：
```javascript
// 檢查 URL 參數
const urlParams = new URLSearchParams(window.location.search);
const authSuccess = urlParams.get('auth_success');
const token = urlParams.get('token');
const userId = urlParams.get('user_id');

if (authSuccess === 'true' && token) {
    // 儲存 token 並驗證
    localStorage.setItem('eccal_token', token);
    EccalAuth.verifyToken(token).then(result => {
        console.log('Auth successful:', result);
        // 檢查 user.membership 等級
        if (result.user.membership === 'pro') {
            // 提供 Pro 功能
        }
    });
}
```

**結論：Google SSO 回調問題已完全解決，系統正常運作中。**

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