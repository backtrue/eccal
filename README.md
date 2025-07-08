# 報數據-電商廣告預算計算機 (Report Data - E-commerce Ad Budget Calculator)

**Version: V3.7.3** - Complete Multilingual AI Persona System with Advanced Facebook Health Check

## 📋 專案概述

一個專業的多語言電商廣告分析平台，提供三大核心服務：FB 廣告健檢、廣告預算計算機、活動預算規劃師。平台專注於幫助商家即時分析廣告成效，優化投放策略，並支持繁體中文、英文、日文三種語言的完整本地化。

## ✨ 核心服務

### 🔍 FB 廣告健檢 (AI Powered)
- **多語言 AI 診斷** - 中文：小黑老師｜英文：Mr.Kuro｜日文：小黒先生
- **Facebook OAuth 整合** - 真實廣告帳戶數據連接
- **四大指標分析** - 日均花費、購買數、ROAS、CTR 全面健檢
- **Hero Post 分析** - 高 CTR 廣告創意識別與建議
- **智能預算建議** - AI 分析低效廣告活動並提供優化方案
- **多語言報告** - 根據語言路由生成對應語言的 AI 診斷報告

### 💰 廣告預算計算機 (GA4 Integration)
- **Google Analytics 4 整合** - 自動填入電商數據
- **多幣別支援** - 台幣/美元/日圓 CPC 設定
- **目標 ROAS 計算** - 自動計算投資回報率
- **PDCA 計劃儲存** - 支援預算計劃保存與管理
- **多語言介面** - 完整本地化計算器介面

### 🚀 活動預算規劃師 (PRO Feature)
- **動態預算分配** - 3-60 天活動智能預算配置
- **5 期間系統** - 預熱期/啟動期/主推期/收尾期/回購期
- **Pro 會員功能** - 免費用戶 3 次試用，Pro 用戶無限使用
- **專業後端架構** - 全新服務層設計確保計算準確性
- **儲存與管理** - 支援活動預算計劃保存功能

### 🎯 會員系統
- **積分經濟** - 新用戶 30 積分，計算消耗 1 積分
- **推薦獎勵** - 前 3 名推薦各得 100 積分，後續 50 積分
- **Pro 會員** - 350 積分升級，年費自動續訂制
- **Stripe 金流** - 支援多幣別年費訂閱 (JPY ¥20,000/年)

### 🌍 多語言支援
- **繁體中文** (預設) - /zh-TW 路由
- **English** - /en 路由
- **日本語** - /jp 路由
- **完整本地化** - UI、AI 建議、錯誤訊息全面多語言

## 🛠️ 技術架構

### Frontend
- **React 18** + **TypeScript**
- **Vite** 建置工具
- **Tailwind CSS** + **shadcn/ui**
- **Wouter** 路由管理
- **TanStack Query** 狀態管理
- **Radix UI** 無障礙組件

### Backend
- **Node.js 20** + **TypeScript**
- **Express.js** REST API
- **Drizzle ORM** 資料庫管理
- **PostgreSQL** 資料庫
- **JWT 認證** 無狀態身份驗證
- **OpenAI GPT-4** AI 建議生成

### 整合服務
- **Facebook Marketing API** 廣告數據
- **Google Analytics 4** API
- **Google OAuth 2.0** 認證系統
- **Brevo** 郵件行銷 API
- **Stripe** 訂閱付款系統
- **Meta Pixel** 追蹤分析

## 🚀 部署資訊

### 環境需求
- Node.js 20+
- PostgreSQL 16+
- Google Analytics 4 帳戶
- Brevo API 金鑰
- Meta Pixel ID

### 環境變數
```env
# 資料庫
DATABASE_URL=postgresql://...

# Google 服務
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Facebook 服務
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# AI 服務
OPENAI_API_KEY=...

# 郵件行銷
BREVO_API_KEY=...

# 付款系統
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# 追蹤分析
VITE_GA_MEASUREMENT_ID=G-...
VITE_META_PIXEL_ID=...

# 安全金鑰
JWT_SECRET=...
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

- **42** 個活躍用戶
- **完整多語言** AI 推薦系統
- **Facebook OAuth** 廣告帳戶整合
- **年費訂閱** 自動續訂制度
- **三大核心服務** 完整運作

## 🔧 開發指令

```bash
# 資料庫操作
npm run db:push          # 推送資料庫結構
npm run db:studio        # 開啟 Drizzle Studio

# 同步操作
curl -X POST /api/admin/export-users-csv      # 匯出用戶 CSV
curl -X POST /api/admin/brevo-sync-script     # 生成 Brevo 同步腳本

# 管理員操作
curl -X POST /api/bdmin/marketing-plans       # 上傳行銷計劃 PDF
curl -X GET /api/bdmin/user-behavior          # 查看用戶行為分析
```

## 📝 版本歷史

### V3.7.3 (最新)
- ✅ 完整多語言 AI 推薦系統
- ✅ Facebook 廣告健檢功能
- ✅ Mr.Kuro 英文 AI 角色
- ✅ Hero Post 分析功能
- ✅ 多語言 AI 診斷報告

### V3.7.0
- ✅ 年費自動續訂制度
- ✅ Stripe 訂閱付款系統
- ✅ 多幣別支援 (JPY/USD/TWD)
- ✅ Facebook Open Graph 整合

### V3.6.0
- ✅ 首頁服務展示重新設計
- ✅ 三大核心服務架構
- ✅ 專業品牌定位
- ✅ 完整說明文件系統

### V3.0.0
- ✅ Facebook OAuth 整合
- ✅ 真實廣告帳戶連接
- ✅ AI 健檢診斷系統
- ✅ JWT 無狀態認證

### V2.4.0
- ✅ 活動預算規劃師 2.0
- ✅ 動態預算分配算法
- ✅ Pro 會員功能
- ✅ 計劃儲存系統

## 🎯 使用說明

### FB 廣告健檢
1. **選擇語言**: 訪問 /zh-TW/fbaudit、/en/fbaudit 或 /jp/fbaudit
2. **連接 Facebook**: 授權並選擇廣告帳戶
3. **健檢分析**: 獲得 AI 多語言診斷報告
4. **優化建議**: 查看 Hero Post 分析與預算建議

### 廣告預算計算機
1. **Google 登入**: 使用 Google 帳戶登入
2. **GA4 整合**: 授權並選擇 Google Analytics 屬性
3. **計算預算**: 輸入目標營收、客單價、轉換率
4. **儲存計劃**: 保存預算計劃供後續使用

### 活動預算規劃師
1. **Pro 會員**: 免費用戶 3 次試用，Pro 無限使用
2. **活動設定**: 設定活動期間與預算
3. **期間規劃**: 獲得 5 期間預算分配
4. **專案管理**: 儲存與管理活動預算計劃

## 📧 聯絡資訊

- **開發團隊**: 煜言顧問有限公司 (台灣) / 燈言顧問株式会社 (日本)
- **網站**: https://eccal.thinkwithblack.com
- **課程**: [完整廣告投放策略課程](https://thinkwithblack.com)

---

**© 2025 煜言顧問有限公司 (台灣) & 燈言顧問株式会社 (日本)**