# Eccal Google SSO 整合完整指南

## 專案概述
本文件記錄了「報數據之報價」系統整合 eccal 統一認證系統 (Google SSO) 的完整過程，包含遇到的問題、解決方案和最終實作。

## 目標
- 讓 eccal 會員可以使用 Google 帳號直接登入報價系統
- 自動同步會員等級和點數資訊
- 支援原有的 email/密碼登入方式
- 實現混合認證架構

## 時間軸與問題解決過程

### 第一階段：初始整合 (2025-07-13)
**問題：** 不了解 eccal SSO 整合流程
**解決方案：** 
- 研究 eccal SDK 文件和整合指南
- 建立基本的 SSO 登入流程架構
- 創建 eccal 認證中間件和服務

### 第二階段：API 端點問題 (2025-07-13) 
**問題：** Google SSO 端點返回 HTML 頁面而非 302 重定向
**現象：** 用戶點擊登入按鈕後看到 HTML 頁面，無法正常跳轉到 Google OAuth
**解決方案：** 
- 聯繫 eccal 技術團隊
- eccal 團隊修復了 `/api/auth/google` 端點
- 改為正確的 302 重定向到 Google OAuth

### 第三階段：回調處理問題 (2025-07-13)
**問題：** Google OAuth 完成後無法正確回調到子服務
**現象：** 用戶在 Google 完成授權後，eccal 沒有正確重定向回報價系統
**解決方案：**
- 更新 SSO 整合，使用正確的回調處理邏輯
- 修正 `auth_success=true&token={JWT}` 參數處理

### 第四階段：Cookie 解析問題 (2025-07-14)
**問題：** JWT token 正確設置但後端無法讀取
**現象：** 
- Google SSO 完成後 `auth_token` cookie 成功設置
- 但後端 API 調用返回 401 Unauthorized
- 瀏覽器 cookie 中確實有 JWT token

**根本原因：** Express 應用沒有安裝 cookie-parser 中間件

**解決方案：**
```javascript
// server/index.ts
import cookieParser from "cookie-parser";
app.use(cookieParser());
```

### 第五階段：前端認證狀態問題 (2025-07-14)
**問題：** 後端認證成功但前端無法偵測登入狀態
**現象：** 
- API 能成功返回用戶資料
- 但前端始終顯示未登入狀態
- 用戶無法進入系統後台

**根本原因：** 前端認證系統不相容
- `useAuth` hook 只支援 localStorage 的本地認證
- `useEccalAuth` hook 僅作為獨立的 eccal 認證
- 兩者沒有整合，導致認證狀態不同步

**解決方案：** 整合混合認證系統
```javascript
// client/src/hooks/useAuth.ts
export function useAuth() {
  const { user: eccalUser, isLoading: eccalLoading, isAuthenticated: eccalAuthenticated } = useEccalAuth();
  
  // 優先使用 eccal 認證，回退到本地認證
  useEffect(() => {
    if (eccalUser) {
      const localUser = {
        id: parseInt(eccalUser.id),
        username: eccalUser.name,
        email: eccalUser.email,
      };
      setUser(localUser);
    }
    // ... 其他邏輯
  }, [eccalUser]);
  
  return {
    user,
    isAuthenticated: eccalAuthenticated || !!user,
    isLoading,
    // ...
  };
}
```

### 第六階段：回調檢測優化 (2025-07-14)
**問題：** eccal 認證使用 cookie 而非 URL 參數
**解決方案：** 更新回調處理邏輯
```javascript
// client/src/lib/eccalAuth.ts
handleCallback(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const hasGoogleCode = urlParams.get('code');
  const hasState = urlParams.get('state');
  
  if (hasGoogleCode && hasState) {
    // 檢查 auth_token cookie
    const token = this.getCookieValue('auth_token');
    if (token) {
      this.setToken(token);
      return true;
    }
  }
  // ...
}
```

## 最終架構

### 後端架構
```
Express App
├── cookie-parser 中間件
├── eccal JWT 認證中間件
├── eccal 認證服務
├── API 端點
│   ├── /api/eccal-auth/user (獲取會員資料)
│   ├── /api/eccal-auth/logout (登出)
│   └── 其他保護端點
```

### 前端架構
```
React App
├── useAuth (混合認證 hook)
├── useEccalAuth (eccal 專用認證)
├── eccalAuth 服務
├── 認證頁面
│   ├── 本地登入/註冊
│   └── Google SSO 登入按鈕
```

### 認證流程
1. 用戶點擊「使用 Google 登入 (Eccal 會員)」
2. 重定向到 eccal SSO 端點
3. eccal 重定向到 Google OAuth
4. Google 完成授權後回調到 eccal
5. eccal 生成 JWT 並設置 auth_token cookie
6. 重定向回報價系統
7. 前端檢測 cookie 中的 JWT token
8. 後端驗證 JWT 並獲取會員資料
9. 前端更新認證狀態，用戶進入系統

## 關鍵技術細節

### JWT Token 處理
- eccal 設置 `auth_token` cookie (HttpOnly, Secure)
- 後端使用 cookie-parser 解析
- 前端透過 `getCookieValue()` 讀取並同步到 localStorage

### 會員資料同步
- 後端從 eccal API 獲取完整會員資料
- 包含 membership level (pro/free) 和 credits
- 前端將 eccal 用戶格式轉換為本地用戶格式

### 錯誤處理
- Token 過期自動重新導向登入
- 網路錯誤顯示適當提示
- 支援登出時清除所有認證狀態

## 解決的核心問題

1. **Cookie 解析** - 添加 cookie-parser 中間件
2. **認證狀態同步** - 整合 useAuth 和 useEccalAuth
3. **回調檢測** - 支援 Google OAuth 參數和 auth_token cookie
4. **混合認證** - 同時支援本地和 eccal 認證

## 成功指標

✅ Google SSO 登入流程完全正常
✅ 會員資料自動同步 (姓名、email、會員等級、點數)
✅ 認證狀態正確更新
✅ 用戶可以正常進入系統後台
✅ 支援登出功能
✅ 與原有認證系統相容

## 後續維護要點

1. **Token 有效期管理** - 監控 JWT 過期時間
2. **錯誤監控** - 記錄認證失敗案例
3. **性能優化** - 減少不必要的 API 調用
4. **安全性** - 定期檢查 JWT 驗證邏輯

## 技術債務與改進機會

1. **統一認證架構** - 考慮完全遷移到 eccal 認證
2. **錯誤處理優化** - 更細緻的錯誤分類和處理
3. **自動測試** - 添加認證流程的自動化測試
4. **文檔完善** - 為開發團隊提供更詳細的整合指南

---

*本文件記錄了完整的問題解決過程，供未來維護和類似專案參考。*