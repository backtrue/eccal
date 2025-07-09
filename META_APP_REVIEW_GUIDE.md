# Facebook 應用程式審查指南

## 測試憑證與存取資訊

### 測試環境
- **測試網址**: https://eccal.thinkwithblack.com/fbaudit
- **應用程式狀態**: 已上線 (Live)
- **測試帳號**: 請使用您的 Facebook 帳號進行測試

### 測試用戶帳號
如果您需要測試用戶帳號，請與我們聯繫：
- **聯絡信箱**: backtrue@thinkwithblack.com
- **LINE**: @thinkwithblack

## 應用程式功能說明

### 主要功能: Facebook 廣告健檢
我們的應用程式提供 Facebook 廣告帳戶健檢功能，幫助電商業者分析廣告表現。

### 權限使用說明

#### 1. `ads_read` 權限
**使用目的**: 讀取用戶的 Facebook 廣告資料
**具體用途**:
- 獲取廣告帳戶清單
- 讀取廣告活動資料
- 分析廣告表現數據 (點擊率、轉換率、ROAS)
- 生成診斷報告

#### 2. `ads_management` 權限
**使用目的**: 存取廣告帳戶管理功能
**具體用途**:
- 取得詳細的廣告帳戶資訊
- 讀取廣告組和廣告素材資料
- 分析廣告投放設定
- 提供優化建議

## 測試流程

### 第一步: 訪問應用程式
1. 打開瀏覽器，前往 https://eccal.thinkwithblack.com/fbaudit
2. 您會看到「Facebook 廣告健檢」頁面

### 第二步: Google 登入
1. 點擊「Google 登入」按鈕
2. 完成 Google OAuth 登入流程
3. 登入成功後回到健檢頁面

### 第三步: Facebook 連接
1. 在頁面上找到「連接 Facebook」按鈕
2. 點擊按鈕會跳出隱私政策說明
3. 點擊「連接 Facebook」開始 OAuth 流程

### 第四步: Facebook 授權
1. 系統會跳轉到 Facebook 授權頁面
2. 您會看到權限請求：
   - 基本資料存取
   - 廣告資料讀取權限
   - 廣告帳戶管理權限
3. 點擊「繼續」授權應用程式

### 第五步: 廣告帳戶選擇
1. 授權完成後，系統會顯示您的 Facebook 廣告帳戶清單
2. 選擇要分析的廣告帳戶
3. 選擇行業類別（例如：電商、服務業等）

### 第六步: 選擇預算計劃
1. 系統會顯示您之前建立的預算計劃
2. 選擇一個預算計劃作為對比基準
3. 或點擊「新增計劃」建立新的預算計劃

### 第七步: 開始健檢
1. 完成所有設定後，點擊「開始健檢」
2. 系統會分析您的 Facebook 廣告資料
3. 生成包含以下內容的診斷報告：
   - 廣告表現概覽
   - 四大核心指標分析
   - AI 優化建議
   - 表現優異的廣告識別

## 隱私政策與資料保護

### 隱私政策連結
- **隱私政策**: https://eccal.thinkwithblack.com/privacy-policy
- **服務條款**: https://eccal.thinkwithblack.com/terms-of-service

### 資料使用承諾
1. **資料收集**: 僅收集必要的廣告表現資料
2. **資料用途**: 僅用於生成診斷報告和優化建議
3. **資料保護**: 採用業界標準的加密和安全措施
4. **資料保留**: 診斷報告保存 30 天，原始資料不長期儲存
5. **資料刪除**: 用戶可隨時要求刪除資料

### 用戶權利
- 可在 Facebook 設定中撤銷應用程式權限
- 可聯絡我們要求刪除個人資料
- 可查看和下載個人資料

## 技術架構

### 前端技術
- React.js + TypeScript
- Tailwind CSS
- 響應式設計支援行動裝置

### 後端技術
- Node.js + Express
- JWT 身份驗證
- PostgreSQL 資料庫
- Facebook Graph API v19.0

### 安全措施
- HTTPS 加密傳輸
- JWT Token 安全管理
- 資料庫加密存儲
- 存取日誌監控

## 聯絡資訊

### 開發團隊
- **公司名稱**: 煜言顧問有限公司
- **聯絡信箱**: backtrue@thinkwithblack.com
- **網站**: https://thinkwithblack.com
- **LINE 客服**: @thinkwithblack

### 技術支援
如果您在測試過程中遇到任何問題，請隨時聯絡我們：
- 提供詳細的錯誤訊息
- 包含測試時間和步驟
- 我們會在 24 小時內回覆

## 常見問題

### Q: 為什麼需要這些權限？
A: 我們需要讀取您的 Facebook 廣告資料來分析表現並提供優化建議。這些權限讓我們能夠：
- 讀取廣告帳戶清單
- 分析廣告表現數據
- 生成個人化診斷報告

### Q: 我的資料安全嗎？
A: 是的，我們採用業界標準的安全措施保護您的資料：
- 所有數據傳輸都經過 HTTPS 加密
- 我們不會儲存敏感的廣告資料
- 診斷報告會在 30 天後自動刪除

### Q: 如何撤銷應用程式權限？
A: 您可以在 Facebook 設定中的「應用程式和網站」部分找到我們的應用程式並撤銷權限。

## 應用程式審查資訊

### 應用程式 ID
- **App ID**: 1087313456009870
- **App Name**: 報數據-電商廣告預算計算機

### 隱私政策 URL
- https://eccal.thinkwithblack.com/privacy-policy

### 服務條款 URL
- https://eccal.thinkwithblack.com/terms-of-service

### 資料刪除 URL
- https://eccal.thinkwithblack.com/auth/facebook/data-deletion

### 應用程式類別
- 商業和工具

---

**最後更新**: 2025年7月9日
**版本**: 1.0