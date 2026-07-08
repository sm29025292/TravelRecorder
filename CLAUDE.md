# CLAUDE.md — TravelRecorder 專案說明

> 給未來的 Claude session（與專案維護者）快速上手用。語言：繁體中文 + 英文技術名詞。

## 1. 這是什麼

**TravelRecorder** 是一個**本機優先（local-first）、可離線的 PWA**「旅遊行程＋記帳」網頁 App，
用來取代原本易壞的 Google Sheets / Excel 流程。

- **核心原則**：所有金額計算（換匯、小計、總計、平均）都是 `src/lib/money.ts` 裡的**純函式**，
  不靠試算表公式 → 不會因為新增/移動資料而「公式壞掉」。
- **資料預設只存在使用者瀏覽器**（IndexedDB），**沒有後端、沒有帳號、預設不上雲**；備份靠 JSON 匯出/匯入。
  自 T10（2026-07-07）起可 **opt-in** 手動把**加密**備份上傳到使用者**自己**的私人 GitHub Gist
  （前端 AES-GCM＋PBKDF2 加密、PAT 只存本機、無第三方伺服器）。
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
| `ISSUE_LIST.md` | **開發任務清單**（進行中 T11–T24 的完整規格、依賴、驗收條件與進度表，供後續 session 逐項接手；T1–T10 已完成歸檔，完成摘要見本檔 §7） |
| `src/types.ts` | 資料模型：`Trip` / `Attraction` / `ExpenseItem` / `ItineraryItem` / `Member` / `ShoppingItem` / `PackingItem` |
| `src/db/db.ts` | Dexie 定義（`export const db`），tables：trips/attractions/expenses/itinerary/members/shopping/packing（**v5**；景點地點歷經 v3 `region`、v4 升為 `country`/`city`/`district` 三層＋`type`；v5 把 shopping 全表搬進 expenses、shopping 表保留但恆空；皆含自動遷移） |
| `src/lib/money.ts` | **所有金額計算純函式**（換匯/小計/總計/平均/四捨五入/`fmt`）＋ **`settle`／`settleByCurrency` 分帳**（成對淨額、各幣別獨立） |
| `src/lib/money.test.ts` | money 測試（含對照原試算表的 14875 / 7437） |
| `src/lib/backup.ts` | JSON 備份：`exportAll` / `downloadBackup` / `parseBackup` / `importAll(data, 'replace'\|'merge')` |
| `src/lib/crypto.ts` | T10 加密：`encryptText`／`decryptText`（AES-GCM 256bit＋PBKDF2-SHA256 iter 310000；envelope JSON `{v,alg,kdf,iter,salt,iv,data}`，salt/iv/data base64） |
| `src/lib/sync.ts` | T10 Gist 同步後端：`SyncBackend` 介面、`GistBackend`（read/write，處理 `truncated`＋`raw_url`）、`createGist`（`public:false`） |
| `src/components/SyncDialog.tsx` | 「同步」對話框（token/gistId/passphrase＋上傳/下載按鈕；localStorage `tr.sync.*`） |
| `src/lib/csv.ts` | RFC4180 `parseCSV`（處理引號內逗號/換行、CRLF、BOM） |
| `src/lib/importAttractions.ts` | 景點 CSV 匯入：`rowsToAttractions`（純）/ `mergeAttractions` / `importAttractionsFromCSV` |
| `src/lib/dedupeAttractions.ts` | 重複景點合併：`normalizeName` / `findDuplicateGroups`（純）/ `mergeAttractionFields`（純）/ `applyMerge`（單 transaction 更新 survivor＋重指行程參照＋刪除 losers） |
| `src/lib/orphanItinerary.ts` | 孤兒行程列偵測：`findOrphanItinerary`（純，`attractionId` 非空且景點庫查無者） |
| `src/lib/group.ts` | `groupByLocation`（依 國家／都市／區域 分組，回傳 `{country, city, district, label, list}`）＋ `buildLocationTree`（T4 三層樹：`CountryNode`/`CityNode`/`DistrictNode`，未分類置頂）＋ `getLocationOptions`（級聯篩選選項）＋ `SEP` |
| `src/lib/currency.ts` | `COUNTRY_CURRENCY`（國家→幣別/名稱）＋ `DEFAULT_RATES`（對台幣首次預設匯率）＋ `pickExchangeRate`（優先取其他旅程最新使用過的匯率） |
| `src/lib/id.ts` | `newId`（`crypto.randomUUID`）/ `now` |
| `src/App.tsx` | HashRouter + 版面；路由 `/`、`/trip/:id`、`/attractions` |
| `src/components/TopNav.tsx` | 上方導覽 + 匯出/匯入備份 |
| `src/components/cells.tsx` | 共用輸入元件（`TextInput`/`NumberInput`/`Select`/`Th`/`Td`…，**聚焦緩衝**式） |
| `src/components/AttractionPicker.tsx` | 行程用的景點下拉（內建國家／類型篩選，optgroup 依 `groupByLocation` 的「國家 · 都市 · 區域」） |
| `src/components/MemberSelect.tsx` | 付錢者下拉（成員清單） |
| `src/components/ParticipantsPicker.tsx` | 分攤對象勾選 popover（空陣列＝全部均分） |
| `src/pages/TripList.tsx` | 旅程清單（新增/開啟/刪除，刪除連帶清各表） |
| `src/pages/TripDetail.tsx` | 單一旅程，分頁：總覽 / 花費 / 行程 / 分帳 / 行李 |
| `src/components/trip/{OverviewTab,ExpensesTab,ItineraryTab,SettlementTab,PackingTab}.tsx` | 五個分頁內容 |
| `src/pages/Attractions.tsx` | 景點庫（T4 樹狀階層：國家→都市→區域可摺疊，節點「編輯」以 modal 批次改子樹位置；表格移除國家/都市/區域欄，改以「搬移」按鈕移動單列；級聯篩選＋類型 CRUD、「匯入 CSV」） |
| `.github/workflows/deploy.yml` | GitHub Pages 自動部署 |

