#!/bin/bash

# Git 修復腳本 - 解決 Replit Git 介面問題

echo "=== Git 問題診斷與修復 ==="

# 檢查並移除所有鎖定文件
echo "1. 移除 Git 鎖定文件..."
rm -f .git/index.lock .git/config.lock .git/HEAD.lock .git/refs/heads/main.lock 2>/dev/null || true

# 檢查 Git 狀態
echo "2. 檢查 Git 狀態..."
git status

# 驗證遠程配置
echo "3. 驗證遠程配置..."
echo "Remote URL (token hidden):"
git remote get-url origin | sed 's/ghp_[^@]*/<TOKEN>/g'

# 測試 GitHub 連接
echo "4. 測試 GitHub 連接..."
git ls-remote origin main >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ GitHub 連接成功"
else
    echo "❌ GitHub 連接失敗"
fi

# 顯示待推送的提交
echo "5. 顯示待推送的提交數量..."
COMMITS_AHEAD=$(git rev-list --count HEAD...origin/main 2>/dev/null || echo "unknown")
echo "待推送提交數: $COMMITS_AHEAD"

# 嘗試推送
echo "6. 嘗試推送到 GitHub..."
git push origin main

echo "=== 修復完成 ==="