# Member Center Architecture Design
## member.thinkwithblack.com 帳號中心架構設計

### 系統概述
建立統一的帳號中心系統，管理多個網站的用戶認證、權限和數據。

### 核心功能模組

#### 1. 用戶認證管理
- Google OAuth 統一登入
- JWT Token 跨域共享
- 會話管理和安全控制

#### 2. 會員等級系統
- 免費會員 (Free)
- 專業會員 (Pro)
- 企業會員 (Enterprise)
- 跨網站權限同步

#### 3. 積分與推薦系統
- 統一積分管理
- 推薦獎勵機制
- 跨網站積分使用

#### 4. 用戶資料中心
- 個人資料管理
- 偏好設置
- 使用統計

### 技術架構

#### 前端架構
- React + TypeScript
- 響應式設計
- 多語言支援 (中文/英文/日文)

#### 後端架構
- Express.js API
- JWT 認證系統
- PostgreSQL 資料庫
- Drizzle ORM

#### 跨域整合
- CORS 設定
- JWT Token 共享
- API Gateway 模式

### 資料庫設計

#### 核心表結構
```sql
-- 用戶基本資料
users (id, email, name, avatar, created_at, updated_at)

-- 會員等級
user_memberships (user_id, level, expires_at, features)

-- 積分系統
user_credits (user_id, balance, total_earned, total_spent)

-- 推薦系統
user_referrals (referrer_id, referee_id, reward_amount, created_at)

-- 網站權限
site_permissions (user_id, site_domain, permissions, created_at)

-- 用戶偏好
user_preferences (user_id, language, timezone, notifications)
```

### API 設計

#### 認證相關 API
- POST /api/auth/login - 用戶登入
- POST /api/auth/logout - 用戶登出
- GET /api/auth/verify - Token 驗證
- POST /api/auth/refresh - Token 刷新

#### 用戶管理 API
- GET /api/user/profile - 獲取用戶資料
- PUT /api/user/profile - 更新用戶資料
- GET /api/user/membership - 會員狀態
- POST /api/user/upgrade - 會員升級

#### 積分系統 API
- GET /api/credits/balance - 積分餘額
- POST /api/credits/spend - 消費積分
- GET /api/credits/history - 積分記錄
- POST /api/referral/create - 建立推薦連結

#### 跨網站整合 API
- GET /api/sites/permissions - 網站權限
- POST /api/sites/authorize - 網站授權
- GET /api/sites/user-data - 跨網站用戶資料

### 網站整合流程

#### 1. 新網站接入
1. 在帳號中心註冊網站
2. 獲取 API Key 和 Secret
3. 配置 CORS 和 JWT 設定
4. 實現認證中介軟體

#### 2. 用戶登入流程
1. 用戶點擊登入按鈕
2. 重定向到 member.thinkwithblack.com
3. 完成認證後返回原網站
4. 獲取 JWT Token 和用戶資料

#### 3. 權限驗證
1. 網站檢查用戶 JWT Token
2. 向帳號中心驗證權限
3. 根據會員等級提供功能

### 部署策略

#### 帳號中心 (member.thinkwithblack.com)
- 獨立部署
- 專用資料庫
- 高可用性配置

#### 業務網站整合
- 輕量級 SDK
- 認證中介軟體
- 緩存機制

### 安全考量

#### 認證安全
- HTTPS 強制加密
- JWT Token 過期機制
- 防止 CSRF 攻擊

#### 資料安全
- 資料加密存儲
- 敏感操作二次驗證
- 訪問日誌記錄

### 監控與分析

#### 系統監控
- 用戶登入統計
- API 請求監控
- 錯誤率追蹤

#### 業務分析
- 用戶行為分析
- 會員轉換率
- 跨網站使用統計

### 開發階段規劃

#### Phase 1: 基礎架構
- 用戶認證系統
- 基本會員管理
- JWT Token 機制

#### Phase 2: 功能擴展
- 積分推薦系統
- 跨網站權限
- 用戶偏好管理

#### Phase 3: 高級功能
- 企業會員功能
- 高級分析工具
- 第三方整合

### 預期效益

#### 技術效益
- 統一的用戶體驗
- 降低開發成本
- 提高系統安全性

#### 商業效益
- 增加用戶黏性
- 提高轉換率
- 優化運營效率