## 5. 資料模型（詳見 `src/types.ts`）

- **Trip**：`name, country, city, region, startDate, endDate, currencyCode, currencyLabel, exchangeRate, peopleCount`。`country`/`city` 為 T2 起連動景點庫的下拉欄；`region` 為舊自由文字欄，保留以相容舊備份／顯示參考；`peopleCount` 自 T20 起無 UI（花費平均改用分帳成員數），欄位保留以相容舊備份。
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
- **景點是全域參考資料**，以「國家／都市／區域」（`country`/`city`/`district`）三層分組、可標 `type`（景點/美食）；行程以 `attractionId` 參照。CSV 匯入時「地點」欄落在 `city`、餐館表標 `type:'food'`；表頭若額外含「區域」欄（放在「地點」與「景點」之間）則落入 `district`（區域跟隨「地點」向下填滿、都市切換時自動重置；含區域欄時餐館 city 不再加「 美食」後綴，只以 `type:'food'` 區分）；表頭若再額外含「國家」欄（放在「地點」之前）則落入 `country`（同樣向下填滿、切換時自動重置 city+district），沒有此欄則 `country` 留空待補。
- id 一律 `newId()`；數字輸入值為 0 時顯示空白。
- **資料每台裝置各自存**（IndexedDB 不跨裝置同步）。跨裝置 = JSON 匯出再匯入；CSV 匯入是**合併不覆蓋**。
- **分帳**（`money.ts` 的 `settle`／`settleByCurrency`）：只彙整**花費**（T17 起行程不列入），每筆依 `payerId`／`participantIds` 算各人已付/應分攤/結餘，「誰付給誰」用**成對淨額**（T24：兩兩互欠對沖，每筆轉帳對應實際債務、可追溯；不用最少筆數貪婪法）；**各幣別獨立結算、不換匯、不跨幣別對沖**（T24：金額入該列幣別的桶，台幣「手續費(元)」另計入 TWD 桶）。未設付錢者或標「已結清」（T19）的列不列入。花費每列可選付錢者與分攤對象，預設全體均分。

## 7. 已完成（截至目前）

- ✅ **核心 v1**：旅程清單；旅程總覽（幣別/匯率/人數）；花費（自動換算台幣、小計、總計、平均）；
  行程（景點下拉、自動小計）；景點庫（依地區分組 CRUD）。
- ✅ **備份**：完整 JSON 匯出/匯入（`importAll` 支援 `replace` 與 `merge`；UI 目前用 replace）。
- ✅ **PWA**：service worker 離線可用、可加到主畫面。
- ✅ **景點 CSV 匯入（合併）**：處理多表格串接、地點向下填滿、關西重複清單去重、
  餐館自成「美食」分組（時間/價位寫進備註）、略過雜項、引號內逗號。
- ✅ **CSV「區域」欄支援**（2026-07-06）：`src/lib/importAttractions.ts` 的 `detectHeader`
  多認一個「區域」欄位（放在「地點」與「景點」之間），`rowsToAttractions` 對應 `district`
  並跟隨「地點」向下填滿、都市切換時自動重置為空；有「區域」欄時餐館的 city 不再加
  「 美食」後綴（只靠 `type:'food'` 區分，讓景點/美食可共用同一都市/區域樹枝）。
  `mergeAttractions` 的 dedup key 也擴為 `(country, city, district, name)`。
  舊 CSV（無「區域」欄）行為完全不變；新增 4 條測試 → 全 72 綠。
