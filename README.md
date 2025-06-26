# 報數據-電商廣告預算計算機 (Report Data - E-commerce Ad Budget Calculator)

## 📋 專案概述

一個專業的多語言電商廣告預算計算與分析平台，提供精準的 Facebook 和 Instagram 廣告投放策略工具。平台專注於幫助商家即時分析廣告成本，優化轉換效率，並支持繁體中文、英文和日文三種語言。

## ✨ 主要功能

### 💰 積分系統
- 每次計算消耗 1 積分
- 新用戶獲得 5 積分
- 推薦成功雙方各得 5 積分
- 完整的積分交易記錄

### 🔗 推薦獎勵機制
- 獨特推薦連結生成
- 社交媒體分享功能 (Facebook, LINE, Twitter)
- 推薦追蹤與獎勵發放
- 推薦歷史記錄查看

### 🌍 多語言支援
- **繁體中文** (預設) - CPC: NT$5
- **English** (/en) - CPC: $1 USD
- **日本語** (/jp) - CPC: ¥120
- 瀏覽器語言自動偵測
- 路由式語言切換

### 📊 數據整合
- **Google Analytics 4** 電商數據自動填入
- **Brevo** 郵件行銷自動同步
- **Meta Pixel** 事件追蹤
- GA 屬性選擇與資料匯入

### 🎛️ 會員後台
- 積分餘額查看
- 推薦連結管理
- 交易歷史記錄
- 推薦成果統計

## 🛠️ 技術架構

### Frontend
- **React 18** + **TypeScript**
- **Vite** 建置工具
- **Tailwind CSS** + **shadcn/ui**
- **Wouter** 路由管理
- **TanStack Query** 狀態管理

### Backend
- **Node.js 20** + **TypeScript**
- **Express.js** REST API
- **Drizzle ORM** 資料庫管理
- **PostgreSQL** 資料庫
- **OAuth 2.0** 安全認證

### 整合服務
- **Google Analytics 4** API
- **Brevo** (Sendinblue) API
- **Meta Pixel** 追蹤
- **Google OAuth** 認證

## 🚀 部署資訊

### 環境需求
- Node.js 20+
- PostgreSQL 16+
- Google Analytics 4 帳戶
- Brevo API 金鑰
- Meta Pixel ID

### 環境變數
```env
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BREVO_API_KEY=...
VITE_GA_MEASUREMENT_ID=G-...
VITE_META_PIXEL_ID=...
SESSION_SECRET=...
```

### 安裝與運行
```bash
# 安裝依賴
npm install

# 推送資料庫結構
npm run db:push

# 開發模式
npm run dev

# 生產建置
npm run build
npm start
```

## 📈 數據統計

- **33** 個活躍用戶
- **35** 個 Brevo 聯絡人已同步
- **積分系統** 正常運作
- **推薦機制** 完整實作
- **多語言** 完全本地化

## 🔧 開發指令

```bash
# 資料庫操作
npm run db:push          # 推送資料庫結構
npm run db:studio        # 開啟 Drizzle Studio

# 同步操作
curl -X POST /api/sync-brevo  # 同步用戶到 Brevo

# 管理員操作
curl -X POST /api/admin/distribute-credits  # 發放積分給所有用戶
```

## 📝 版本歷史

### V1.3.4 (最新)
- ✅ 修復所有前端 TypeScript 錯誤
- ✅ 完善積分系統變數作用域
- ✅ 優化 Brevo 批量同步機制
- ✅ 清理重複的國際化識別符

### V1.3.3
- ✅ 積分系統與推薦機制
- ✅ 會員後台儀表板
- ✅ 社交分享功能

### V1.2.2
- ✅ 路由式多語言切換
- ✅ 瀏覽器語言自動偵測
- ✅ 地區化 CPC 值設定

### V1.1.0
- ✅ Brevo 郵件行銷整合
- ✅ Google Analytics 數據整合
- ✅ Meta Pixel 追蹤

### V1.0.0
- ✅ 基礎計算器功能
- ✅ 響應式設計
- ✅ SEO 優化

## 🎯 使用說明

1. **註冊登入**: 使用 Google 帳戶登入
2. **選擇語言**: 支援繁中/英文/日文
3. **連接 GA**: 授權並選擇 Google Analytics 屬性
4. **計算預算**: 輸入目標營收、客單價、轉換率
5. **查看結果**: 獲得每日/每月廣告預算建議
6. **推薦好友**: 分享推薦連結賺取積分

## 📧 聯絡資訊

- **開發團隊**: 煜言顧問有限公司 (台灣) / 燈言顧問株式会社 (日本)
- **網站**: https://eccal.thinkwithblack.com
- **課程**: [完整廣告投放策略課程](https://thinkwithblack.com)

---

**© 2025 煜言顧問有限公司 (台灣) & 燈言顧問株式会社 (日本)**