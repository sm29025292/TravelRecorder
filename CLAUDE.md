# CLAUDE.md — TravelRecorder 專案說明

> 給未來的 Claude session（與專案維護者）快速上手用。語言：繁體中文 + 英文技術名詞。

## 1. 這是什麼

**TravelRecorder** 是一個**本機優先（local-first）、可離線的 PWA**「旅遊行程＋記帳」網頁 App，
用來取代原本易壞的 Google Sheets / Excel 流程。

- **核心原則**：所有金額計算（換匯、小計、總計、平均）都是 `src/lib/money.ts` 裡的**純函式**，
  不靠試算表公式 → 不會因為新增/移動資料而「公式壞掉」。
- **資料只存在使用者瀏覽器**（IndexedDB），**沒有後端、沒有帳號、不上傳雲端**；備份靠 JSON 匯出/匯入。
- 取代原試算表的「景點」分頁：景點變成**全域、依地區分組、可重複使用**的參考資料，行程「景點」欄直接下拉。

- **線上網址**：https://sm29025292.github.io/TravelRecorder/
- **GitHub repo**：`sm29025292/TravelRecorder`（**public**）

## 2. 技術棧

Vite · React 18 · TypeScript · Tailwind CSS 3 · Dexie 4（IndexedDB）·
`dexie-react-hooks`（`useLiveQuery`）· `vite-plugin-pwa` · React Router 6（**HashRouter**）· Vitest。
開發用 Node 22（CI 用 Node 20）。

## 3. 開發指令

```bash
npm install          # 安裝相依
npm run dev          # 本機開發 http://localhost:5173
npm run test         # Vitest（純函式單元測試）
npm run build        # tsc --noEmit + vite build → dist/
npm run preview      # 預覽 build 結果
node scripts/gen-icons.mjs   # 重新產生 PWA 圖示（已內附，通常不必跑）
```

## 4. 專案結構

| 路徑 | 用途 |
|------|------|
| `src/types.ts` | 資料模型：`Trip` / `Attraction` / `ExpenseItem` / `ItineraryItem` |
| `src/db/db.ts` | Dexie 資料庫定義（`export const db`），tables：trips/attractions/expenses/itinerary |
| `src/lib/money.ts` | **所有金額計算純函式**（換匯/小計/總計/平均/四捨五入/`fmt`） |
| `src/lib/money.test.ts` | money 測試（含對照原試算表的 14875 / 7437） |
| `src/lib/backup.ts` | JSON 備份：`exportAll` / `downloadBackup` / `parseBackup` / `importAll(data, 'replace'\|'merge')` |
| `src/lib/csv.ts` | RFC4180 `parseCSV`（處理引號內逗號/換行、CRLF、BOM） |
| `src/lib/importAttractions.ts` | 景點 CSV 匯入：`rowsToAttractions`（純）/ `mergeAttractions` / `importAttractionsFromCSV` |
| `src/lib/group.ts` | `groupByCountry`（景點依 `country` 分組排序） |
| `src/lib/id.ts` | `newId`（`crypto.randomUUID`）/ `now` |
| `src/App.tsx` | HashRouter + 版面；路由 `/`、`/trip/:id`、`/attractions` |
| `src/components/TopNav.tsx` | 上方導覽 + 匯出/匯入備份 |
| `src/components/cells.tsx` | 共用輸入元件（`TextInput`/`NumberInput`/`Select`/`Th`/`Td`…，**聚焦緩衝**式） |
| `src/components/AttractionPicker.tsx` | 行程用的景點下拉（依 country 分 optgroup） |
| `src/pages/TripList.tsx` | 旅程清單（新增/開啟/刪除） |
| `src/pages/TripDetail.tsx` | 單一旅程，分頁：總覽 / 花費 / 行程 |
| `src/components/trip/{OverviewTab,ExpensesTab,ItineraryTab}.tsx` | 三個分頁內容 |
| `src/pages/Attractions.tsx` | 景點庫（CRUD + 「匯入 CSV」） |
| `.github/workflows/deploy.yml` | GitHub Pages 自動部署 |

## 5. 資料模型（詳見 `src/types.ts`）

- **Trip**：`name, region, startDate, endDate, currencyCode, currencyLabel, exchangeRate, peopleCount`。
- **Attraction**（全域）：`country`（分組鍵）, `name, address, url, notes, priority`。
- **ExpenseItem**：`tripId, date, time, item, currency, amount, fee, paid, paidBy, paymentStatus, notes, sort`。
- **ItineraryItem**：`tripId, date, time, attractionId, activity, hours, transportCost, activityCost, paidBy, notes, link, sort`。

