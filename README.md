# TravelRecorder 旅遊記錄

把原本用 Google Sheets / Excel 記錄的「旅遊行程 + 花費」搬成一個**可離線的網頁 App**。
所有金額計算（換匯、小計、總計、平均）都是程式邏輯，**不會再因為新增 / 移動格子而公式壞掉**。

- 🧮 **計算自動且穩定**：改匯率，所有花費與行程的台幣金額即時重算。
- 🗂️ **景點庫**：景點集中管理、依國家／地區分組，行程的「景點」欄直接下拉選取。
- 📱 **可離線、可裝到手機**：響應式 (RWD) + PWA，手機加到主畫面後離線也能用。
- 💾 **資料在本機**：存在瀏覽器 (IndexedDB)，用 JSON 匯出 / 匯入做備份與換機。
- 🔒 **無後端、無帳號**：資料不會上傳到任何伺服器。

## 功能（第一版）

- **旅程**：建立多個旅程，各自設定日期、地區、外幣與匯率、人數。
- **總覽**：旅程基本資料與匯率設定。
- **花費**：機票 / 飯店 / 保險等大項，每列可選幣別（外幣或台幣）+ 手續費，自動算小計、總計、平均。
- **行程**：逐日行程，景點下拉（來自景點庫）、交通與行程花費自動換算台幣、備註可放連結。
- **景點庫**：依國家／地區分組的可重複使用景點清單。
- **備份**：右上角「匯出備份 / 匯入」。

## 開發與建置

```bash
npm install        # 安裝相依套件
npm run dev        # 本機開發（預設 http://localhost:5173）
npm run test       # 執行單元測試（金額計算邏輯）
npm run build      # 型別檢查 + 產生靜態網站到 dist/
npm run preview    # 預覽 build 後的網站
```

> PWA 圖示由 `node scripts/gen-icons.mjs` 產生（已內附，無需重跑）。

## 部署到 GitHub Pages（自動、免費）

已內附 GitHub Actions 工作流程 `.github/workflows/deploy.yml`：**每次推送到 `main` 分支**就會自動
`npm ci` → `npm run build` → 發佈到 GitHub Pages（首次執行會自動嘗試啟用 Pages）。

一次性設定：

1. 把開發分支**合併到 `main`**（工作流程設定在 `main` 觸發）。
2. 若首次沒自動啟用，到 **Settings → Pages → Build and deployment → Source** 選「**GitHub Actions**」。
3. 完成後網址約為 `https://<你的帳號>.github.io/<repo 名稱>/`
   （例：`https://sm29025292.github.io/TravelRecorder/`）。

專案已設定 `base: './'` 與 `HashRouter`，放在子路徑或重新整理都不會 404。
也可改丟到 Vercel / Netlify / 自己的空間，或本機直接 `npm run preview`。

## 存取控制 / 隱私

- 發佈到 GitHub Pages 的網站**是公開的**（個人帳號無法做檢視權限控制，那需要 GitHub Enterprise Cloud）。
- **但你的資料不會外洩**：本 App 沒有共用後端，資料只存在「每個人自己瀏覽器」的 IndexedDB，
  陌生人打開公開網址只會看到一個空白 App，看不到任何人的旅程或花費。
- 若未來真的想「只有特定人能打開 App」，最佳免費解法是改用
  **Cloudflare Pages + Cloudflare Access**（Zero Trust 免費版可達 50 人，用 Google / Email 驗證碼登入、
  白名單指定 email）。

## 資料與備份

- 資料只存在「目前這個瀏覽器」的 IndexedDB；**換瀏覽器 / 換手機 / 清除瀏覽資料前，請先「匯出備份」**。
- 備份檔是一個 JSON，含所有旅程、景點、花費、行程；用「匯入」可在新裝置完整還原（會取代現有資料）。

## 之後可擴充（尚未做）

- 人員與分帳：同行者護照資料、每人應支付／應收（誰欠誰）結算。
- 購物記帳、行李 / 備註清單。
- 匯入現有 Google Sheets 的景點資料（提供「景點」分頁的 CSV 即可加上一次性匯入）。

## 技術

Vite · React · TypeScript · Tailwind CSS · Dexie (IndexedDB) · vite-plugin-pwa · Vitest
