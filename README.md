# 數數遊戲 (Counting Game)

適合 2-6 歲幼兒的數字學習互動遊戲。

## 功能特色

- 🎯 **數字認知訓練** - 學習 1-12 的數字概念
- 🎨 **可愛互動圖形** - 12 種隨機主題（蘋果、小鳥、大象、汽車等）
- 🔊 **語音朗讀** - 點選圖形即時語音報數，語調活潑
- ✨ **收集動畫** - 點擊圖形後飛入收集區，清楚顯示已數數量
- 🌍 **雙語支援** - 繁體中文 / English
- 📱 **行動裝置優化** - 完美支援手機與平板，防止誤觸下拉刷新
- 🏆 **計分系統** - 每題 10 分，滿分 100 分

## 遊戲玩法

1. 畫面上會出現散落的圖形
2. 點擊圖形進行數數，圖形會飛入下方收集區
3. 數完後選擇正確的數字答案
4. 共 10 回合，全對可得 100 分

## 技術架構

- **框架**: Vue 3 + TypeScript
- **建置工具**: Vite
- **狀態管理**: Pinia
- **部署**: Cloudflare Pages

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 部署

專案使用 Cloudflare Pages 部署，設定檔為 `wrangler.jsonc`。

```bash
# 部署至 Cloudflare
npx wrangler deploy
```

## 專案結構

```
src/
├── assets/          # 背景圖片資源
├── components/      # Vue 元件
│   └── NumberCard.vue
├── stores/          # Pinia 狀態管理
│   └── game.ts
├── views/           # 頁面元件
│   └── GameOne.vue
├── App.vue
└── main.ts
```

## License

MIT
