# AudAI 快速開始 - 5 分鐘整合指南

## 🚀 立即開始

### 1. 複製這段代碼到你的 HTML
```html
<!-- 引入認證 SDK -->
<script src="https://eccal.thinkwithblack.com/eccal-auth-sdk.js"></script>

<!-- 登入按鈕 -->
<button id="google-login">Google 登入</button>
<div id="user-info" style="display: none;">
    <p>歡迎：<span id="user-name"></span></p>
    <p>點數：<span id="user-credits"></span></p>
</div>

<script>
// 初始化
const auth = new EccalAuth({
    serviceName: 'audai',
    apiBaseUrl: 'https://eccal.thinkwithblack.com'
});

// 登入按鈕
document.getElementById('google-login').onclick = () => {
    auth.loginWithGoogle();
};

// 監聽認證成功
auth.onAuthSuccess = (user) => {
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-credits').textContent = user.credits;
    document.getElementById('user-info').style.display = 'block';
};
</script>
```

### 2. 測試認證是否正常
打開瀏覽器控制台，執行：
```javascript
// 測試 API 連接
fetch('https://eccal.thinkwithblack.com/api/account-center/health')
    .then(res => res.json())
    .then(data => console.log('API 狀態:', data));
```

### 3. 獲取用戶資料
```javascript
// 認證成功後，獲取完整用戶資料
async function getUserData(userId) {
    const token = localStorage.getItem('eccal_token');
    const response = await fetch(`https://eccal.thinkwithblack.com/api/account-center/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
}
```

## 🔑 重要端點

| 功能 | 端點 | 方法 |
|------|------|------|
| 認證 | `/api/auth/google-sso` | POST |
| 用戶資料 | `/api/account-center/user/:id` | GET |
| 點數查詢 | `/api/account-center/credits/:id` | GET |
| 會員狀態 | `/api/account-center/membership/:id` | GET |

## 🎁 新用戶獎勵
- 首次登入自動獲得 **30 點數**
- 免費會員可使用基本功能
- 升級 Pro 解鎖完整功能

## 🛠️ 常用代碼片段

### 檢查用戶是否為 Pro 會員
```javascript
async function isPro(userId) {
    const membership = await fetch(`https://eccal.thinkwithblack.com/api/account-center/membership/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('eccal_token')}` }
    }).then(res => res.json());
    
    return membership.level === 'pro';
}
```

### 扣除用戶點數
```javascript
async function deductCredits(userId, amount) {
    // 這個功能需要你的後端調用 eccal API
    // 不能直接從前端扣除點數（安全考量）
}
```

## 🆘 快速除錯

### 問題 1: 認證失敗
- 檢查 `https://audai.thinkwithblack.com` 是否在允許的域名清單中
- 確認 Google OAuth 設定正確

### 問題 2: API 請求失敗
- 檢查 Token 是否正確儲存在 localStorage
- 確認 Authorization header 格式：`Bearer <token>`

### 問題 3: 跨域問題
- eccal 系統已設定 CORS 支援 audai.thinkwithblack.com
- 確認請求來源域名正確

## 📞 需要幫助？

🔗 完整文檔：`AUDAI_INTEGRATION_GUIDE.md`
🧪 測試頁面：https://eccal.thinkwithblack.com/test-member-center.html
📧 技術支援：tech@thinkwithblack.com

---
**準備好了嗎？** 複製上面的代碼，5 分鐘內就能讓 AudAI 支援統一登入！