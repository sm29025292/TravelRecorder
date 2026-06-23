# CLAUDE.md — TravelRecorder 專案說明

> 給未來的 Claude session（與專案維護者）快速上手用。語言：繁體中文 + 英文技術名詞。

## 1. 這是什麼

**TravelRecorder** 是一個**本機優先（local-first）、可離線的 PWA**「旅遊行程＋記帳」網頁 App，
用來取代原本易壞的 Google Sheets / Excel 流程。

- **核心原則**：所有金額計算（換匯、小計、總計、平均）都是 `src/lib/money.ts` 裡的**純函式**，
  不靠試算表公式 → 不會因為新增/移動資料而「公式壞掉」。
- **資料只存在使用者瀏覽器**（IndexedDB），**沒有後端、沒有帳號、不上傳雲端**；備份靠 JSON 匯出/匯入。
- 取代原試算表的「景點」分頁：景點變成**全域、依三層地理階層（國家／都市／區域）分組、可重複使用**的參考資料，行程「景點」欄直接下拉（可依國家／類型篩選）。

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
| `src/types.ts` | 資料模型：`Trip` / `Attraction` / `ExpenseItem` / `ItineraryItem` / `Member` / `ShoppingItem` / `PackingItem` |
| `src/db/db.ts` | Dexie 定義（`export const db`），tables：trips/attractions/expenses/itinerary/members/shopping/packing（**v4**；景點地點歷經 v3 `region`、v4 升為 `country`/`city`/`district` 三層＋`type`，皆含自動遷移） |
| `src/lib/money.ts` | **所有金額計算純函式**（換匯/小計/總計/平均/四捨五入/`fmt`）＋ **`settle` 分帳** |
| `src/lib/money.test.ts` | money 測試（含對照原試算表的 14875 / 7437） |
| `src/lib/backup.ts` | JSON 備份：`exportAll` / `downloadBackup` / `parseBackup` / `importAll(data, 'replace'\|'merge')` |
| `src/lib/csv.ts` | RFC4180 `parseCSV`（處理引號內逗號/換行、CRLF、BOM） |
| `src/lib/importAttractions.ts` | 景點 CSV 匯入：`rowsToAttractions`（純）/ `mergeAttractions` / `importAttractionsFromCSV` |
| `src/lib/group.ts` | `groupByLocation`（依 國家／都市／區域 分組，回傳 `{country, city, district, label, list}`）＋ `getLocationOptions`（級聯篩選選項）＋ `SEP` |
| `src/lib/id.ts` | `newId`（`crypto.randomUUID`）/ `now` |
| `src/App.tsx` | HashRouter + 版面；路由 `/`、`/trip/:id`、`/attractions` |
| `src/components/TopNav.tsx` | 上方導覽 + 匯出/匯入備份 |
| `src/components/cells.tsx` | 共用輸入元件（`TextInput`/`NumberInput`/`Select`/`Th`/`Td`…，**聚焦緩衝**式） |
| `src/components/AttractionPicker.tsx` | 行程用的景點下拉（內建國家／類型篩選，optgroup 依 `groupByLocation` 的「國家 · 都市 · 區域」） |
| `src/components/MemberSelect.tsx` | 付錢者下拉（成員清單） |
| `src/components/ParticipantsPicker.tsx` | 分攤對象勾選 popover（空陣列＝全部均分） |
| `src/pages/TripList.tsx` | 旅程清單（新增/開啟/刪除，刪除連帶清各表） |
| `src/pages/TripDetail.tsx` | 單一旅程，分頁：總覽 / 花費 / 行程 / 購物 / 分帳 / 行李 |
| `src/components/trip/{OverviewTab,ExpensesTab,ItineraryTab,ShoppingTab,SettlementTab,PackingTab}.tsx` | 六個分頁內容 |
| `src/pages/Attractions.tsx` | 景點庫（國家/都市/區域/類型 CRUD、級聯篩選、「匯入 CSV」） |
| `.github/workflows/deploy.yml` | GitHub Pages 自動部署 |

## 5. 資料模型（詳見 `src/types.ts`）

