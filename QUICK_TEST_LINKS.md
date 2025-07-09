# Meta 應用程式審查 - 快速測試連結

## 重要提醒 🚨
**Meta 審查員請注意**：如果您在測試過程中遇到「此應用程式似乎無法取得」錯誤，這是因為應用程式權限還在審核中。請聯絡 backtrue@thinkwithblack.com 將您的 Facebook 帳號添加為測試用戶。

---

## 📋 核心測試頁面

### 1. 測試演示頁面（建議開始）
- **網址**: https://eccal.thinkwithblack.com/facebook-test-demo
- **說明**: 專為 Meta 審查員設計的完整測試流程演示
- **包含**: 權限說明、測試步驟、隱私政策連結

### 2. Facebook 廣告健檢（主要功能）
- **網址**: https://eccal.thinkwithblack.com/fbaudit
- **說明**: Facebook 權限的實際使用場景
- **功能**: OAuth 登入、廣告資料讀取、AI 分析報告

### 3. 隱私政策（必讀）
- **網址**: https://eccal.thinkwithblack.com/privacy-policy
- **說明**: 詳細的 Facebook 資料收集和使用說明
- **重點**: Facebook 權限說明、資料保護措施

---

## 🔐 測試用戶資訊

### 如需測試用戶帳號
- **聯絡信箱**: backtrue@thinkwithblack.com
- **主旨**: Meta App Review - 測試用戶申請
- **內容請包含**: 您的 Facebook 帳號 Email

### 現有測試帳號
如果您有 Facebook 開發者帳號，可以直接使用，應用程式已設定為「上線」模式。

---

## 📊 測試流程檢查清單

### ✅ 第一階段：基本訪問
- [ ] 1.1 訪問測試演示頁面
- [ ] 1.2 查看權限說明和隱私政策
- [ ] 1.3 確認應用程式可正常載入

### ✅ 第二階段：認證流程
- [ ] 2.1 完成 Google 登入
- [ ] 2.2 點擊 Facebook 登入按鈕
- [ ] 2.3 查看隱私政策確認訊息
- [ ] 2.4 完成 Facebook OAuth 授權

### ✅ 第三階段：權限驗證
- [ ] 3.1 確認 ads_read 權限授權
- [ ] 3.2 確認 ads_management 權限授權
- [ ] 3.3 驗證廣告帳戶清單讀取
- [ ] 3.4 測試廣告資料分析功能

### ✅ 第四階段：功能測試
- [ ] 4.1 選擇 Facebook 廣告帳戶
- [ ] 4.2 建立或選擇預算計劃
- [ ] 4.3 執行廣告健檢分析
- [ ] 4.4 查看 AI 生成的診斷報告

---

## 🛠️ 權限使用說明

### ads_read 權限
**使用場景**:
- 讀取用戶的 Facebook 廣告帳戶清單
- 獲取廣告活動的表現數據（點擊率、轉換率、花費）
- 分析廣告帳戶的整體表現
- 識別表現優異的廣告創意

**API 呼叫範例**:
```
GET /v19.0/me/adaccounts
GET /v19.0/{ad-account-id}/insights
GET /v19.0/{ad-account-id}/ads
```

### ads_management 權限
**使用場景**:
- 存取廣告帳戶的詳細管理資訊
- 讀取廣告組和廣告素材設定
- 分析廣告受眾和投放策略
- 提供基於實際設定的優化建議

**API 呼叫範例**:
```
GET /v19.0/{ad-account-id}/adsets
GET /v19.0/{ad-account-id}/campaigns
GET /v19.0/{ad-set-id}/targeting
```

---

## 📞 聯絡資訊

### 技術支援
- **信箱**: backtrue@thinkwithblack.com
- **回覆時間**: 24 小時內
- **語言**: 中文、英文

### 公司資訊
- **公司名稱**: 煜言顧問有限公司
- **網站**: https://thinkwithblack.com
- **統一編號**: 90839870

---

## 📋 檢查清單摘要

### Meta 審查重點項目
- [x] 隱私政策完整且包含 Facebook 使用說明
- [x] Facebook 登入對話框包含隱私政策連結
- [x] 應用程式功能與權限申請一致
- [x] 用戶資料保護措施清楚說明
- [x] 提供完整的測試環境和文檔

### 應用程式合規性
- [x] 應用程式已上線（Live Mode）
- [x] OAuth 重新導向 URI 正確設定
- [x] 資料刪除回調端點已實作
- [x] 商家驗證已完成
- [x] 隱私政策和服務條款可公開存取

---

**測試完成後，請考慮批准我們的 ads_read 和 ads_management 權限申請。感謝您的審查！**

---
*最後更新: 2025年7月9日*