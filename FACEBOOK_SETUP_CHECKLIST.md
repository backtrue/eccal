# Facebook 應用程式設定檢查清單

## 基本設定 ✅
- [x] 應用程式網域：`eccal.thinkwithblack.com`
- [x] 聯絡電子郵件：`backtrue@toldyou.co`
- [x] 隱私政策網址：`https://thinkwithblack.com/privacy`
- [x] 服務條款網址：`https://thinkwithblack.com/terms`
- [x] 類別：工具和生產力
- [x] 用戶資料刪除回調：`https://eccal.thinkwithblack.com/auth/facebook/data-deletion`
- [x] 商家驗證：已驗證（煜言顧問有限公司）

## 需要檢查的項目 ⚠️

### 1. Facebook 登入產品設定
- **路徑**: 產品 → Facebook 登入 → 設定
- **需要添加的 OAuth 重新導向 URI**:
  ```
  https://eccal.thinkwithblack.com/api/diagnosis/facebook-callback
  ```

### 2. 應用程式模式
- **路徑**: 應用程式 → 設定 → 基本資料
- **檢查**: 確認應用程式已切換為「上線」模式
- **注意**: 如果還在開發模式，只有開發者和測試用戶可以使用

### 3. 權限申請狀態
- **路徑**: 應用程式審查 → 權限和功能
- **需要的權限**:
  - `ads_read` - 讀取廣告數據
  - `ads_management` - 管理廣告帳戶
- **狀態**: 檢查是否已通過 Facebook 審核

### 4. 測試用戶設定（如果權限還在審核中）
- **路徑**: 角色 → 測試用戶
- **操作**: 添加測試帳號或將特定用戶添加為測試用戶

## 常見問題解決

### 錯誤: "此應用程式似乎無法取得" 🚨
**最常見原因**：
1. **應用程式還在開發模式** - 需要切換到「上線」模式
2. **缺少必要的應用程式資訊** - 需要完整填寫所有必要欄位
3. **權限未通過審核** - 需要完成 Facebook 審核流程
4. **應用程式被限制** - 檢查是否有任何限制或警告

**解決步驟**：
1. 進入 Facebook 開發者控制台
2. 檢查應用程式模式 (開發/上線)
3. 確認所有必要資訊已填寫完整
4. 檢查應用程式審查狀態
5. 如果需要，提交應用程式供 Facebook 審核

### 錯誤: "Cannot use this feature"
- 檢查應用程式是否已上線
- 確認 OAuth 重新導向 URI 是否正確設定
- 檢查權限是否已通過審核

### 錯誤: "重新導向 URI 不匹配"
- 確保添加了正確的重新導向 URI
- 檢查 HTTPS 協議是否正確

### 錯誤: "權限被拒絕"
- 將使用者添加為測試用戶
- 或等待 Facebook 審核通過

## 測試步驟
1. 訪問 `/fbaudit` 頁面
2. 點擊「Facebook 登入」按鈕
3. 完成 OAuth 授權流程
4. 檢查是否能正確獲取廣告帳戶數據

## 聯絡資訊
如果遇到問題，請檢查：
- Facebook 開發者控制台的錯誤日誌
- 瀏覽器開發者工具的 Console 錯誤
- 伺服器日誌 (`/api/diagnosis/facebook-callback` 的回調處理)