# 子服務 SSO 整合指南
## 跨網站登入系統實作手冊

### 📋 概述

本指南說明如何將子服務 (audai.thinkwithblack.com、sub3.thinkwithblack.com 等) 與主服務 (eccal.thinkwithblack.com) 的統一認證系統整合。

### 🎯 整合架構

```
主服務 (eccal.thinkwithblack.com)
├── 認證中心 API
├── 用戶資料庫
├── JWT Token 管理
└── 跨域 CORS 設定

子服務 (audai.thinkwithblack.com)
├── 前端 UI 介面
├── eccal-auth-sdk.js 整合
└── 用戶狀態管理
```

### 🔧 實作步驟

#### 步驟 1：引入認證 SDK

在子服務的 HTML 頁面中引入認證 SDK：

```html
<script src="https://eccal.thinkwithblack.com/eccal-auth-sdk.js"></script>
```

#### 步驟 2：初始化認證系統

```javascript
// 初始化認證系統
const auth = new EccalAuth({
    baseUrl: 'https://eccal.thinkwithblack.com',
    siteName: 'AudAI 服務',  // 替換為你的服務名稱
    onLogin: (user) => {
        console.log('用戶登入成功:', user);
        updateUIForLoggedInUser(user);
    },
    onLogout: () => {
        console.log('用戶登出');
        updateUIForLoggedOutUser();
    },
    onError: (error) => {
        console.error('認證錯誤:', error);
        showErrorMessage(error.message);
    }
});
```

#### 步驟 3：Google OAuth 整合

```javascript
// Google OAuth 登入函數
async function handleGoogleLogin(googleUser) {
    try {
        // 獲取 Google 用戶資料
        const profile = googleUser.getBasicProfile();
        const userData = {
            email: profile.getEmail(),
            name: profile.getName(),
            picture: profile.getImageUrl(),
            service: 'audai'  // 替換為你的服務名稱
        };
        
        // 呼叫主服務認證 API
        const response = await fetch('https://eccal.thinkwithblack.com/api/auth/google-sso', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 儲存認證資料
            localStorage.setItem('eccal_auth_token', result.token);
            localStorage.setItem('eccal_auth_user', JSON.stringify(result.user));
            
            // 更新 UI
            updateUIForLoggedInUser(result.user);
        } else {
            throw new Error(result.error || '認證失敗');
        }
    } catch (error) {
        console.error('Google 登入失敗:', error);
        showErrorMessage('登入失敗，請稍後再試');
    }
}
```

#### 步驟 4：檢查認證狀態

```javascript
// 檢查現有認證狀態
function checkAuthStatus() {
    const token = localStorage.getItem('eccal_auth_token');
    const userStr = localStorage.getItem('eccal_auth_user');
    
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            updateUIForLoggedInUser(user);
        } catch (error) {
            console.error('認證資料解析失敗:', error);
            clearAuthData();
        }
    }
}

// 清除認證資料
function clearAuthData() {
    localStorage.removeItem('eccal_auth_token');
    localStorage.removeItem('eccal_auth_user');
    updateUIForLoggedOutUser();
}
```

### 🛠️ 完整範例程式碼

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AudAI 服務</title>
    <script src="https://apis.google.com/js/platform.js" async defer></script>
    <script src="https://eccal.thinkwithblack.com/eccal-auth-sdk.js"></script>
    <meta name="google-signin-client_id" content="YOUR_GOOGLE_CLIENT_ID">
</head>
<body>
    <div id="loginSection">
        <h2>請登入以使用 AudAI 服務</h2>
        <div class="g-signin2" data-onsuccess="onSignIn"></div>
    </div>
    
    <div id="userSection" style="display: none;">
        <h2>歡迎回來！</h2>
        <p>用戶: <span id="userName"></span></p>
        <p>信箱: <span id="userEmail"></span></p>
        <p>會員等級: <span id="userMembership"></span></p>
        <p>點數: <span id="userCredits"></span></p>
        <button onclick="signOut()">登出</button>
    </div>

    <script>
        // 初始化認證系統
        const auth = new EccalAuth({
            baseUrl: 'https://eccal.thinkwithblack.com',
            siteName: 'AudAI 服務',
            onLogin: (user) => {
                updateUIForLoggedInUser(user);
            },
            onLogout: () => {
                updateUIForLoggedOutUser();
            },
            onError: (error) => {
                console.error('認證錯誤:', error);
                alert('認證失敗: ' + error.message);
            }
        });

        // Google 登入成功回調
        async function onSignIn(googleUser) {
            try {
                const profile = googleUser.getBasicProfile();
                const userData = {
                    email: profile.getEmail(),
                    name: profile.getName(),
                    picture: profile.getImageUrl(),
                    service: 'audai'
                };
                
                const response = await fetch('https://eccal.thinkwithblack.com/api/auth/google-sso', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': window.location.origin
                    },
                    body: JSON.stringify(userData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    localStorage.setItem('eccal_auth_token', result.token);
                    localStorage.setItem('eccal_auth_user', JSON.stringify(result.user));
                    updateUIForLoggedInUser(result.user);
                } else {
                    throw new Error(result.error || '認證失敗');
                }
            } catch (error) {
                console.error('Google 登入失敗:', error);
                alert('登入失敗: ' + error.message);
            }
        }

        // 更新登入狀態 UI
        function updateUIForLoggedInUser(user) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('userSection').style.display = 'block';
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userMembership').textContent = user.membership;
            document.getElementById('userCredits').textContent = user.credits;
        }

        // 更新登出狀態 UI
        function updateUIForLoggedOutUser() {
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('userSection').style.display = 'none';
        }

        // 登出函數
        function signOut() {
            const auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                localStorage.removeItem('eccal_auth_token');
                localStorage.removeItem('eccal_auth_user');
                updateUIForLoggedOutUser();
            });
        }

        // 頁面載入時檢查認證狀態
        document.addEventListener('DOMContentLoaded', function() {
            checkAuthStatus();
        });

        function checkAuthStatus() {
            const token = localStorage.getItem('eccal_auth_token');
            const userStr = localStorage.getItem('eccal_auth_user');
            
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    updateUIForLoggedInUser(user);
                } catch (error) {
                    console.error('認證資料解析失敗:', error);
                    localStorage.removeItem('eccal_auth_token');
                    localStorage.removeItem('eccal_auth_user');
                }
            }
        }
    </script>