- ✅ **CSV「國家」欄支援**（2026-07-06）：`src/lib/importAttractions.ts` 的 `detectHeader`
  再多認一個「國家」欄位（放在「地點」之前），`rowsToAttractions` 對應 `country` 並
  跟隨向下填滿、切換國家時 city+district 一併重置。順手把 `ColMap.country` 這個誤稱
  （實際指「地點」欄位）改名為 `city`，讓語意乾淨；`items.push` 的 `country` 從硬寫
  `''` 改用 `currentCountry`；`JUNK_COUNTRIES` 判斷比對對象由 `currentCountry` 改為
  `currentCity`（原意本就是地點）。舊 CSV（無「國家」欄）行為完全不變（`col.country=-1`
  → `currentCountry=''`）；新增 3 條測試 → 全 75 綠。
- ✅ **第二版（人員/分帳/購物/行李）**：同行者管理＋**分帳結算**（每人已付/應分攤/結餘、最少筆數「誰付給誰」）；購物記帳；行李清單（可勾選）。花費/行程/購物每列可選**付錢者**與**分攤對象**（預設全體均分）。
- ✅ **景點三層地理階層＋類型篩選（v3→v4）**：景點地點為「國家／都市／區域」三層＋類型（景點/美食）；
  景點庫提供級聯篩選（國家→都市→區域、類型），行程景點下拉也可依國家／類型篩選；
  Dexie v3/v4 自動遷移舊資料；CSV 匯入「地點」對應都市、國家留空待補；備份匯入相容各舊版 JSON。
- ✅ **T1 購物併入花費（v4→v5）**：新增 `src/lib/migrate.ts` 的 `shoppingToExpense`（id 沿用、notes 前綴 `[購物]`）；
  Dexie v5 upgrade 自動把 shopping 全表轉入 expenses（sort 接續、shopping 表清空但宣告保留）；
  備份匯入相容舊 JSON（含 shopping 者亦自動轉入 expenses）；UI 移除購物分頁與 `ShoppingTab.tsx`。
- ✅ **T2 總覽頁地點下拉＋幣別/匯率自動帶入**：`Trip` 加 `country`/`city`（保留 `region` 相容舊備份，UI 舊資料以 `?? ''` 容錯，DB 不升版）；
  新 `src/lib/currency.ts`（`COUNTRY_CURRENCY` / `DEFAULT_RATES` / `pickExchangeRate`）；
  `OverviewTab` 改為國家／都市 input＋datalist（連動景點庫），選國家自動帶幣別代碼／名稱／匯率
  （優先取「其他旅程最新使用過的匯率」，否則 `DEFAULT_RATES`；TWD 設 1；三欄仍可手動改）；
  `cells.tsx` 的 `TextInput` 新增 `list` prop 以支援 datalist；舊 `region` 有值且 `country` 空時顯示灰字備註。
- ✅ **T3 行程景點下拉依旅程國家預選**：`AttractionPicker` 新增 `defaultCountry?: string` prop，
  用來初始化內部「國家篩選」state（僅初始化，使用者仍可切回「全部」或其他國家）；
  `ItineraryTab` 傳入 `trip.country ?? ''`。若該國家在景點庫沒有景點，下拉為空清單；切「全部」即恢復。
- ✅ **T6 行程逐日檢視**：新增 `src/lib/itinerary.ts`（`groupItineraryByDate` 依 date 升冪分組／空 date 組置底；
  `weekdayLabel` 中文週幾；`itineraryDaySubtotal` 時數／外幣／台幣合計，台幣沿用 `itineraryTotal`）；
  `ItineraryTab.tsx` 由平面表格改為每天一張小表，區塊標題顯示「日期 (週X) · 當日 hours · 外幣 · 台幣」；
  每區塊「＋新增」預填該日 date、未排日期組不預填；頁尾整趟總計保留。
- ✅ **T4 景點庫樹狀階層＋節點批次編輯**：`src/lib/group.ts` 加純函式 `buildLocationTree`（`CountryNode`/`CityNode`/`DistrictNode`，
  `country === ''` 節點置頂顯示「未分類」，其餘依 `zh-Hant` 排序；city/district 亦 zh-Hant 排序，district 為空的列進 `CityNode.direct`）；
  `Attractions.tsx` 改為樹狀渲染（國家預設展開／都市預設摺疊、摺疊狀態存於 component state），節點「編輯」以 modal 批次改子樹的
  國家（＋都市／區域），`db.attractions.where('id').anyOf(ids).modify(patch)` 一次更新，套用前 `window.confirm` 二次確認
  （單列「搬移」不需確認）；景點列表移除國家／都市／區域三欄（`min-w-[42rem]`），改用列上「搬移」按鈕開同一 modal 更新單筆。
  「未分類」國家節點的編輯就是「批次補國家」的入口。
- ✅ **T5 景點刪除防護**：`Attractions.tsx` 的 `remove` 改為 async，刪除前用
  `db.itinerary.filter((r) => r.attractionId === id).count()` 計算引用數；
  count > 0 顯示「此景點被 N 筆行程使用，刪除後那些行程列將顯示空白。仍要刪除？」，
  count = 0 則簡單 confirm 一次；不動 DB schema 也不加索引（`attractionId` 無索引、資料量小可全掃）。