## 6. 核心慣例與設計決策

- **計算不存、只算**：小計/總計/平均一律由 `money.ts` 即時算出，DB 只存原始輸入。
  花費每列自帶 `currency`（外幣或 `TWD`）；換算匯率取自 `trip.exchangeRate`（`TWD` 視為 1）。
- **即時更新**：頁面用 `useLiveQuery` 讀 Dexie，資料一改畫面與計算立即重算。
- **輸入元件聚焦緩衝**（`cells.tsx`）：因為寫入 IndexedDB 後會經 `useLiveQuery` 回流，
  輸入框在「聚焦時不被外部值覆寫」，避免游標跳動/吃字。**新增表單欄位請沿用這些元件**。
- **景點是全域參考資料**，以 `country` 分組；行程以 `attractionId` 參照景點。
- id 一律 `newId()`；數字輸入值為 0 時顯示空白。
- **資料每台裝置各自存**（IndexedDB 不跨裝置同步）。跨裝置 = JSON 匯出再匯入；CSV 匯入是**合併不覆蓋**。

## 7. 已完成（截至目前）

- ✅ **核心 v1**：旅程清單；旅程總覽（幣別/匯率/人數）；花費（自動換算台幣、小計、總計、平均）；
  行程（景點下拉、自動小計）；景點庫（依地區分組 CRUD）。
- ✅ **備份**：完整 JSON 匯出/匯入（`importAll` 支援 `replace` 與 `merge`；UI 目前用 replace）。
- ✅ **PWA**：service worker 離線可用、可加到主畫面。
- ✅ **景點 CSV 匯入（合併）**：處理多表格串接、地點向下填滿、關西重複清單去重、
  餐館自成「美食」分組（時間/價位寫進備註）、略過雜項、引號內逗號。
- ✅ **自動部署**：GitHub Actions → GitHub Pages。
- ✅ **單元測試 21 項**：`money`(11) + `csv`(5) + `importAttractions`(5)，`npm run test` 全綠。

## 8. 部署與眉角（重要！）

- 流程：`.github/workflows/deploy.yml` 在 **push 到 `main`** 或手動 **`workflow_dispatch`** 時，
  `npm ci → npm run build → 發佈 dist/ 到 Pages`。
- **Pages 免費版需要 repo 為 public**（私有需付費方案）→ 本 repo 已設 public。
- ⚠️ **預設分支目前是 `claude/hopeful-johnson-7dkkix`，不是 `main`**。
  `github-pages` 環境的保護規則**只允許從「預設分支」部署**，所以：
  - 目前要部署 → 在**預設分支**上 `workflow_dispatch`（透過 GitHub MCP `actions_run_trigger` 的 `run_workflow`）。
  - 建議改善：把預設分支設成 `main`，之後 push `main` 就會自動部署。
- `vite.config.ts` 用 `base: './'` ＋ `HashRouter`，所以放在 `/TravelRecorder/` 子路徑、重新整理都正常。
- ⚠️ **此開發沙箱無法對外連 `github.io`（curl 會回 403）**。
  要確認部署成功，請用 **GitHub Actions API/MCP 看 workflow run 的 build+deploy 兩個 job 是否 success**，不要靠 curl。

## 9. 尚未完成 / Roadmap（第二版）

- **人員與分帳**：同行者護照資料、每人應支付/應收（誰欠誰）結算（原試算表的「一、人員」與付錢欄）。
- **購物記帳**（原「四、購物」）。
- **行李 / 備註清單**（原「五、備註」，可勾選）。
- 其他可考慮：行程「景點」下拉**依旅程地區過濾**；美食加獨立 price 欄；UI 匯入提供 merge 選項。
- **已知小限制**：CSV 中「名稱只放在『地點』欄、而『景點』欄空白」的少數列（如 動物園、北海道神宮）
  匯入時會被略過，需手動補。

## 10. 開發注意

- 開發在指定的功能分支進行；commit 後推送。**未經同意不要 push 到別的分支、不要開 PR。**
- **不要把使用者個人資料（例如景點 CSV）提交進這個 public repo**；測試請用合成樣本。
- 改動金額/匯入邏輯後務必 `npm run test`；改動 App 後 `npm run build` 應通過（含 `tsc --noEmit` 型別檢查）。
