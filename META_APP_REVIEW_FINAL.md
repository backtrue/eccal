# Meta App Review - Facebook Data Deletion Status

## 問題摘要
Facebook 資料刪除端點 `/auth/facebook/data-deletion` 在生產環境中遇到 500 錯誤，儘管在開發環境中運作正常。

## 當前狀態
- **開發環境**: ✅ 正常運作 (返回正確的 JSON 回應)
- **生產環境**: ❌ 500 錯誤 (返回 "Internal server error")

## 技術分析

### 開發環境測試結果
```bash
curl -X POST http://localhost:5000/auth/facebook/data-deletion -H "Content-Type: application/json" -d '{"signed_request": "test.dGVzdA=="}'
```

**回應:**
```json
{
  "url": "https://eccal.thinkwithblack.com/data-deletion-status/unknown",
  "confirmation_code": "DEL_2025-07-09T14:09:37.175Z_mg2vzvqcvhg",
  "status": "success",
  "processed_at": "2025-07-09T14:09:37.175Z"
}
```

### 生產環境測試結果
```bash
curl -X POST https://eccal.thinkwithblack.com/auth/facebook/data-deletion -H "Content-Type: application/json" -d '{"signed_request": "test.dGVzdA=="}'
```

**回應:**
```json
{"error":"Internal server error"}
```

## 根本原因分析

### 1. 路由攔截問題
生產環境中，`serveStatic` 函數的通用路由處理器 `app.use("*", ...)` 攔截了所有未匹配的 API 請求，導致它們被前端路由處理而非伺服器端點。

### 2. 中間件順序問題
雖然端點已在 JWT 中間件之前註冊，但生產環境的靜態文件服務可能影響路由處理。

### 3. Facebook App 設定
在 Facebook App 設定中，資料刪除 URL 必須指向可正常運作的端點：
- **當前設定**: `https://eccal.thinkwithblack.com/auth/facebook/data-deletion`
- **狀態**: 500 錯誤

## 解決方案

### 解決方案 1: 修改路由路徑
將 Facebook 資料刪除端點移至 `/api/` 路徑下，這樣可以避免被前端路由攔截：

**新端點**: `/api/facebook/data-deletion`

### 解決方案 2: 創建獨立的端點伺服器
使用不同的端點路徑來處理 Facebook 資料刪除請求，避免與現有路由系統衝突。

### 解決方案 3: 優化路由註冊順序
確保 Facebook 資料刪除端點在所有其他中間件和路由之前註冊。

## 建議的 Meta App 回應

### 對審查團隊的說明
```
感謝審查團隊的耐心等待。我們已經識別並正在修復 Facebook 資料刪除端點的技術問題。

問題描述：
- 開發環境端點運作正常
- 生產環境由於路由配置問題導致 500 錯誤
- 預計在 24 小時內完成修復

修復計劃：
1. 將端點移至 /api/facebook/data-deletion
2. 優化路由註冊順序
3. 完成端點測試驗證

測試說明：
審查人員可以在修復完成後使用以下測試資料：
{
  "signed_request": "test.dGVzdA=="
}

預期回應格式：
{
  "url": "https://eccal.thinkwithblack.com/data-deletion-status/[user_id]",
  "confirmation_code": "DEL_[timestamp]_[request_id]",
  "status": "success",
  "processed_at": "[timestamp]"
}
```

## 下一步行動
1. 實施解決方案 1 (修改路由路徑)
2. 測試新端點在生產環境中的功能
3. 更新 Facebook App 設定中的資料刪除 URL
4. 通知 Meta 審查團隊修復完成

## 聯絡資訊
- **技術支援**: backtrue@thinkwithblack.com
- **公司**: 煜言顧問有限公司
- **網站**: https://thinkwithblack.com