- ✅ **T7 小型 UX 三件組（開網址／名稱搜尋／優先度星星）**：
  `src/lib/group.ts` 於 `groupByLocation` 與 `buildLocationTree` 的組內 list 加排序
  `(b.priority - a.priority) || a.name.localeCompare(b.name, 'zh-Hant')`，Attractions 樹與 `AttractionPicker` 下拉同步依 priority 降冪、
  同分依中文名升冪；`Attractions.tsx` 篩選列加「名稱」搜尋（同時比對 name/address/notes，清除按鈕連動），
  網址欄旁加 ↗ 按鈕（`window.open(url, '_blank', 'noopener')`、空值隱藏），priority 欄改內嵌 `PriorityStars` 三顆可點星星
  （點第 n 顆設 n；再點同一顆歸 0；讀取時 clamp 到 0–3 防禦舊資料）；`ItineraryTab.tsx` link 欄比照加 ↗ 按鈕；
  `AttractionPicker.tsx` option 文字以 `★` 前綴顯示 priority 對應數量。無 schema 變動。
- ✅ **T8 重複景點合併工具**：新檔 `src/lib/dedupeAttractions.ts`：`normalizeName`（去半形／全形空白＋lowercase）、
  `findDuplicateGroups`（依正規化名稱分桶、組內依 priority 降冪、組間依 zh-Hant 排序）、`mergeAttractionFields`
  （survivor 非空欄位優先、空欄取第一個非空 loser、notes 依 `・` split→trim→保序去重→join、priority 取最大、id 沿用 survivor）、
  `applyMerge(survivorId, loserIds)`（單一 `db.transaction('rw', db.attractions, db.itinerary, ...)`：以合併欄位 `put` survivor、
  用 `db.itinerary.filter((r) => loserIds.includes(r.attractionId)).modify(...)` 把行程參照重指向 survivor、`bulkDelete` losers）；
  `Attractions.tsx` 頂部加「整理重複」按鈕與 `DedupePanel` modal：以 `useLiveQuery` 讀全庫→掃出重複組、每組 radio 選保留者
  （預設「非空欄位數最多」平手取 priority）、顯示各筆位置／地址／網址／備註差異，可「合併」（confirm 後呼叫 `applyMerge`）或「略過」
  （加入 `skippedGroups: Set<string>` set，關 modal 重開會回來）；DB schema 不動、無新索引（沿 T5 全表 `filter`）。
- ✅ **T9 孤兒參照健檢**：新檔 `src/lib/orphanItinerary.ts` 提供純函式
  `findOrphanItinerary(itinerary, attractions)`（以 attractions id 建 Set，過濾
  `attractionId !== '' && !idSet.has(attractionId)`，保留輸入順序）；
  `Attractions.tsx` 頂部工具列加「健檢」按鈕與 `HealthPanel` modal（鏡射 `DedupePanel` 版型）：
  以 `useLiveQuery` 額外讀 `db.trips` / `db.itinerary`，掃出孤兒後依 `tripId` 分組（保留輸入順序）、
  每組標題顯示旅程名（查無時顯示「找不到旅程」＋原 tripId、「前往旅程」按鈕 disabled），
  每列顯示日期／時間／活動／`attractionId` 前 8 碼＋「清除參照」按鈕
  （confirm→`db.itinerary.update(id, { attractionId: '' })`）；無孤兒時面板顯示
  「無孤兒行程列，資料一致。」。DB schema 未動、無新索引（沿 T5 全表 filter 慣例）。
- ✅ **T10 Gist 加密同步（手動上傳/下載）**（2026-07-07）：新檔 `src/lib/crypto.ts`
  （WebCrypto AES-GCM 256bit＋PBKDF2-SHA256 iter 310000；envelope JSON `{v:1,alg,kdf,iter,salt,iv,data}`，
  salt 16 bytes／iv 12 bytes 隨機、皆 base64；錯誤密語丟「密語錯誤或資料損毀」，訊息不含 passphrase）、
  `src/lib/sync.ts`（`SyncBackend` 介面、`GistBackend` 用 `Authorization: Bearer` 與
  `X-GitHub-Api-Version: 2022-11-28` 呼叫 `api.github.com/gists/{id}`：read 抓固定檔名
  `travel-recorder.enc.json`、若 `truncated` 或無 content 則再抓 `raw_url`；write 用 PATCH；
  `createGist` POST `public:false` 新 gist）；新元件 `src/components/SyncDialog.tsx` 提供 token／
  gistId／passphrase 三欄＋「建立新 Gist」與「上傳／下載」按鈕，設定經 localStorage
  `tr.sync.token`／`tr.sync.gistId` 持久化，密語預設不留、勾「記住密語（此裝置）」才寫
  `tr.sync.passphrase`；下載時彈確認框顯示雲端 `exportedAt` 與本機 trips 最大 `updatedAt`、
  一律 `importAll(data, 'replace')`；`TopNav.tsx` 加「同步」按鈕開啟該對話框；token/passphrase
  絕不進 log／commit／錯誤訊息（HTTP 錯誤只回 status）。沙箱因無法對外連 `api.github.com`，
  真機驗證由擁有者於裝置 A/B 上完成。