</body>
</html>
```

### ⚠️ 重要注意事項與常見錯誤

#### 1. **CORS 設定問題**
```javascript
// ❌ 錯誤：缺少 Origin 標頭
fetch('https://eccal.thinkwithblack.com/api/auth/google-sso', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
});

// ✅ 正確：包含 Origin 標頭
fetch('https://eccal.thinkwithblack.com/api/auth/google-sso', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin  // 必須包含
    },
    body: JSON.stringify(userData)
});
```

#### 2. **服務名稱設定**
```javascript
// ❌ 錯誤：使用錯誤的服務名稱
const userData = {
    email: profile.getEmail(),
    name: profile.getName(),
    picture: profile.getImageUrl(),
    service: 'eccal'  // 錯誤！應該是子服務名稱
};

// ✅ 正確：使用正確的服務名稱
const userData = {
    email: profile.getEmail(),
    name: profile.getName(),
    picture: profile.getImageUrl(),
    service: 'audai'  // 正確的子服務名稱
};
```

#### 3. **JWT Token 儲存**
```javascript
// ❌ 錯誤：直接儲存 response
localStorage.setItem('token', response);

// ✅ 正確：儲存 JWT token
localStorage.setItem('eccal_auth_token', result.token);
localStorage.setItem('eccal_auth_user', JSON.stringify(result.user));
```

#### 4. **錯誤處理**
```javascript
// ❌ 錯誤：沒有錯誤處理
const response = await fetch(url, options);
const result = await response.json();

// ✅ 正確：完整的錯誤處理
try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.error || '認證失敗');
    }
    
    // 處理成功結果
} catch (error) {
    console.error('認證錯誤:', error);
    showErrorMessage(error.message);
}
```

#### 5. **Google Client ID 設定**
```html
<!-- ❌ 錯誤：缺少或錯誤的 Client ID -->
<meta name="google-signin-client_id" content="">

<!-- ✅ 正確：設定正確的 Google Client ID -->
<meta name="google-signin-client_id" content="YOUR_GOOGLE_CLIENT_ID">
```

### 🔍 除錯與測試

#### 1. **測試認證流程**
```javascript
// 測試認證 API 連線
async function testAuth() {
    try {
        const response = await fetch('https://eccal.thinkwithblack.com/api/auth/google-sso', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify({
                email: 'test@example.com',
                name: 'Test User',
                picture: 'https://example.com/avatar.jpg',
                service: 'audai'
            })
        });
        
        const result = await response.json();
        console.log('認證測試結果:', result);
        
        if (result.success) {
            console.log('✅ 認證 API 連線正常');
        } else {
            console.error('❌ 認證失敗:', result.error);
        }
    } catch (error) {
        console.error('❌ 連線失敗:', error);
    }
}
```

#### 2. **檢查網路問題**
```javascript
// 檢查 CORS 設定
fetch('https://eccal.thinkwithblack.com/api/account-center/health')
    .then(response => response.json())
    .then(data => console.log('✅ CORS 設定正常:', data))
    .catch(error => console.error('❌ CORS 問題:', error));
```

### 📞 技術支援

如果遇到問題，請檢查：

1. **網路連線**：確保可以連接到 eccal.thinkwithblack.com
2. **CORS 設定**：確認 Origin 標頭正確設定
3. **服務名稱**：確認 service 參數使用正確的子服務名稱
4. **Google Client ID**：確認 Google OAuth 設定正確
5. **瀏覽器控制台**：檢查是否有 JavaScript 錯誤訊息

### 🎯 檢查清單

整合完成前，請確認：

- [ ] 已引入 eccal-auth-sdk.js
- [ ] 已設定正確的 Google Client ID
- [ ] 已實作 onSignIn 回調函數
- [ ] 已設定正確的服務名稱
- [ ] 已實作錯誤處理機制
- [ ] 已測試登入/登出流程
- [ ] 已實作 UI 狀態更新
- [ ] 已測試認證資料持久化

### 📈 效能最佳化建議

1. **快取認證狀態**：使用 localStorage 儲存認證資料
2. **錯誤重試**：實作認證失敗重試機制
3. **Loading 狀態**：顯示載入中狀態提升用戶體驗
4. **Token 刷新**：實作 JWT token 自動刷新機制

---

**版本**: V1.0.0  
**最後更新**: 2025-07-11  
**維護者**: 邱煜庭（邱小黑）  
**聯絡信箱**: backtrue@thinkwithblack.com