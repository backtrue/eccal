# 會員中心實施計劃 - member.thinkwithblack.com

## 目標
將現有的 eccal.thinkwithblack.com 會員系統遷移到專用的 member.thinkwithblack.com，支援 5 個子域名服務。

## 服務架構

### 主要服務
1. **member.thinkwithblack.com** - 會員中心 (新建)
2. **eccal.thinkwithblack.com** - 廣告分析平台 (現有)
3. **audai.thinkwithblack.com** - AI 音頻分析 (現有)
4. **sub3.thinkwithblack.com** - 第三個服務 (規劃中)
5. **sub4.thinkwithblack.com** - 第四個服務 (規劃中)
6. **sub5.thinkwithblack.com** - 第五個服務 (規劃中)

## 實施步驟

### Step 1: 建立會員中心服務
1. 在 Replit 建立新專案 `member-center`
2. 複製現有的認證系統和資料庫結構
3. 部署到 member.thinkwithblack.com

### Step 2: 資料遷移
1. 將現有用戶資料遷移到會員中心
2. 建立服務權限管理系統
3. 測試資料一致性

### Step 3: 更新現有服務
1. 更新 eccal 系統使用新的會員 API
2. 更新 audai 系統使用新的會員 API
3. 建立統一的 SDK

### Step 4: 上線切換
1. 逐步切換到新的會員中心
2. 監控系統穩定性
3. 完全移除舊的認證系統

## 技術規格

### 會員中心 API 端點
- `GET /api/auth/login` - 單點登入
- `POST /api/auth/logout` - 單點登出
- `GET /api/users/:id` - 獲取用戶資料
- `POST /api/users/:id/services` - 服務授權
- `GET /api/services` - 服務清單
- `POST /api/membership/upgrade` - 會員升級

### 資料庫結構
```sql
-- 用戶表
users (id, email, name, google_id, created_at)

-- 服務表
services (id, name, domain, status, created_at)

-- 用戶服務權限表
user_services (user_id, service_id, permission_level, granted_at)

-- 會員系統表
memberships (user_id, level, expires_at, created_at)

-- 點數系統表
credits (user_id, balance, total_earned, total_spent)
```

## 優勢
1. **統一管理** - 所有服務使用同一個會員系統
2. **擴展性** - 新服務可以輕鬆接入
3. **專業性** - 專門的會員管理服務
4. **維護性** - 統一的認證和授權邏輯