- ✅ **T11 行程同日依時間排序＋時間/日期輸入失焦寫入**（2026-07-07）：`src/lib/itinerary.ts` 的
  `groupItineraryByDate` 組內排序鍵由 `a.sort - b.sort` 改為：兩者 `time` 皆非空 → `at.localeCompare(bt)`；
  一空一非空 → **空 `time` 沉底**；同 `time` 或皆空 → 退回 `a.sort - b.sort`（穩定）。同步更新 JSDoc。
  `src/components/cells.tsx` 的 `TextLikeProps` 加 `commitOnBlur?: boolean`（預設 `false`＝行為完全不變）：
  `true` 時 `onChange` handler 只 `setText`、不呼叫父層；`onBlur` 於 `setFocused(false)` 之後
  若 `text !== value` 才呼叫 `onChange(text)`。`TimeInput`／`DateInput` wrapper 各固定 `commitOnBlur`
  以延後寫入，全 App 所有時間／日期欄（花費／總覽／行程／成員生日）一併生效；`TextInput`／`NumberInput` **不動**。
  新增 3 條 `itinerary.test.ts` 測試（時間排序、同 time 依 sort tie-break、全空 time 退回 sort）。
  Dexie／備份／`ItineraryTab.tsx` 皆未動；避開了「編輯 `HH:MM` 中列即時重排 → 輸入框失焦吃字」的 UI bug。
- ✅ **T17 行程移除付錢/分攤欄＋分帳結算不再計入行程**（2026-07-08）：`src/components/trip/ItineraryTab.tsx`
  移除「付錢」「分攤」兩欄（`Th`＋`Td`）與 `MemberSelect`／`ParticipantsPicker` import，`members`
  的 `useLiveQuery` 一併移除（去欄後不再使用）；`addRow` 仍寫入 `payerId: ''`／`participantIds: []`
  以符合型別必填與備份相容；表格 `min-w-[78rem]` 降為 `min-w-[66rem]`（去掉的兩欄約合 13rem），
  空狀態列 `colSpan` 由 13 改為 11。`src/components/trip/SettlementTab.tsx`（凍結區局部解凍）
  移除 itinerary 與 shopping 兩個 `useLiveQuery` 與其 `entries` 迴圈，`itinerarySubtotal` import
  一併清掉；說明文字改「彙整花費：每筆依『付錢』與『分攤』計算。預設全體均分；『付錢』未指定的列不列入結算。」。
  `src/types.ts` 不動（`ItineraryItem.payerId`／`participantIds` 欄位保留、備份相容）；
  `settle()` 純函式與 `settle` 相關測試皆不受影響。行程列的金額自此不再進入分帳結算——
  舊資料若行程曾設過付錢者，結算數字會改變（擁有者已同意）。
- ✅ **T19 花費「已結清」生效（結算排除）**（2026-07-08）：`src/components/trip/SettlementTab.tsx`
  （凍結區局部解凍）expenses 彙整迴圈跳過 `e.paymentStatus === '已結清'` 的列（字面值比對，
  資料就是存中文字串；該筆的付錢與分攤都不計入結算），過濾在彙整層做、`settle()` 純函式不動；
  說明文字改「彙整花費：每筆依『付錢』與『分攤』計算，預設全體均分；『付錢』未指定或標『已結清』
  的列不列入結算。」。`src/components/trip/ExpensesTab.tsx` 的 `<Th>狀態</Th>` 內層加
  `<span title="標「已結清」的列不列入分帳結算">`（`Th` 元件不支援 title prop，依規格加在內層）。
  `paymentStatus` 選項清單不動；「已付」「未付」維持純備註；`paid` boolean 遺留欄位保留相容。
- ✅ **T20 總覽移除人數欄＋花費平均改用成員數**（2026-07-08）：`src/components/trip/OverviewTab.tsx`
  移除「人數（算平均用）」`Field`（`peopleCount` 自此無任何 UI；「匯率」欄留在原 `grid-cols-2`
  版面維持半寬）；`src/components/trip/ExpensesTab.tsx` 平均分母由 `trip.peopleCount` 改為
  `members.length`（members 的 `useLiveQuery` 原已存在），顯示改「平均（{members.length} 人）：X 元」、
  `members.length === 0` 時整段平均隱藏——全 App 人數來源自此統一為分帳頁的成員清單，
  解掉「平均人數 vs 分帳成員數」兩套來源的矛盾。`src/types.ts` 與 `TripList.tsx` 的 `addTrip`
  不動（`peopleCount` 欄位與預設值保留、備份相容）；`expensesAverage` 純函式不動（原本就防除零）。
