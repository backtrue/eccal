# 帳號中心架構規劃

## 概述
將現有系統改造為統一帳號中心，支援多個網站的 JWT 認證和資料共享。

## 核心功能

### 1. JWT Token 管理
- 統一 JWT 簽發和驗證
- 支援多域名的 Token 共享
- Token 刷新機制
- 跨域 CORS 設定

### 2. 用戶資料 API
- 用戶基本資料 CRUD
- 會員等級管理
- 點數系統
- 推薦機制

### 3. 認證服務
- Google OAuth
- Facebook OAuth
- JWT 認證中間件
- 權限控制

## 技術架構

### 主要組件
```
帳號中心 (eccal.thinkwithblack.com)
├── JWT 認證服務
├── 用戶管理 API
├── OAuth 處理
└── 資料庫 (PostgreSQL)

外部網站 A (site-a.com)
├── JWT 驗證中間件
├── 用戶資料同步
└── 業務邏輯

外部網站 B (site-b.com)
├── JWT 驗證中間件
├── 用戶資料同步
└── 業務邏輯
```

### 資料流程
1. 用戶在任一網站登入 → 重定向到帳號中心
2. 帳號中心驗證 → 簽發 JWT Token
3. 回傳 Token 到原網站 → 用戶完成登入
4. 外部網站透過 API 讀取用戶資料

## 需要新增的 API 端點

### 認證相關
- `POST /api/auth/verify-token` - 驗證 JWT Token
- `POST /api/auth/refresh-token` - 刷新 Token
- `GET /api/auth/user-profile` - 獲取用戶資料

### 跨域認證
- `GET /api/auth/sso-login` - 單點登入
- `POST /api/auth/sso-callback` - SSO 回調
- `GET /api/auth/sso-logout` - 單點登出

### 用戶資料同步
- `GET /api/users/profile/:userId` - 獲取用戶資料
- `PUT /api/users/profile/:userId` - 更新用戶資料
- `GET /api/users/membership/:userId` - 獲取會員資訊
- `GET /api/users/credits/:userId` - 獲取點數資訊

## 實作步驟

### 階段一：API 端點建立
1. 建立跨域認證 API
2. 實作 JWT 驗證中間件
3. 設定 CORS 政策

### 階段二：外部網站整合
1. 提供 JavaScript SDK
2. 建立認證流程文件
3. 測試跨域認證

### 階段三：資料同步機制
1. 實時資料同步
2. 快取機制
3. 錯誤處理

## 安全考量

### JWT 安全
- 短期 Access Token (15分鐘)
- 長期 Refresh Token (7天)
- Token 輪換機制

### 跨域安全
- 白名單域名控制
- CSRF 保護
- 安全 Headers

### 資料保護
- API 速率限制
- 敏感資料加密
- 存取日誌記錄

## 設定檔案

### CORS 設定
```javascript
const allowedOrigins = [
  'https://eccal.thinkwithblack.com',
  'https://site-a.com',
  'https://site-b.com'
];
```

### JWT 設定
```javascript
const jwtConfig = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'eccal.thinkwithblack.com',
  audience: ['site-a.com', 'site-b.com']
};
```

## 外部網站整合範例

### JavaScript SDK
```javascript
// 帳號中心 SDK
const EccalAuth = {
  loginUrl: 'https://eccal.thinkwithblack.com/auth/sso-login',
  verifyToken: async (token) => {
    // 驗證 Token 邏輯
  },
  getUserProfile: async (token) => {
    // 獲取用戶資料
  }
};
```

### 外部網站認證流程
```javascript
// 1. 重定向到帳號中心登入
window.location.href = `${EccalAuth.loginUrl}?returnTo=${encodeURIComponent(window.location.href)}`;

// 2. 接收 Token 並驗證
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  const user = await EccalAuth.getUserProfile(token);
  // 設定用戶狀態
}
```

## 資料庫考量

### 共享資料表
- users (用戶基本資料)
- user_credits (點數系統)
- user_referrals (推薦系統)
- user_membership (會員等級)

### 網站專屬資料
- 各網站可有獨立的業務資料表
- 透過 userId 關聯到帳號中心
- 保持資料隔離性

## 效益

### 用戶體驗
- 一次登入，多網站通用
- 統一的用戶資料
- 一致的會員權益

### 開發效率
- 統一認證邏輯
- 共享用戶管理
- 簡化新網站開發

### 營運管理
- 統一用戶分析
- 跨網站行銷
- 資料一致性

## 注意事項

1. **效能考量**：API 呼叫延遲、快取策略
2. **可靠性**：帳號中心故障影響所有網站
3. **擴展性**：支援更多網站接入
4. **合規性**：個資法、GDPR 等法規遵循

## 後續規劃

1. 實作基本 SSO 功能
2. 建立監控和日誌系統
3. 效能優化和擴展
4. 更多認證方式支援（Apple ID、LINE 等）