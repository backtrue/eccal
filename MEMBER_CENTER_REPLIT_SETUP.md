# 會員中心 Replit 設置指南

## 1. 建立新的 Replit 專案

### 步驟
1. 在 Replit 建立新專案
2. 選擇 "Node.js" 模板
3. 專案名稱: `member-center`
4. 設置域名: `member.thinkwithblack.com`

## 2. 專案結構

```
member-center/
├── server/
│   ├── index.ts          # 主服務器
│   ├── auth/             # 認證相關
│   ├── api/              # API 路由
│   ├── db/               # 資料庫
│   └── utils/            # 工具函數
├── client/
│   ├── public/           # 靜態檔案
│   └── src/              # 前端程式碼
├── shared/
│   └── schema.ts         # 共用資料結構
├── package.json
└── replit.nix
```

## 3. 核心檔案

### package.json
```json
{
  "name": "member-center",
  "version": "1.0.0",
  "description": "Think With Black Member Center",
  "scripts": {
    "start": "node dist/server/index.js",
    "dev": "tsx server/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "drizzle-orm": "^0.29.0",
    "@neondatabase/serverless": "^0.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

### server/index.ts
```typescript
import express from 'express';
import cors from 'cors';
import { setupAuthRoutes } from './auth/routes';
import { setupApiRoutes } from './api/routes';

const app = express();
const PORT = process.env.PORT || 5000;

// 允許的域名
const ALLOWED_ORIGINS = [
  'https://eccal.thinkwithblack.com',
  'https://audai.thinkwithblack.com',
  'https://sub3.thinkwithblack.com',
  'https://sub4.thinkwithblack.com',
  'https://sub5.thinkwithblack.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

// CORS 設置
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 路由設置
setupAuthRoutes(app);
setupApiRoutes(app);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'member-center' });
});

app.listen(PORT, () => {
  console.log(`Member Center running on port ${PORT}`);
});
```

## 4. 環境變數設置

在 Replit 的 Secrets 中設置：

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 5. 資料庫設置

### schema.ts
```typescript
import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  googleId: text('google_id').unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const services = pgTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  domain: text('domain').notNull().unique(),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow()
});

export const userServices = pgTable('user_services', {
  userId: text('user_id').references(() => users.id),
  serviceId: text('service_id').references(() => services.id),
  permissionLevel: text('permission_level').default('basic'),
  grantedAt: timestamp('granted_at').defaultNow()
});

export const memberships = pgTable('memberships', {
  userId: text('user_id').references(() => users.id),
  level: text('level').default('free'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export const credits = pgTable('credits', {
  userId: text('user_id').references(() => users.id),
  balance: integer('balance').default(0),
  totalEarned: integer('total_earned').default(0),
  totalSpent: integer('total_spent').default(0),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

## 6. 部署設置

### replit.nix
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.postgresql
  ];
}
```

### .replit
```toml
run = "npm run dev"
entrypoint = "server/index.ts"

[nix]
channel = "stable-22_11"

[deployment]
run = ["sh", "-c", "npm run build && npm start"]
```

## 7. 建立基本服務清單

```sql
INSERT INTO services (id, name, domain) VALUES
('eccal', 'Eccal 廣告分析', 'https://eccal.thinkwithblack.com'),
('audai', 'AudAI 音頻分析', 'https://audai.thinkwithblack.com'),
('sub3', '第三個服務', 'https://sub3.thinkwithblack.com'),
('sub4', '第四個服務', 'https://sub4.thinkwithblack.com'),
('sub5', '第五個服務', 'https://sub5.thinkwithblack.com');
```

## 8. 測試檢查清單

- [ ] 會員中心服務正常啟動
- [ ] 資料庫連接成功
- [ ] Google OAuth 登入正常
- [ ] JWT token 生成和驗證
- [ ] CORS 跨域設置正確
- [ ] API 端點回應正常
- [ ] 服務權限管理功能
- [ ] 用戶資料遷移完成

## 9. 上線流程

1. **建立專案** - 在 Replit 建立會員中心專案
2. **設置環境** - 配置環境變數和資料庫
3. **部署測試** - 部署到 member.thinkwithblack.com
4. **資料遷移** - 將現有用戶資料遷移過來
5. **更新服務** - 更新其他服務使用新的會員 API
6. **完整測試** - 確認所有服務正常運作
7. **正式上線** - 切換到新的會員中心

你需要我現在就開始建立這個會員中心的程式碼嗎？