- ✅ **T12 行程列小計改外幣為主＋頁尾三數值總計**（2026-07-07）：`src/lib/money.ts` 新增純函式
  `itineraryForeignSubtotal(item)`＝ `round((transportCost||0)+(activityCost||0))`，型別
  `Pick<ItineraryItem,'transportCost'|'activityCost'>` 沿用 `itinerarySubtotal` 的最小介面；
  `src/components/trip/ItineraryTab.tsx`：表頭 `小計(元)` 改 `小計({cur})`；每列小計欄改同格兩行
  （主行外幣 `fmt(itineraryForeignSubtotal(it))`、下方灰字 `text-xs font-normal text-gray-400`
  台幣 `fmt(itinerarySubtotal(it, trip))`）；頁尾原「交通＋花費小計：X 元」改用
  `itineraryDaySubtotal(list, trip)` 對整趟計算，顯示與當日標題同格式的
  `總計 {hours} 小時 · {cur} {foreign} · 台幣 {twd}`（`text-gray-600`），順手移除原本地
  `total`＋`itineraryTotal` import（已改由 `itineraryDaySubtotal.twd` 提供）。
  新增 2 條 `money.test.ts` 測試（外幣小計正常、缺值當 0）；不動
  `itinerarySubtotal`／`itineraryTotal`／`ExpensesTab`／schema／備份。
- ✅ **T24 分帳成對淨額＋各幣別獨立結算**（2026-07-08）：`src/lib/money.ts` 的 `settle()`
  balances 計算不動，轉帳產生由「最少筆數貪婪法」改為**成對淨額**——entries 迴圈同時累計
  debtor→creditor 債務（`Map` key `${from}|${to}`，付錢者自付的份不記債），每對成員互欠對沖後
  依 memberIds 順序輸出（例：A 付 1200、B 付 300 三人均分 → B→A 300、C→A 400、C→B 100，
  不再是 C→A 500、B→A 200）；新增 `settleByCurrency(memberIds, entries)`（entry 多 `currency` 欄、
  空字串視為 TWD）：按幣別分桶各自跑 `settle`、互不換匯不對沖，TWD 桶排最前、全零桶不回傳。
  `SettlementTab.tsx`（凍結區局部解凍）entries 改帶幣別：金額入該列幣別桶（不再過 `expenseSubtotal`
  換匯）、台幣「手續費(元)」非零時另計一 entry 入 TWD 桶；渲染改一個幣別一個區塊（標題台幣／
  `currencyLabel（代碼）`，結餘表與結算建議單位跟著幣別），無可結算列顯示「尚無可結算的花費。」。
  既有 `settle` 測試不變（皆單向債務、兩法同解），新增 5 條測試（成對淨額 2＋`settleByCurrency` 3）。
  舊資料影響：結算建議筆數可能變多、外幣旅程改以外幣面額結算（擁有者已同意）；花費頁台幣小計/總計/平均照舊。
- ✅ **自動部署**：GitHub Actions → GitHub Pages。
- ✅ **單元測試 90 項**：`money`(23，含 `settle` 分帳＋T12 `itineraryForeignSubtotal`＋T24 成對淨額/`settleByCurrency`) + `csv`(5) + `importAttractions`(12) + `migrate`(5) + `currency`(5) + `itinerary`(12，T6 分組／週幾／當日小計 + T11 組內時間排序) + `group`(7，T4 `buildLocationTree` + T7 組內 priority 排序) + `dedupeAttractions`(11，T8 `normalizeName`/`findDuplicateGroups`/`mergeAttractionFields`) + `orphanItinerary`(5，T9 `findOrphanItinerary`) + `crypto`(5，T10 roundtrip／錯誤密語／salt+iv 隨機／envelope 欄位／壞 JSON)，`npm run test` 全綠。

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

## 9. 開發方向 / Roadmap（2026-07 與擁有者討論收斂）

專案**聚焦「景點庫＋行程」兩大核心**。具體任務拆解在 **`ISSUE_LIST.md`**——後續 session 接手開發時，
**先讀本檔、再挑 ISSUE_LIST.md 的任務執行**。第一輪 T1–T10 已全數完成（規格歸檔，見 §7）；
現行為**第二輪 T11–T24**（T11–T23 於 2026-07-07 與擁有者討論定案、T24 於 2026-07-08 增補，設計決定已拍板、勿重新設計）。

