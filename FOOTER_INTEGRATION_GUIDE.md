# Footer 統一建置指南

## 📋 概述

本指南提供統一的 footer 元件建置標準，確保所有網站都有一致的頁尾設計和服務連結。

## 🎯 設計要求

### 視覺設計
- 深灰色背景 (`bg-gray-900`)
- 白色文字 (`text-white`)
- 分層式結構：主要內容區域 + 底部區域
- 響應式設計 (手機/平板/桌面)

### 內容結構
1. **主要內容區域** (4列網格)
   - 公司介紹 (佔2列)
   - 課程連結 (1列)
   - 服務內容 (1列)

2. **底部區域**
   - 三個主要服務連結 (版權聲明之上)
   - 版權聲明

## 🔗 必須包含的三個主要服務

位置：版權聲明上方，使用「｜」分隔

```
報數據 ｜ 報受眾 ｜ 報價
```

- **報數據**: https://eccal.thinkwithblack.com
- **報受眾**: https://audai.thinkwithblack.com  
- **報價**: https://quote.thinkwithblack.com

## 🛠️ 技術實作

### HTML 結構
```html
<footer class="bg-gray-900 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- 主要內容區域 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- 公司介紹 (佔2列) -->
      <div class="col-span-1 md:col-span-2">
        <h3 class="text-xl font-bold mb-4">
          <a href="https://thinkwithblack.com/" target="_blank" rel="noopener noreferrer">
            報數據｜專業電商廣告分析平台
          </a>
        </h3>
        <p class="text-gray-300 mb-4">
          讓廣告操作者，擁有看懂數據與主導策略的能力。我們整合實戰經驗，從 GA 數據到 Facebook 廣告指標，幫助你看懂每個成效背後的意義。
        </p>
        <p class="text-gray-300 mb-4 text-sm">
          廣告與服務合作請寄信至：
          <a href="mailto:backtrue@thinkwithblack.com" class="text-blue-300 hover:text-blue-200">
            backtrue@thinkwithblack.com
          </a>
        </p>
      </div>

      <!-- 課程連結 -->
      <div>
        <h4 class="text-lg font-semibold mb-4">我們的課程</h4>
        <ul class="space-y-2">
          <li>
            <a href="https://www.pressplay.cc/link/s/88C22BDC" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white">
              電商教學
            </a>
          </li>
          <li>
            <a href="https://www.pressplay.cc/link/s/5355C492" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white">
              FB廣告初階教學
            </a>
          </li>
          <li>
            <a href="https://www.pressplay.cc/link/s/CAD627D3" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white">
              FB廣告進階教學
            </a>
          </li>
        </ul>
      </div>

      <!-- 服務內容 -->
      <div>
        <h4 class="text-lg font-semibold mb-4">服務內容</h4>
        <ul class="space-y-2">
          <li>
            <a href="https://blog.thinkwithblack.com" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white">
              部落格
            </a>
          </li>
          <li>
            <a href="https://thinkwithblack.com/privacy" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white">
              隱私政策
            </a>
          </li>
          <li>
            <a href="https://thinkwithblack.com/terms" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white">
              服務條款
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- 底部區域 -->
    <div class="border-t border-gray-700 mt-8 pt-8">
      <div class="flex flex-col items-center space-y-4">
        <!-- 三個主要服務連結 -->
        <div class="flex justify-center items-center gap-2 text-blue-300">
          <a href="https://eccal.thinkwithblack.com" target="_blank" rel="noopener noreferrer" class="hover:text-blue-200 font-medium">
            報數據
          </a>
          <span class="text-gray-400">｜</span>
          <a href="https://audai.thinkwithblack.com" target="_blank" rel="noopener noreferrer" class="hover:text-blue-200 font-medium">
            報受眾
          </a>
          <span class="text-gray-400">｜</span>
          <a href="https://quote.thinkwithblack.com" target="_blank" rel="noopener noreferrer" class="hover:text-blue-200 font-medium">
            報價
          </a>
        </div>
        
        <!-- 版權聲明 -->
        <p class="text-gray-400 text-sm">
          © 2025 煜言顧問有限公司. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</footer>
```

### CSS 樣式 (如果使用 Tailwind CSS)
```css
/* 確保 footer 在頁面底部 */
.footer-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

footer {
  margin-top: auto;
}
```

### JavaScript 動態連結 (可選)
```javascript
// 如果需要動態生成服務連結
const services = [
  { name: '報數據', url: 'https://eccal.thinkwithblack.com' },
  { name: '報受眾', url: 'https://audai.thinkwithblack.com' },
  { name: '報價', url: 'https://quote.thinkwithblack.com' }
];

function generateServiceLinks() {
  return services.map(service => 
    `<a href="${service.url}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-200 font-medium">${service.name}</a>`
  ).join('<span class="text-gray-400">｜</span>');
}
```

## 🎨 顏色規範

- 背景：`#111827` (gray-900)
- 主要文字：`#ffffff` (white)
- 次要文字：`#d1d5db` (gray-300)
- 灰色文字：`#9ca3af` (gray-400)
- 連結顏色：`#93c5fd` (blue-300)
- 連結懸停：`#bfdbfe` (blue-200)
- 分隔線：`#374151` (gray-700)

## 📱 響應式設計

- **桌面** (md:)：4列網格
- **平板** (sm:)：2列網格
- **手機** (xs)：1列網格

## 🔧 整合步驟

1. 複製 HTML 結構到你的網站
2. 確保包含必要的 CSS 框架 (推薦 Tailwind CSS)
3. 檢查所有連結是否正確
4. 測試響應式設計
5. 確認三個主要服務連結位置正確

## 📋 檢查清單

- [ ] 三個主要服務連結在版權聲明上方
- [ ] 使用正確的「｜」分隔符號
- [ ] 所有外部連結都有 `target="_blank" rel="noopener noreferrer"`
- [ ] 響應式設計在各尺寸裝置上正常
- [ ] 顏色和字體大小符合設計規範
- [ ] 連結懸停效果正常運作

## 💡 注意事項

1. **連結檢查**：定期檢查所有外部連結是否可正常存取
2. **版權年份**：確保版權年份自動更新
3. **品牌一致性**：所有網站的 footer 應保持一致的視覺效果
4. **載入速度**：避免在 footer 中載入過多外部資源

## 🆘 常見問題

**Q: 如果我的網站不使用 Tailwind CSS 怎麼辦？**
A: 可以將 Tailwind 類別轉換為對應的 CSS 樣式，參考上方的顏色規範。

**Q: 三個服務連結的順序可以改變嗎？**
A: 不建議改變，請保持「報數據｜報受眾｜報價」的順序。

**Q: 可以添加更多服務連結嗎？**
A: 目前只包含這三個主要服務，如需新增請聯繫開發團隊。

## 📞 技術支援

如果在實作過程中遇到問題，請聯繫：
- 技術問題：backtrue@thinkwithblack.com
- 設計問題：backtrue@thinkwithblack.com