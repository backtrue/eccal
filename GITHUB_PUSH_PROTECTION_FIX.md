# GitHub Push Protection 解決方案

## 問題描述
GitHub 偵測到您的 Personal Access Token 在提交歷史中，觸發了 Push Protection 機制。

## 立即解決方案

### 方法 1：使用 GitHub 提供的解除封鎖連結（推薦）
1. 點擊以下連結來允許這個 Token：
   https://github.com/backtrue/eccal/security/secret-scanning/unblock-secret/30KJHikhUZNYHFT2jxknlkOdR89

2. 在 GitHub 頁面中點擊「Allow secret」

3. 然後在 Shell 中執行：
```bash
git push origin main
```

### 方法 2：啟用 Secret Scanning（長期解決方案）
1. 前往倉庫設定：https://github.com/backtrue/eccal/settings/security_analysis
2. 啟用 "Secret scanning" 功能
3. 這將幫助未來偵測和管理敏感資訊

### 方法 3：如果仍然失敗，清理 Git 歷史
```bash
# 創建一個新的乾淨提交，不包含敏感資訊
git log --oneline -5  # 查看最近提交
git revert HEAD~1    # 撤銷包含 Token 的提交
git push origin main
```

## 當前狀態
- 待推送提交：75個
- 問題提交：11870be35ea3e1e1a261dfd5fd3ea9cb443a5fb3
- Token 位置：GITHUB_COMMIT_GUIDE.md:6

## 為什麼會發生這個問題
- 我在診斷指南中不小心包含了部分 Token
- GitHub 的安全掃描偵測到這個潛在風險
- Push Protection 自動阻止了包含敏感資訊的推送

## 修復後確認
推送成功後，您應該看到：
```
Enumerating objects: XX, done.
Writing objects: 100% (XX/XX), done.
To https://github.com/backtrue/eccal.git
   abc1234..def5678  main -> main
```

## 未來預防措施
- 永遠不要在文件中包含真實的 API Keys 或 Tokens
- 使用 `ghp_****` 或 `$GITHUB_TOKEN` 這樣的佔位符
- 啟用 Secret Scanning 來自動偵測敏感資訊