- **範疇決策**：
  - **凍結（局部解凍）**（功能與資料保留、暫停開發）：分帳／成員、行李。
    **例外**：T17（結算不再計入行程）、T19（已結清生效）、T20（平均改用成員數）、T21（行李繼承）、
    T24（分帳成對淨額＋多幣別）可修改凍結區中各該任務規格明文點名的範圍，其餘仍勿動。
  - **購物分頁併入「花費」**（T1，✅ 2026-07-06）：資料一次性搬移（備註標 `[購物]`）、分頁移除；
    「花費」保留付錢者/分攤欄位作為未來分帳發展空間。
  - **總覽頁地點下拉＋幣別/匯率自動帶入**（T2，✅ 2026-07-06）：Trip 加 `country`/`city`（保留 `region`），
    OverviewTab 改為國家／都市 input＋datalist（連動景點庫），選國家自動帶幣別／匯率。
  - **行程景點下拉依旅程國家預選**（T3，✅ 2026-07-06）：`AttractionPicker` 加 `defaultCountry` prop，
    `ItineraryTab` 傳 `trip.country ?? ''`，只影響下拉初始的國家篩選。
  - **行程逐日檢視**（T6，✅ 2026-07-06）：新增 `src/lib/itinerary.ts`（分組／週幾／每日小計純函式），
    `ItineraryTab` 改為每天一小表、標題顯示日期＋週幾＋當日 hours/外幣/台幣，每區塊「＋新增」預填該日 date。
  - **景點庫樹狀階層＋節點批次編輯**（T4，✅ 2026-07-06）：`buildLocationTree` 三層樹＋Attractions 頁改樹狀渲染（未分類置頂、
    國家預設展開／都市預設摺疊），節點「編輯」以 modal 批次更新子樹國家（＋都市／區域），單列「搬移」以同一 modal 改單筆；
    「未分類」節點的編輯即是「匯入後批次補國家」的入口。
  - **景點刪除防護**（T5，✅ 2026-07-06）：`Attractions.tsx` 刪除前先數 `db.itinerary` 中 `attractionId === id` 的筆數，
    有引用時 confirm 訊息告知「N 筆行程列將顯示空白」，無引用則單純 confirm 一次；不動 schema 也不加索引。
  - **小型 UX 三件組**（T7，✅ 2026-07-06）：景點庫／行程頁的網址欄旁加 ↗ 開新分頁；Attractions 篩選列加「名稱」搜尋
    （同時比對 name/address/notes）；priority 欄改三顆可點星星（點同顆歸 0），Attractions 樹與 `AttractionPicker` 下拉皆依 priority 降冪排序，
    picker 選項文字以 ★ 前綴顯示。
  - **重複景點合併工具**（T8，✅ 2026-07-06）：`src/lib/dedupeAttractions.ts` 提供 `findDuplicateGroups`（名稱正規化分桶）、
    `mergeAttractionFields`（欄位擇優＋notes 聯集＋priority 取最大）、`applyMerge`（單 transaction 重指行程參照＋刪除 losers）；
    `Attractions.tsx` 加「整理重複」按鈕與 `DedupePanel` modal，radio 選保留者、每組可「合併」或「略過」。
  - **孤兒參照健檢**（T9，✅ 2026-07-06）：`src/lib/orphanItinerary.ts` 提供 `findOrphanItinerary`
    （純函式：`attractionId` 非空且景點庫查無者，保留輸入順序）；`Attractions.tsx` 頂部工具列加
    「健檢」按鈕與 `HealthPanel` modal，依 `tripId` 分組列出孤兒行程列（旅程名／日期／時間／活動／
    attractionId 前 8 碼），每列「清除參照」（`db.itinerary.update(id, { attractionId: '' })`）、
    每組「前往旅程」（`navigate('/trip/:id')`；旅程不存在時 disabled）。無 schema 變動。
  - **雲端同步**（T10，✅ 2026-07-07）：手動上傳/下載**加密**備份至使用者自己的私人 GitHub Gist
    （前端 AES-GCM 256bit＋PBKDF2-SHA256 iter 310000、PAT 只存本機）；opt-in。
    `src/lib/crypto.ts`＋`src/lib/sync.ts`＋`src/components/SyncDialog.tsx`；`TopNav.tsx` 加「同步」入口；
    隱私原則已於 §1 更新為「預設不上雲；可 opt-in 上使用者自己的加密備份到私人 Gist」。
  - **行程同日依時間排序＋時間/日期輸入失焦寫入**（T11，✅ 2026-07-07）：`groupItineraryByDate`
    組內排序改為 `time` 升冪（空 `time` 沉底）→ 同 `time` 或皆空退回 `sort`；`cells.tsx` 的 `TextLike`
    加 `commitOnBlur` prop，`TimeInput`／`DateInput` 固定 `true`，全 App 時間／日期欄改為失焦才寫入 DB，
    避開「編輯中列即時重排 → 輸入框失焦吃字」的 UI bug；`TextInput`／`NumberInput` 未動。
  - **行程列小計改外幣為主＋頁尾三數值總計**（T12，✅ 2026-07-07）：`money.ts` 新增
    `itineraryForeignSubtotal`（純函式，`round((transportCost||0)+(activityCost||0))`）；
    `ItineraryTab` 表頭 `小計(元)` 改 `小計({cur})`、每列小計改成同格兩行（主行外幣、下方灰字台幣）、
    頁尾原「交通＋花費小計」改用 `itineraryDaySubtotal(list, trip)` 顯示與當日標題同格式的
    `總計 X 小時 · {cur} Y · 台幣 Z`；不動 `itinerarySubtotal`／`itineraryTotal`／花費頁／備份。
  - **第二輪定案（2026-07-07，T11–T23，規格詳見 ISSUE_LIST.md）**：
    行程頁——同日依時間排序＋時間/日期輸入失焦寫入（T11 ✅）、列小計改外幣為主＋頁尾三數值總計（T12 ✅）、
    依旅程日期自動列出所有天數（顯示層補空日，T13）、移除付錢/分攤欄＋結算只彙整花費（T17 ✅ 2026-07-08）、
    起訖時間 `endTime`＋時數自動計算（T18）、逐日行程匯出文字（T22）；
    景點庫——類型加「住宿」「交通」（T14）、「已去過」單一標記（任何旅程參照過即 ✓，T15）、
    `AttractionPicker` 三段式「類型→都市→景點」＋國家完全鎖死（T16）；
    花費／總覽——「已結清」生效（結算排除，T19 ✅ 2026-07-08）、移除人數欄＋平均改用成員數
    （T20 ✅ 2026-07-08，解掉「平均人數 vs 分帳成員數」兩套來源的矛盾）；
    行李繼承上次旅程（T21）；匯入備份可選「取代／合併」（T23）。
  - **分帳成對淨額＋各幣別獨立結算**（T24，✅ 2026-07-08，與擁有者討論增補）：`settle()` 轉帳由
    最少筆數貪婪法改成對淨額（兩兩互欠對沖、可追溯，筆數可能較多——已拍板：直觀優先）；
    新增 `settleByCurrency` 按列幣別分桶獨立結算、不換匯、不跨幣別對沖，外幣列的台幣手續費入 TWD 桶；
    `SettlementTab` 一個幣別一個區塊。
  - **觀察中（未排程）**：行程頁直接新增景點；旅程日期整批平移；當日景點串 Google Maps 路線；
    總覽頁旅程摘要卡；花費分類統計；花費/行程頁窄螢幕卡片式檢視；Gist 上傳防覆蓋保護。
    **不做**：備份提醒；匯率 API 自動抓。
