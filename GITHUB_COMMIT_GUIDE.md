# GitHub 推送設定指南

## 問題診斷
- ✅ Git 配置正確：backtrue / 65640984+backtrue@users.noreply.github.com
- ✅ 遠程倉庫正確：https://github.com/backtrue/eccal
- ❌ 驗證失敗：GitHub 不再支援密碼驗證（2021年8月後）
- ⚠️  待推送：72個本地提交尚未推送

## 解決方案：設定 Personal Access Token

### 步驟 1：創建 GitHub Personal Access Token
1. 前往 GitHub：https://github.com/settings/tokens
2. 點擊 "Generate new token" → "Generate new token (classic)"
3. 設定：
   - Note: `Replit eccal project`
   - Expiration: `90 days` 或 `No expiration`
   - 勾選權限：
     - ✅ `repo` (完整倉庫權限)
     - ✅ `workflow` (如果使用 GitHub Actions)

### 步驟 2：在 Replit 中設定 Token
建議使用 Secrets 管理：
1. 在 Replit 側邊欄點擊 🔒 "Secrets" 
2. 新增 Secret：
   - Key: `GITHUB_TOKEN`
   - Value: `ghp_xxxxxxxxxxxx` (您的 Personal Access Token)

### 步驟 3：配置 Git 使用 Token
```bash
# 方法A：使用環境變數（推薦）
git remote set-url origin https://$GITHUB_TOKEN@github.com/backtrue/eccal.git

# 方法B：直接嵌入（較不安全）
git remote set-url origin https://ghp_your_token_here@github.com/backtrue/eccal.git
```

### 步驟 4：推送代碼
```bash
git push origin main
```

## 替代方案：SSH 金鑰

如果偏好使用 SSH（更安全）：

### 步驟 1：生成 SSH 金鑰
```bash
ssh-keygen -t ed25519 -C "65640984+backtrue@users.noreply.github.com"
```

### 步驟 2：添加到 GitHub
1. 複製公鑰：`cat ~/.ssh/id_ed25519.pub`
2. 前往 GitHub：https://github.com/settings/ssh
3. 點擊 "New SSH key" 並貼上公鑰

### 步驟 3：更改遠程 URL
```bash
git remote set-url origin git@github.com:backtrue/eccal.git
```

## 當前狀態
- 本地分支：main
- 遠程分支：origin/main  
- 待推送提交：72個
- 最新提交：Update the admin dashboard appearance and include a simplified footer

## 推送後確認
```bash
git status
git log --oneline -5
```

您應該會看到：`Your branch is up to date with 'origin/main'`