- **Trip**：`name, region, startDate, endDate, currencyCode, currencyLabel, exchangeRate, peopleCount`。
- **Attraction**（全域）：`country`（國家）, `city`（都市）, `district`（區域）, `name, address`（詳細地址）, `url, notes, priority, type`（`'attraction'|'food'|''`）。**分組鍵＝國家＋都市＋區域**。
- **ExpenseItem**：`tripId, date, time, item, currency, amount, fee, paid, paidBy, payerId?, participantIds?, paymentStatus, notes, sort`。
- **ItineraryItem**：`tripId, date, time, attractionId, activity, hours, transportCost, activityCost, paidBy, payerId?, participantIds?, notes, link, sort`。
- **Member**（per trip）：`name, passportName, passportNumber, birthday, sort`。
- **ShoppingItem**（per trip）：`date, time, item, currency, amount, fee, payerId?, participantIds?, notes, sort`。
- **PackingItem**（per trip）：`item, quantity, notes, checked, sort`。
- **分帳欄位**：`payerId`＝付錢成員；`participantIds`＝分攤成員（**空/未設＝全體均分**）。

## 6. 核心慣例與設計決策

- **計算不存、只算**：小計/總計/平均一律由 `money.ts` 即時算出，DB 只存原始輸入。
  花費每列自帶 `currency`（外幣或 `TWD`）；換算匯率取自 `trip.exchangeRate`（`TWD` 視為 1）。
- **即時更新**：頁面用 `useLiveQuery` 讀 Dexie，資料一改畫面與計算立即重算。
- **輸入元件聚焦緩衝**（`cells.tsx`）：因為寫入 IndexedDB 後會經 `useLiveQuery` 回流，
  輸入框在「聚焦時不被外部值覆寫」，避免游標跳動/吃字。**新增表單欄位請沿用這些元件**。
- **景點是全域參考資料**，以「國家／都市／區域」（`country`/`city`/`district`）三層分組、可標 `type`（景點/美食）；行程以 `attractionId` 參照。CSV 匯入時「地點」欄落在 `city`、`country` 留空待補，餐館表標 `type:'food'`。
- id 一律 `newId()`；數字輸入值為 0 時顯示空白。
- **資料每台裝置各自存**（IndexedDB 不跨裝置同步）。跨裝置 = JSON 匯出再匯入；CSV 匯入是**合併不覆蓋**。
- **分帳**（`money.ts` 的 `settle`）：彙整花費＋行程＋購物，每筆依 `payerId`／`participantIds` 算各人已付/應分攤/結餘，貪婪法給「誰付給誰」最少筆數轉帳；未設付錢者的列不列入。三類花費每列可選付錢者與分攤對象，預設全體均分。

## 7. 已完成（截至目前）

- ✅ **核心 v1**：旅程清單；旅程總覽（幣別/匯率/人數）；花費（自動換算台幣、小計、總計、平均）；
  行程（景點下拉、自動小計）；景點庫（依地區分組 CRUD）。
- ✅ **備份**：完整 JSON 匯出/匯入（`importAll` 支援 `replace` 與 `merge`；UI 目前用 replace）。
- ✅ **PWA**：service worker 離線可用、可加到主畫面。
- ✅ **景點 CSV 匯入（合併）**：處理多表格串接、地點向下填滿、關西重複清單去重、
  餐館自成「美食」分組（時間/價位寫進備註）、略過雜項、引號內逗號。
- ✅ **第二版（人員/分帳/購物/行李）**：同行者管理＋**分帳結算**（每人已付/應分攤/結餘、最少筆數「誰付給誰」）；購物記帳；行李清單（可勾選）。花費/行程/購物每列可選**付錢者**與**分攤對象**（預設全體均分）。
- ✅ **景點三層地理階層＋類型篩選（v3→v4）**：景點地點為「國家／都市／區域」三層＋類型（景點/美食）；
  景點庫提供級聯篩選（國家→都市→區域、類型），行程景點下拉也可依國家／類型篩選；
  Dexie v3/v4 自動遷移舊資料；CSV 匯入「地點」對應都市、國家留空待補；備份匯入相容各舊版 JSON。
- ✅ **自動部署**：GitHub Actions → GitHub Pages。
- ✅ **單元測試 26 項**：`money`(16，含 `settle` 分帳) + `csv`(5) + `importAttractions`(5)，`npm run test` 全綠。

## 8. 部署與眉角（重要！）