- **已知小限制**：
  - 分帳：**未設付錢者**或標「已結清」的列不列入結算；刪除成員後，參照它的列需重新指定。
    各幣別獨立結算（T24）——同一人可能同時在台幣區塊應收、外幣區塊應付，App 不做跨幣別對沖。
    （花費頁「平均」的分母自 T20 起＝分帳成員數，`trip.peopleCount` 已無 UI、僅為備份相容保留。）
  - CSV：「名稱只放在『地點』欄、而『景點』欄空白」的少數列（如 動物園、北海道神宮）匯入會被略過，需手動補。

## 10. 開發注意

- 開發在指定的功能分支進行；commit 後推送。**未經同意不要 push 到別的分支、不要開 PR。**
- **不要把使用者個人資料（例如景點 CSV）提交進這個 public repo**；測試請用合成樣本。
- 改動金額/匯入邏輯後務必 `npm run test`；改動 App 後 `npm run build` 應通過（含 `tsc --noEmit` 型別檢查）。
- 做 `ISSUE_LIST.md` 上的任務時：開工前先確認依賴任務已完成；完成後把該任務在**進度總覽表**的狀態改 ✅（加日期），並遵守其「共通守則」。
- **每次做完修改都要把「最新狀況」更新回本檔 CLAUDE.md**（例如「## 7. 已完成（截至目前）」或「## 9. 開發方向 / Roadmap」），讓文件與程式碼同步。
  此慣例由 `.claude/settings.json` 的 **Stop hook**（腳本 `.claude/hooks/remind-update-claude-md.sh`）自動把關：
  偵測到本回合有原始碼/檔案變更、卻沒有同時更新 CLAUDE.md 時，會在回合結束前提醒補上（同一回合只提醒一次）；
  `.claude/` 工具設定本身的變更不列入，純暫存/實驗等不需更新文件的情況，於回覆中說明原因即可放行。

## 11. 開發工作流自動化（`.claude/`）

- `.claude/settings.json`：專案層級 Claude Code 設定（**已進版控**，因遠端容器每次重新 clone，需 commit 才會在未來 session 持續生效）。
- `.claude/hooks/remind-update-claude-md.sh`：Stop hook 腳本，落實第 10 節「做完修改就更新 CLAUDE.md」的習慣。
- 要檢視／停用此 hook：在 Claude Code 內開 `/hooks`。