- 流程：`.github/workflows/deploy.yml` 在 **push 到 `main`** 或手動 **`workflow_dispatch`** 時，
  `npm ci → npm run build → 發佈 dist/ 到 Pages`。
- **Pages 免費版需要 repo 為 public**（私有需付費方案）→ 本 repo 已設 public。
- **預設分支＝`main`**（取代舊的 `claude/hopeful-johnson-7dkkix`；`main` 已快轉到最新 commit）。
  - ⚠️ **變更「預設分支」只能在 GitHub 網頁 Settings → General → Default branch** 操作：無對應 API/MCP 工具，開發沙箱也不能改 repo 設定。
  - ⚠️ **`github-pages` 環境另有獨立的「deployment branches」白名單**（與 repo 預設分支是兩回事）：只把預設分支改成 `main` **還不夠**，得再到 **Settings → Environments → github-pages → Deployment branches and tags** 把 `main` 加進允許清單（或設「No restriction」）。否則 `deploy` job 會在約 2 秒內、**連 step 都沒跑就 failure**（job log 回 404＝環境保護在 gate 擋下，不是程式問題；`build` job 仍會 success）。兩者都設好後，push `main` 才會自動 build+deploy。
  - 手動部署：在 `main` 上 `workflow_dispatch`（GitHub MCP `actions_run_trigger`），再用 Actions API 確認 build+deploy 兩個 job 皆 success。
  - 純文件/工具變更想跳過部署 → commit 訊息加 `[skip ci]`。
  - ⚠️ 舊的 `claude/*` 分支內容均已併入 `main`，可在網頁刪除；**開發沙箱 git proxy 會擋 `git push --delete`（回 403）**，無法從這裡刪。
- `vite.config.ts` 用 `base: './'` ＋ `HashRouter`，所以放在 `/TravelRecorder/` 子路徑、重新整理都正常。
- ⚠️ **此開發沙箱無法對外連 `github.io`（curl 會回 403）**。
  要確認部署成功，請用 **GitHub Actions API/MCP 看 workflow run 的 build+deploy 兩個 job 是否 success**，不要靠 curl。

## 9. 尚未完成 / Roadmap

- 可考慮：行程「景點」下拉**自動依旅程地區預選**（目前為手動國家/類型篩選）；美食加獨立 price 欄；備份匯入 UI 提供 merge 選項；分攤加「比例/權重」。
- **已知小限制**：
  - 分帳：`trip.peopleCount`（花費頁「平均」用）與「分帳」成員清單**各自獨立**；**未設付錢者**的列不列入結算；刪除成員後，參照它的列需重新指定。
  - CSV：「名稱只放在『地點』欄、而『景點』欄空白」的少數列（如 動物園、北海道神宮）匯入會被略過，需手動補。

## 10. 開發注意

- 開發在指定的功能分支進行；commit 後推送。**未經同意不要 push 到別的分支、不要開 PR。**
- **不要把使用者個人資料（例如景點 CSV）提交進這個 public repo**；測試請用合成樣本。
- 改動金額/匯入邏輯後務必 `npm run test`；改動 App 後 `npm run build` 應通過（含 `tsc --noEmit` 型別檢查）。
- **每次做完修改都要把「最新狀況」更新回本檔 CLAUDE.md**（例如「## 7. 已完成（截至目前）」或「## 9. 尚未完成 / Roadmap」），讓文件與程式碼同步。
  此慣例由 `.claude/settings.json` 的 **Stop hook**（腳本 `.claude/hooks/remind-update-claude-md.sh`）自動把關：
  偵測到本回合有原始碼/檔案變更、卻沒有同時更新 CLAUDE.md 時，會在回合結束前提醒補上（同一回合只提醒一次）；
  `.claude/` 工具設定本身的變更不列入，純暫存/實驗等不需更新文件的情況，於回覆中說明原因即可放行。

## 11. 開發工作流自動化（`.claude/`）

- `.claude/settings.json`：專案層級 Claude Code 設定（**已進版控**，因遠端容器每次重新 clone，需 commit 才會在未來 session 持續生效）。
- `.claude/hooks/remind-update-claude-md.sh`：Stop hook 腳本，落實第 10 節「做完修改就更新 CLAUDE.md」的習慣。
- 要檢視／停用此 hook：在 Claude Code 內開 `/hooks`。
