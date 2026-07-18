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
| `ISSUE_LIST.md` | **開發任務清單**（進行中 T34–T39 的完整規格、依賴、驗收條件與進度表，關鍵新程式碼附參考實作供低階模型照抄；T1–T33 已完成歸檔，完成摘要見本檔 §7） |
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
| `src/lib/visited.ts` | T15 已去過推導：`visitedAttractionIds`（純，收集全庫 itinerary 非空 `attractionId` 為 Set） |
| `src/lib/exportItinerary.ts` | T22 逐日行程匯出文字：`itineraryToText`（純，接 trip / groups / attractions，回傳可貼通訊軟體的多行純文字，不含金額；空日組跳過） |
| `src/lib/link.ts` | T35 連結欄字串編解碼：`parseLink`／`serializeLink`／`linkDisplayText`（純，支援 `[名稱](網址)` 與裸網址、名稱含 `]`／網址含 `()` 皆保留、空字串合法） |
| `src/components/LinkField.tsx` | T35 連結欄顯示＋popover 編輯：可點超連結（新分頁 noopener）＋✎ 開兩欄「名稱／連結」，儲存時 `serializeLink` 寫回單一字串；popover 手法照抄 `ParticipantsPicker` |
| `src/lib/group.ts` | `groupByLocation`（依 國家／都市／區域 分組，回傳 `{country, city, district, label, list}`）＋ `buildLocationTree`（T4 三層樹：`CountryNode`/`CityNode`/`DistrictNode`，未分類置頂）＋ `getLocationOptions`（級聯篩選選項）＋ `SEP` |
| `src/lib/currency.ts` | `COUNTRY_CURRENCY`（國家→幣別/名稱）＋ `DEFAULT_RATES`（對台幣首次預設匯率）＋ `pickExchangeRate`（優先取其他旅程最新使用過的匯率） |
| `src/lib/id.ts` | `newId`（`crypto.randomUUID`）/ `now` |
| `src/App.tsx` | HashRouter + 版面；路由 `/`、`/trip/:id`、`/attractions` |
| `src/components/TopNav.tsx` | 上方導覽 + 匯出/匯入備份 |
| `src/components/cells.tsx` | 共用輸入元件（`TextInput`/`NumberInput`/`Select`/`Th`/`Td`…，**聚焦緩衝**式） |
| `src/components/AttractionPicker.tsx` | 行程用的景點三段式選擇器（T16 類型／都市內建篩選、國家由旅程鎖死；optgroup label 隨篩選狀態自組；含「目前選取」保底 optgroup 讓 `<select>` 永不空白；T29 起輸出三個 `<Td>` 作為表格獨立欄位「類型／都市／景點」） |
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
- **ItineraryItem**：`tripId, date, time, endTime?, attractionId, activity, hours, transportCost, activityCost, paidBy, payerId?, participantIds?, notes, link, sort`。`time`＝開始（HH:MM），`endTime?` 為結束（optional 相容舊資料）；兩者皆填且 `end > start` 時 `hours` 由 `hoursBetween` 自動帶入（可手動覆寫）。
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
- ✅ **T13 行程頁依旅程日期自動列出所有天數**（2026-07-08）：`src/lib/itinerary.ts` 新增
  export 純函式 `datesInRange(startDate, endDate)`（本地時區 `new Date(y, m-1, d)` 逐日 +1；
  只吃 `^\d{4}-\d{2}-\d{2}$`＋`startDate <= endDate`＋區間天數 ≤ 90，其餘一律回空陣列；
  非法日期如 `2026-02-30` 也擋掉——`new Date` 會自動修正月份，程式用 `getFullYear/Month/Date`
  比對輸入以偵測還原）；`groupItineraryByDate` 加第二參數 `range?: { startDate, endDate }`，
  傳入時對區間內每個「沒有任何行程列」的日期插入 `{ date, items: [] }` 空日組，
  區間**外**的日期組照常顯示、「未排日期」組照舊置底；不傳 `range` 行為與原本完全相同。
  `ItineraryTab.tsx` 呼叫改為 `groupItineraryByDate(list, { startDate: trip.startDate, endDate: trip.endDate })`；
  空狀態判斷由 `list.length === 0` 改為 `groups.length === 0`（補空日後 `list` 可能為空但 `groups` 非空）；
  `items.length === 0` 的空日組**不渲染表格與當日小計**，只渲染日期＋週幾標題與
  「＋在這天新增一列」按鈕（沿用 `addRow(g.date)` 預填該日 date）。DB／備份／`weekdayLabel` 皆未動；
  新增 7 條 `groupItineraryByDate + range` 測試（補空日、跨月＋區間外仍在、未排日期置底、
  倒序不補、格式不合不補、天數 > 90 不補、不傳 range 行為不變）＋5 條 `datesInRange` 測試
  （單日、跨月、倒序、90 天上下限、非法日期）→ 全 102 綠。
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
- ✅ **T14 景點類型擴充「住宿」「交通」**（2026-07-08）：`src/types.ts` 的 `Attraction.type`
  聯集由 `'attraction' | 'food' | ''` 擴為 `'attraction' | 'food' | 'lodging' | 'transport' | ''`；
  同檔 export 共用常數 `ATTRACTION_TYPES`（`{ value, label }` 陣列，`as const`；四項對照
  景點/美食/住宿/交通），下拉選項與類型標籤都改由此常數 map，避免四處硬寫。
  `src/pages/Attractions.tsx` 三處類型 `<option>` 清單（新增列的類型、列上類型下拉、
  篩選列類型下拉）改用 `ATTRACTION_TYPES` map、兩處 state 型別（`newType`／`fType`）
  與各 `onChange` 的斷言統一改用 `Attraction['type']`；DedupePanel 內類型標籤由
  `a.type === 'food' ? '美食' : '景點'` 改查 `ATTRACTION_TYPES.find(...)?.label ?? '景點'`
  （查無仍顯示「景點」維持舊行為）。`src/components/AttractionPicker.tsx` `fType` state
  型別與類型選項同步擴充（同樣 map `ATTRACTION_TYPES`）。不動 Dexie 版（type 無索引，
  schemaless 直接接受新值）、不動 CSV 匯入（`importAttractions.ts` 仍只會產生
  `'attraction' | 'food'`）、不動備份格式；既有 90 綠測試不變。
- ✅ **T15 景點「已去過」標記**（2026-07-08）：新檔 `src/lib/visited.ts` 提供純函式
  `visitedAttractionIds(itinerary)`——收集所有 `attractionId !== ''` 成 Set（重複自動去重、
  空字串忽略；輸入型別最小化為 `Pick<ItineraryItem,'attractionId'>` 陣列，測試造資料方便）。
  `src/pages/Attractions.tsx` 沿用既有 `useLiveQuery(() => db.itinerary.toArray())`
  （T9 引入）以 `useMemo` 算出 `visitedIds`；`renderRows` 內名稱欄改為
  flex 容器＋`shrink-0` 綠色 ✓（`text-emerald-600`、`title="已排入行程（去過）"`），
  僅當 `visitedIds.has(a.id)` 才顯示。`src/components/AttractionPicker.tsx` 加
  optional prop `visitedIds?: Set<string>`（未傳＝完全不影響現有呼叫者），option
  文字組合改為 `stars + name + (visited ? ' ✓' : '')`。`src/components/trip/ItineraryTab.tsx`
  新增第二個 `useLiveQuery(() => db.itinerary.toArray(), [], [])`（**全庫**，
  與既有「當前旅程」查詢不同；資料量小、沿 T5 全掃慣例）並以 `useMemo` 算 Set，
  傳給每列 `AttractionPicker`。純推導、不加 schema 欄位／索引；判定是「任何」旅程
  參照過即算去過（不區分過去／未來旅程，與擁有者拍板一致）。＋3 條 `visited.test.ts`
  （基本、空清單、重複 id 去重＋空字串忽略）→ 全 105 綠。
- ✅ **T16 AttractionPicker 三段式改造（類型→都市→景點、國家鎖死）**（2026-07-10）：
  `src/components/AttractionPicker.tsx` 改版：Props 移除 `defaultCountry?`，改為必填
  `country: string`（旅程國家、過濾鎖定用）與 optional `defaultCity?: string`；`visitedIds?` prop 保留。
  版面第一行改為「類型＋都市」兩個小下拉（不再有國家下拉——已拍板國家完全鎖死、未分類景點無法從
  此下拉挑到，需先到景點庫用「未分類」節點批次補國家），第二行景點下拉。類型下拉沿用 `ATTRACTION_TYPES`；
  都市下拉：`country` 非空 → `getLocationOptions(attractions).citiesByCountry.get(country) ?? []`；
  `country` 空 → 全庫都市去重（`Set`）＋ `zh-Hant` 排序。過濾邏輯：`country` 非空 → 只留該國家，
  再套類型／都市；`country` 空 → 只套類型／都市。內部 state 初始化（`useState` 初值、只一次）：
  `fType` 一律 `''`；`fCity` 優先取「`value` 對應景點的 city」（避免已選他都市景點被藏起來的空白假象），
  否則若 `defaultCity` 存在於當前都市選項中 → `defaultCity`，皆否則 `''`。景點下拉 optgroup label 由
  parts 自組（`groupByLocation` 不動）：`fCity` 非空 → `g.district || '未分區'`；`fCity` 空且 `country`
  非空 → `[g.city, g.district].filter(Boolean).join(' · ') || '未分類'`；`country` 空 → 沿用 `g.label`。
  「目前選取」保底：`value` 非空但**不在**過濾後清單時，下拉最上方加 optgroup「目前選取」，內含該景點
  option（文字後綴其都市，例 `大阪城（大阪）`）；若 `value` 在 `attractions` 查無（孤兒參照）→
  option 文字為 `(景點已刪除)`——`<select>` 因此永不顯示空白。鎖定國家在景點庫沒有任何景點時：
  下拉放 disabled option「景點庫尚無此國家的景點」（另用 value `__nolist__` 避開既有 `—` 的 value=''）。
  `ItineraryTab.tsx` 呼叫改為 `country={trip.country ?? ''}` + `defaultCity={trip.city ?? ''}`；
  `visitedIds` 傳法不變。純推導、不動 `group.ts`／`getLocationOptions`／`OverviewTab`／DB／備份／
  既有測試（篩選狀態純 component state、不寫 DB）；全 110 綠。
- ✅ **T18 行程起訖時間（endTime＋時數自動計算）**（2026-07-08）：`src/types.ts` 的
  `ItineraryItem` 加 `endTime?: string`（optional 相容舊資料與舊備份、讀取處以 `?? ''` 容錯）；
  **不升 Dexie 版**（無索引欄位免升版，同 T2 加 `trip.country`）。`src/lib/itinerary.ts` 新增
  純函式 `hoursBetween(start, end)`（兩者皆為 `HH:MM` 且 `end > start` → 回 `round(hours, 2)`；
  跨夜／等時／格式不合／空值一律 `null`——刻意不處理跨夜，使用者自行填寫時數）。
  `ItineraryTab.tsx`：表頭「時間」拆成「開始」「結束」兩欄（各一個 `TimeInput`、`w-24`）；
  加 `updateStart(it, v)` 與 `updateEnd(it, v)` 小函式——各取「新值＋另一欄現存值」呼叫
  `hoursBetween`，非 `null` → patch 同時寫入 `{time|endTime, hours}`，`null` → 只寫時間欄位、
  `hours` 不動（時數欄仍可手動改，下次改時間若可計算會覆寫回來）。`addRow` 寫入 `endTime: ''`；
  空狀態 `colSpan` 由 11 → 12、表格 `min-w-[66rem]` 提升為 `min-w-[72rem]`（多一欄 `w-24`）。
  排序（T11 的 `groupItineraryByDate`）仍以 `time`（開始）為準、**不**把 `endTime` 加進排序鍵。
  備份格式自動相容（整物件序列化多欄位無縫接軌，`backup.ts` 不動）。＋5 條 `hoursBetween` 測試
  （整點、半小時、分鐘精度、跨夜/等時/倒序 null、格式/空值 null）→ 全 110 綠。
- ✅ **T21 行李清單繼承上次旅程**（2026-07-10）：`src/pages/TripList.tsx` 的 `addTrip` 改為
  `db.transaction('rw', db.trips, db.packing, ...)`：交易內先 `db.trips.orderBy('updatedAt').last()`
  取「最近更新的既有旅程」（新 trip 尚未寫入、不會撈到自己），再 `db.trips.add(trip)`；`prev` 存在時
  以 `db.packing.where('tripId').equals(prev.id).sortBy('sort')` 讀出舊行李清單，逐筆
  `{ ...p, id: newId(), tripId: 新trip.id, checked: false }`（沿用 item/quantity/notes/sort、
  勾選狀態一律歸零、id 一律換發避免鍵衝突）後 `bulkAdd`；`prevPacking.length === 0`（有旅程但沒行李）
  或無既有旅程（第一個旅程）皆跳過複製。凍結區只動 `TripList.tsx`（本任務明文允許寫入 packing 表），
  `PackingTab.tsx`、其他 packing 讀寫皆未動；不加「選擇來源旅程」的 UI、不複製花費／行程／成員。
  DB／schema／備份格式皆未動；既有 110 綠測試不變。
- ✅ **T22 逐日行程匯出文字（複製到剪貼簿）**（2026-07-10）：新檔 `src/lib/exportItinerary.ts` 提供純函式
  `itineraryToText(trip, groups, attractions)`——首行 `{name}（{startDate} ～ {endDate}）`
  （任一日期空 → 只輸出 `{name}`），每組空行分隔、標題 `■ {MM/DD}（{週X}）`（`MM/DD` 由
  `YYYY-MM-DD` 字串切片、週幾沿用 `weekdayLabel`；未排日期組標題 `■ 未排日期`），每列
  `{時間段} {標題}`——時間段 `time`+`endTime` 皆有 → `{time}–{endTime}`、只有 `time` → `{time}`、
  其他（含只有 `endTime`）省略；標題 `{景點名（attractionId 查表）}｜{activity}`，只有一者 → 該者、
  皆空 → `(未填)`；`notes` 非空 → 次行 `　備註：{notes}`；T13 補的空日組（`items` 為空）跳過不輸出。
  `ItineraryTab.tsx` 頁尾總計右側加「複製行程文字」按鈕：`navigator.clipboard.writeText(itineraryToText(...))`，
  成功時按鈕文字暫變「已複製 ✓」約 2 秒（比照 TopNav flash 手法，local `useState` + `setTimeout`）、
  失敗 `alert('複製失敗，請改用匯出備份')`。不含金額／付錢資訊；不做檔案下載；
  無格式選項。新增 6 條測試（完整旅程、任一日期空、`startDate` 有／`endDate` 空、時間/名稱各種缺漏、
  未排日期組標題、孤兒 `attractionId` 視同無景點名）→ 全 116 綠。
- ✅ **T23 匯入備份可選「取代／合併」**（2026-07-10）：`src/components/TopNav.tsx` 的
  `handleImportFile` 由單段 confirm 改為兩段——第一段問「要以『合併』方式匯入嗎？」
  （附註：合併＝保留本機資料、同 id 以備份為準；本機已刪除但備份仍有的資料會被加回；
  按「取消」改問是否「取代」）→ 確定 ⇒ `importAll(data, 'merge')`＋flash「匯入完成（合併）」；
  取消後第二段問「改以『取代』匯入？將清空本機所有資料、完全以備份內容取代。」→ 確定
  ⇒ `importAll(data, 'replace')`＋flash「匯入完成（取代）」；再取消 ⇒ 中止（不 flash）。
  `src/components/SyncDialog.tsx` 的 `handleDownload` 同樣改兩段：第一段仍顯示雲端匯出時間／
  本機最後更新時間＋合併說明，確定 ⇒ merge＋setMsg「已從雲端還原備份（合併）」；取消後
  第二段（時間戳資訊保留）問「改以『取代』下載？將清空本機所有資料、完全以雲端內容取代。」→
  確定 ⇒ replace＋setMsg「已從雲端還原備份（取代）」；再取消 ⇒ 中止。`src/lib/backup.ts`
  未動（`importAll` 早已支援 `'merge'` 語意——`bulkPut` 覆蓋同 id、非 `replace` 模式不 `clear`
  本機獨有的資料）；上傳流程未動；無新測試（純 UI 兩段 confirm 分支）。全 116 綠、build 通過。
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
- ✅ **T25 同步小修：下載按鈕文字＋備份 version 升 5**（2026-07-13）：`src/components/SyncDialog.tsx`
  下載按鈕文字「下載（Gist→取代本機）」改為「下載（Gist→本機）」——T23 後下載流程先問合併、
  取消才問取代，原按鈕文字是 T10 殘留、與實際行為不符；`src/lib/backup.ts` 的 `exportAll` `version: 4`
  改 `version: 5`，對齊 Dexie schema v5（T1 購物併入花費）。`importAll` 未動，仍依欄位形狀
  正規化、不看版本號，舊備份（version 4 甚至更早）匯入行為完全不變。無新測試（純文件性小修）；
  既有 116 綠、build 通過。
- ✅ **T27 時間輸入改 24 小時制純文字（失焦正規化）**（2026-07-14）：`src/lib/itinerary.ts`
  新增純函式 `normalizeTimeText(raw: string): string | null`——`trim` 後為空回 `''`（合法清空）；
  `H`／`HH` 視整點補 `:00`；`Hmm`（三位純數字）首位時後兩位分；`HHmm`（四位）前二時後二分；
  `H:MM`／`HH:MM` 時補零。皆需 `0<=時<=23`、`0<=分<=59`；不符或超界回 `null`。非 null 回傳
  必為 `''` 或 `HH:MM`，與 `groupItineraryByDate` `localeCompare` 排序及 `hoursBetween` 的
  `^\d{2}:\d{2}$` 假設完全相容，DB 只會存這兩種形狀。`src/components/cells.tsx` 的 `TextLikeProps`
  加 `normalize?: (raw: string) => string | null` 與 `inputMode?: 'numeric'`（皆 optional、
  預設不影響現有呼叫者）；`onBlur`（`commitOnBlur` 模式）先跑 `normalize`：`null` → `setText(value)`
  恢復原值不寫回；否則 `setText(out)`、`out !== value` 才 `onChange(out)`。`TimeInput` 由
  `type="time"` 改為 `type="text"`＋`inputMode="numeric"`＋`placeholder="HH:MM"`＋固定
  `normalize={normalizeTimeText}`＋`commitOnBlur`；固定 prop 寫在 `{...p}` 展開之後（後者覆蓋），
  `Omit` 型別清單一併加上 `normalize | inputMode | placeholder` 避免呼叫者誤覆寫；`TextInput`／
  `DateInput`／`NumberInput` 未動。欄寬：`ItineraryTab.tsx` 開始／結束欄 `w-24 → w-16`、
  `ExpensesTab.tsx` 時間欄 `w-24 → w-16`。放棄原生時間滾輪換取保證 24 小時制與窄欄寬（擁有者接受）；
  手機鍵盤改由 `inputMode="numeric"` 喚起純數字鍵盤。新增 9 條 `normalizeTimeText` 測試（空/整點/
  三位/四位/含冒號/HH:MM 原樣/超界 null/非數字 null/前後空白 trim）→ 全 125 綠、build 通過。
- ✅ **T26 Gist 上傳防覆蓋保護**（2026-07-14）：`src/lib/sync.ts` 的 `SyncBackend.write` 與
  `GistBackend.write` 回傳型別由 `Promise<void>` 改 `Promise<{ updatedAt: string }>`——PATCH
  成功後解析回應 JSON 的 `updated_at`（缺值回 `''`）；`read()` 未動（原本就回 `updatedAt`）。
  `src/components/SyncDialog.tsx` 的 `LS` 常數表加 `lastSyncedAt: 'tr.sync.lastSyncedAt'`；
  `handleUpload` 改為：先 `new GistBackend(token, gistId).read()`，`snap === null`／`content.trim()`
  為 `''`／`'{}'`（`createGist` 初始 placeholder）→ 視為雲端無備份、直接上傳、不 confirm；
  否則 `snap.updatedAt !== lastSyncedAt` → confirm「雲端備份最後更新：…\n本裝置上次同步：…\n\n
  雲端內容可能來自其他裝置，直接上傳將覆蓋它。仍要上傳？」（無紀錄顯示「（無紀錄）」、
  updatedAt 空顯示「（未知）」），取消 ⇒ 中止；相同 → 直接上傳。上傳成功後
  `localStorage.setItem(LS.lastSyncedAt, result.updatedAt)`。`handleDownload` 的 merge 與
  replace 兩個成功分支都補寫 `snap.updatedAt` 進 `lastSyncedAt`（讓下次上傳可正確對齊、不誤跳 confirm）。
  `read()` 拋錯落在既有 try/catch，顯示錯誤並自然中止上傳；token/passphrase 不進任何訊息。
  唯一 `write()` 呼叫者就是 SyncDialog，型別變更無其他破口。沙箱無法連 `api.github.com`（同 T10），
  真機驗證由擁有者完成；build 全綠、既有 116 綠測試不變。
- ✅ **T28 數字輸入移除上下箭頭（spinner）**（2026-07-15）：`src/index.css` 檔尾（既有 `body`
  規則之後）加全域規則：`input[type='number']::-webkit-outer-spin-button` 與
  `::-webkit-inner-spin-button` 設 `-webkit-appearance: none; margin: 0;`；
  `input[type='number']` 設 `-moz-appearance: textfield; appearance: textfield;`。
  Chromium／Safari 走 pseudo-element 隱藏（`margin:0` 順手清掉容器保留的空白）、Firefox 走
  `-moz-appearance`、其他瀏覽器走標準 `appearance`。`cells.tsx` 的 `NumberInput` 不動
  （仍 `type="number"`＋`inputMode="decimal"`，手機數字鍵盤與小數輸入行為完全不變）。
  純樣式變更、無邏輯改動、無新測試；既有 125 綠、build 通過。
- ✅ **T29 行程表欄位重組（移除活動欄＋景點三下拉拆欄）**（2026-07-15）：
  `src/components/AttractionPicker.tsx` 由回傳 `<div>` 內含兩行下拉，改為回傳 fragment
  含三個 `<Td>`：類型 `w-20`、都市 `w-24`、景點 `min-w-[14rem]`；三個 `Select` 各佔一格
  （原內建的 `text-xs py-0.5` 緊湊樣式移除、`className` 全數移除，由外層 `Td` 提供欄寬），
  `Td` 由 `./cells` 一併 import。內部 state（`fType`／`fCity`）、過濾邏輯、optgroup label
  自組（`groupLabel`）、「目前選取」保底 optgroup、`countryHasNothing` disabled option
  （`__nolist__`）、★／✓ 前綴、`visitedIds`、`defaultCity` 初始化——T16 的行為全部不變，
  純版面容器改變；Props 介面完全不動。`src/components/trip/ItineraryTab.tsx`：`renderRow`
  的原「景點」`<Td>` 包裹拆掉，`<AttractionPicker ...>` 直接放在 `<tr>` 之下（picker 自
  帶三個 `<Td>`；React fragment 是合法的 `<tr>` 子內容）；「行程／活動」`<Td>`（含
  `TextInput`）整段移除，`addRow` **仍寫入** `activity: ''`（型別必填、備份相容）。
  `renderHead` 的 `<Th>景點</Th>` 拆為 `<Th>類型</Th><Th>都市</Th><Th>景點</Th>`；
  `<Th>行程／活動</Th>` 一併移除。空狀態 `colSpan` 12 → 13、兩處 `min-w-[72rem]` → `min-w-[74rem]`。
  不動 `types.ts`（`activity` 欄位保留）／`exportItinerary.ts`（舊資料的 activity 文字在
  「複製行程文字」輸出中仍可見）／`orphanItinerary` 健檢面板／DB／備份／既有測試。
  全 125 綠、build 通過。
- ✅ **T32 花費頁手機卡片式檢視**（2026-07-15）：`src/components/trip/ExpensesTab.tsx` 沿用 T31 模式：
  新增 `expandedIds: Set<string>` state ＋ `toggleExpand(id)`，`addRow` 於 `db.expenses.add(row)`
  之後把 `row.id` 加入 `expandedIds`，手機端新增卡片即自動展開；`renderRow` 由原本內嵌整段 `<tr>`
  抽成函式（表格版 markup 完全不動）；新增 `renderCard(it)`——摘要行：日期（空→灰字 `--`）＋
  品項（空→灰字 `(未填)`，`flex-1 truncate`）＋右側金額 `{currency} {fmt(amount)}`（`amount === 0`
  顯示空白）＋展開三角（`▼`／`▲`）；點卡片本體 toggle（`aria-expanded` 綁定）。展開後直向表單：
  日期／時間 兩欄 grid、項目、幣別／金額 兩欄 grid、手續費(元)、右對齊小計顯示、付錢／分攤 兩欄
  grid（`MemberSelect`／`ParticipantsPicker` 元件不動——僅擺放位置改變，不屬凍結區解凍範圍）、
  狀態、備註、右下角 `✕ 刪除這列`。所有欄位元件沿用 `cells.tsx`，無新業務邏輯，`update`／`remove`
  與桌面共用。斷點：Tailwind `sm`（640px）——原 `<div className="overflow-x-auto rounded-lg border bg-white">`
  拆為外層 `rounded-lg border bg-white` 容器＋內層桌面 `hidden overflow-x-auto sm:block`（原表格）
  ＋內層手機 `divide-y sm:hidden`（新卡片群）；空狀態雙容器（桌面 `<tr colSpan={12}>`＋手機置中文字）
  避免手機被 `min-w-[68rem]` 撐出橫向捲動。頁尾「＋新增一列」與總計／平均照舊。局部元件 `CardField`
  （`w-16` 標籤＋`flex-1` 欄位，比 T31 的 `w-14` 稍寬容納「手續費(元)」四字）擺 `ExpensesTab.tsx` 檔尾。
  無 schema／`src/lib` 純函式變動——純 UI 任務；`SettlementTab`／`settle()`／金額計算完全不動；
  分帳頁台幣換算即時更新照常（`useLiveQuery` 未改）。全 125 綠、build 通過。
- ✅ **T31 行程頁手機卡片式檢視**（2026-07-15）：`src/components/AttractionPicker.tsx` 加 optional
  prop `variant?: 'cells' | 'stack'`（預設 `'cells'`＝T29 的三個 `<Td>`、桌面表格呼叫端不用改）；
  三個 `<Select>`（類型／都市／景點）抽成 local const（`typeSelect`／`citySelect`／`attractionSelect`），
  `'cells'` 分支照舊回傳 fragment 包三個 `<Td>`，`'stack'` 分支回傳直向排列的三個附標籤 select
  （新 local 元件 `StackField`：`w-14` 左側標籤＋`flex-1` 欄位、`space-y-1.5`）；
  內部 state／過濾邏輯／optgroup label 自組／「目前選取」保底／★／✓ 前綴／`countryHasNothing`
  disabled option 全部只寫一份，`variant` 只切最外層容器；Props 其餘介面不動。
  `src/components/trip/ItineraryTab.tsx` 新增 `expandedIds: Set<string>` state（預設空、卡片預設收合）
  ＋ `toggleExpand(id)`；`addRow` 於 `db.itinerary.add(row)` 之後把 `row.id` 加入 `expandedIds`，
  新增列後手機端自動展開該卡片。新增 `renderCard(it)`——摘要行：`timeSummary(it)`（皆空 → 灰字 `--:--`、
  只有 start／end → 該值、皆有 → `start–end`）＋景點名（`attractionName(id)` 查表：無 id → 灰字
  「(未選景點)」、查無 → 「(景點已刪除)」）＋右側時數/外幣小計（皆非零才顯示中點分隔）＋展開三角
  （`▼`／`▲`）；點擊卡片本體 toggle（`aria-expanded` 綁定）。展開後直向表單：日期、開始／結束
  兩欄 grid、`AttractionPicker` `variant="stack"`、時數、交通／花費 兩欄 grid、右對齊外幣小計＋
  灰字台幣、備註、連結（含 ↗）、右下角 `✕ 刪除這列`。欄位元件一律沿用 `cells.tsx`
  （`TextInput`／`DateInput`／`TimeInput`／`NumberInput`），無新業務邏輯、`update`／`remove`／
  `updateStart`／`updateEnd` 全與桌面共用。斷點：Tailwind `sm`（640px）——每個群組容器內原
  `<div className="overflow-x-auto">` 改為 `hidden sm:block overflow-x-auto`（桌面表格）
  ＋新增 `<div className="divide-y sm:hidden">{g.items.map(renderCard)}</div>`（手機卡片）；
  逐日 header／當日小計／`＋新增` footer／空日組佈局兩種檢視共用。頂層 `groups.length === 0`
  空狀態亦拆雙容器（桌面表格＋手機置中文字）避免手機被 `min-w-[74rem]` 撐出橫向捲動；`renderRow`／
  `renderHead`／頁尾總計＋「複製行程文字」按鈕、`grandSub`／`handleCopy`／`useLiveQuery` 全未動。
  局部元件 `CardField`（`w-14` 標籤＋`flex-1` 欄位）擺 `ItineraryTab.tsx` 檔尾。
  無 schema／`src/lib` 純函式變動——純 UI 任務，`variant` 是元件層變化、不新增測試（既有 125 綠沿用）。
  build 通過、全 125 綠。
- ✅ **T33 健檢擴充：成員孤兒參照**（2026-07-15）：新檔 `src/lib/orphanMembers.ts` 提供純函式
  `findOrphanMemberRefs(expenses, members)`——以 members id 建 Set，逐筆花費列判斷：`payerId`
  非空且查無 → `orphanPayer: true`；`participantIds` 內查無的 id 收進 `orphanParticipantIds`；
  型別 `OrphanMemberRef = { expense, orphanPayer, orphanParticipantIds }`；`payerId === ''`／未設
  視為未指定不算孤兒，`participantIds` 為空／未設視為全體均分不算孤兒；兩者皆無問題的列不回傳、
  保留輸入順序。`src/pages/Attractions.tsx` 頂層加 `db.expenses`／`db.members` 兩個 `useLiveQuery`
  （全表，沿 T5 全掃慣例）；`HealthPanel` 型別擴充加 `expenses`／`members` prop，內容拆兩區塊
  「行程景點」（既有）與「成員參照」（新）——第二區塊鏡射既有版型，依 `expense.tripId` 分組列出
  日期／品項／問題描述（`describeMemberOrphan`：`orphanPayer` → 「付錢者已刪除」；
  `orphanParticipantIds.length > 0` → 「分攤含 N 位已刪成員」；兩者以「・」串接）＋「前往旅程」＋
  逐列「清除參照」按鈕。`clearMemberRef` 組 patch：`orphanPayer` → 加 `payerId: ''`；
  `orphanParticipantIds.length > 0` → 加 `participantIds: 原陣列過濾掉孤兒 id 後的結果`；
  沒問題的欄位不寫進 patch；最後單次 `db.expenses.update(id, patch)`。confirm 訊息提醒
  「清除後若分攤名單變為空，該列改為全體均分；付錢者清空後該列不列入結算。」；無問題顯示
  「無成員孤兒參照，資料一致。」。凍結區解凍範圍嚴守規格：讀 `db.members`、寫 `db.expenses`
  的 `payerId`／`participantIds`；`SettlementTab`／`settle()`／`MemberSelect`／`ParticipantsPicker`
  完全不動。＋7 條 `orphanMembers.test.ts`（無孤兒、payer 孤兒、participants 部分孤兒＋順序、
  payerId 空字串不算、participantIds 未設不算、payer＋participant 同時、輸入順序過濾）→ 全 132 綠、build 通過。
- ✅ **T30 旅程日期整批平移**（2026-07-15）：`src/lib/itinerary.ts` 新增純函式
  `shiftDateStr(date, days)`——`^\d{4}-\d{2}-\d{2}$`＋`Number.isInteger(days)`＋非法日期
  （如 `2026-02-30`）檢查通過才用本地時區 `new Date(y, m-1, d)`＋`setDate(getDate()+days)`
  重新格式化為 `YYYY-MM-DD`（`padStart`）；不合條件（含空字串、格式錯、`Number.NaN`／
  `Infinity`／`1.5` 等非整數）一律原字串返回。`src/components/trip/OverviewTab.tsx` 出發／
  回程日期 grid 下方加「平移日期」按鈕（`rounded border px-2.5 py-1.5 text-sm hover:bg-gray-50`
  比照全 App 小按鈕）＋灰字說明「機票改期時整趟平移 N 天（trip 起訖＋所有行程列日期；花費日期不動）」。
  `handleShiftDates` 流程：`window.prompt('整趟平移天數（正數延後、負數提前）')` → `Number.parseInt(raw, 10)`
  → `!Number.isInteger(days) || days === 0` ⇒ 中止；`db.itinerary.where('tripId').equals(trip.id).toArray()`
  取行程列、`.filter((it) => !!it.date).length` 得 N；`shiftDateStr` 預算新起訖後 confirm 摘要
  「出發：舊 → 新／回程：舊 → 新（未設者顯示「（未設）」）\n\n將同步平移 N 筆行程列日期
  （花費日期不變）。\n\n確定？」→ 取消 ⇒ 中止；確定 ⇒ `db.transaction('rw', db.trips, db.itinerary, ...)`
  更新 `trip.startDate`／`endDate`（非空者才寫進 patch、`updatedAt: now()` 沿用檔內既有 `update` 慣例）
  ＋`db.itinerary.where('tripId').equals(trip.id).modify` 對非空 `date` 呼叫 `shiftDateStr`
  （「未排日期」列 `date === ''` 不動）。花費列日期完全不動（付款日是歷史事實，已拍板）；
  不做跨旅程批次、不做日曆選擇器。T13 補的空日組隨新 `trip.startDate`／`endDate` 即時更新
  （`ItineraryTab` 的 `useLiveQuery` 已存在、`groupItineraryByDate` 的 `range` 參數已通過新起訖）。
  ＋10 條 `shiftDateStr` 測試（正數／負數同月、跨月 +N／-N、跨年 +N／-N、days 0 原字串、格式不合／
  空字串／非法日期原樣返回、`NaN`／`Infinity`／小數原樣返回）→ 全 142 綠、build 通過。
- ✅ **T34 電腦版時間欄寬修正（w-16 → w-20）**（2026-07-17）：T27 把時間欄改純文字時
  欄寬從 `w-24` 縮到 `w-16`（64px），扣掉 `Td` `px-1.5`／輸入框 `px-2`／邊框後文字區僅約 34px，
  `08:30` 五碼被截成「08:」。`src/components/trip/ItineraryTab.tsx` 的 `renderRow` 開始／結束
  兩個 `<Td className="w-16">` 改 `w-20`（80px、文字區約 50px 足以完整顯示五碼），表格
  `min-w-[74rem]` 兩處（空狀態表格與各日資料表格）改 `min-w-[76rem]`（兩欄各加 1rem）；
  `src/components/trip/ExpensesTab.tsx` 的 `renderRow` 時間欄 `<Td className="w-16">` 同樣
  改 `w-20`，桌面表格 `min-w-[68rem]` 改 `min-w-[69rem]`。手機卡片 `CardField` 版時間
  `TimeInput`（`flex-1` 不受欄寬限制）不動；`ExpensesTab` 檔尾 `CardField` 標籤 `w-16` 是
  卡片左側欄位標籤寬（不是時間欄）不動；`cells.tsx`／`normalizeTimeText`／輸入框內距皆不動。
  純樣式微調，無邏輯／schema 變動，無新測試；既有 142 綠、build 通過。
- ✅ **T35 連結超連結化：`[名稱](網址)` 解析＋LinkField 元件＋行程頁套用**（2026-07-17）：新檔
  `src/lib/link.ts` 提供三支純函式——`parseLink(raw)` trim 後跑 `^\[(.*)\]\((.*)\)$` 錨定貪婪正則
  （名稱含 `]`／網址含 `()` 皆完整保留，例維基百科 `Osaka_(city)`），符合且 group2 非空白 →
  `{text, url}`；否則整串當網址（`text: ''`）；空／全空白 → 兩者皆 `''`。`[名稱]()`（網址空）
  不視為合法格式、整串當網址處理。`serializeLink(text, url)`：兩者皆 trim，`u === ''` → `''`
  （名稱有值也一樣、與規格拍板一致：純文字備忘請用備註欄）；`t === ''` → 存裸網址；兩者皆有 →
  `[${t}](${u})`。`linkDisplayText(raw)`：有名稱回名稱、否則回完整網址、空回 `''`。
  新檔 `src/components/LinkField.tsx`：顯示狀態＝可點超連結（`<a target="_blank" rel="noopener noreferrer"
  onClick={e => e.stopPropagation()}` 避免摘要列展開；`p.text || p.url` 決定文字，`truncate`
  下溢隱藏）＋ ✎ 按鈕；點 ✎ 開 popover（`useRef`＋document `mousedown` listener 點外面關閉，
  手法照抄 `ParticipantsPicker.tsx`），內含兩個原生 `<input>`＋local state（不用 `cells.tsx`
  聚焦緩衝，因為按「儲存」才寫回、非即時寫入），`openEditor()` 以 `parseLink(value)` 拆回
  `text`／`url` 初始化；`save()` 呼叫 `serializeLink(text, url)` 後 `onChange`；「取消」不寫。
  popover 定位 `absolute right-0 top-full`（表格 `overflow-x-auto` 內左欄溢出的邊角情況可
  改 `left-0`——目前行程頁在最右側連結欄，沒問題）。
  `src/components/trip/ItineraryTab.tsx` 兩處套用：桌面 `renderRow` 的連結 `<Td className="w-40">`
  內層「`TextInput`＋↗ 按鈕」整組換 `<LinkField value={it.link} onChange={(v) => update(it.id, { link: v })} />`；
  手機 `renderCard` 展開表單的「連結」`CardField` 同樣換 LinkField。`addRow` 的 `link: ''`、
  型別、DB／備份／`exportItinerary.ts`（匯出文字目前不含連結，維持現狀）皆未動。
  ↗ 按鈕退役——文字本身即為可點超連結；資料層零遷移，舊備份的裸網址照常顯示（`parseLink`
  對非 `[](...)` 形狀直接視為網址）。＋13 條 `link.test.ts`（`parseLink` 6：基本／裸網址／空／
  網址含括號／`[名稱]()` 非法／前後 trim；`serializeLink` 4：基本／名稱空／網址空／roundtrip；
  `linkDisplayText` 3：有名稱／無名稱／空）→ 全 155 綠、build 通過。
- ✅ **T36 景點庫網址欄比照 LinkField**（2026-07-18）：`src/pages/Attractions.tsx` 景點列的
  網址 `<Td className="min-w-[10rem]">` 內層「`TextInput`＋↗ 按鈕（T7）」整組換成
  `<LinkField value={a.url} onChange={(v) => update(a.id, { url: v })} />`；DedupePanel 的
  網址差異顯示由 `{a.url || —}` 改為 `{linkDisplayText(a.url) || —}`——比對重複景點時顯示名稱
  或裸網址，不出現 `[名稱](網址)` 原始括號字串。imports 新增 `linkDisplayText`（自 `../lib/link`）
  與 `LinkField`（自 `../components/LinkField`）。**不動**：`importAttractions.ts`（CSV 匯入寫入
  的是裸網址、與 `parseLink` 相容）、`dedupeAttractions.ts` 的 `mergeAttractionFields`（url 是
  不透明字串、擇優邏輯照舊）、`AttractionPicker`（不顯示 url）、T7 名稱搜尋（比對 name/address/notes
  不含 url）；`Attraction` 型別／DB／備份／既有測試皆未動。全 155 綠、build 通過。
- ✅ **自動部署**：GitHub Actions → GitHub Pages。
- ✅ **單元測試 155 項**：`money`(23，含 `settle` 分帳＋T12 `itineraryForeignSubtotal`＋T24 成對淨額/`settleByCurrency`) + `csv`(5) + `importAttractions`(12) + `migrate`(5) + `currency`(5) + `itinerary`(48，T6 分組／週幾／當日小計 + T11 組內時間排序 + T13 range 補空日／`datesInRange` + T18 `hoursBetween` + T27 `normalizeTimeText` + T30 `shiftDateStr`) + `group`(7，T4 `buildLocationTree` + T7 組內 priority 排序) + `dedupeAttractions`(11，T8 `normalizeName`/`findDuplicateGroups`/`mergeAttractionFields`) + `orphanItinerary`(5，T9 `findOrphanItinerary`) + `orphanMembers`(7，T33 `findOrphanMemberRefs`) + `visited`(3，T15 `visitedAttractionIds`) + `exportItinerary`(6，T22 `itineraryToText`) + `link`(13，T35 `parseLink`/`serializeLink`/`linkDisplayText`) + `crypto`(5，T10 roundtrip／錯誤密語／salt+iv 隨機／envelope 欄位／壞 JSON)，`npm run test` 全綠。

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
**先讀本檔、再挑 ISSUE_LIST.md 的任務執行**。第一～三輪 T1–T33 已全數完成（規格歸檔，見 §7）；
現行為**第四輪 T34–T39**（2026-07-17 與擁有者討論定案並經互動示意頁確認，設計決定已拍板、勿重新設計；
規格以「較低階模型可直接接手」為基準撰寫，關鍵新程式碼附參考實作）。

- **範疇決策**：
  - **凍結（局部解凍）**（功能與資料保留、暫停開發）：分帳／成員、行李。
    **例外**：T17（結算不再計入行程）、T19（已結清生效）、T20（平均改用成員數）、T21（行李繼承）、
    T24（分帳成對淨額＋多幣別）與第三輪 T33（健檢擴充成員參照：讀 members、寫 expenses 的
    `payerId`／`participantIds`）可修改凍結區中各該任務規格明文點名的範圍，其餘仍勿動。
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
  - **行程頁依旅程日期自動列出所有天數**（T13，✅ 2026-07-08）：`src/lib/itinerary.ts` 新增
    `datesInRange`（本地時區逐日 +1，只吃 `^\d{4}-\d{2}-\d{2}$`＋`startDate <= endDate`＋≤ 90 天）；
    `groupItineraryByDate` 加第二參數 `range?: { startDate, endDate }`，傳入時對區間內
    沒有行程列的日期補 `{ date, items: [] }` 空日組（區間外照舊、未排日期組仍置底）。
    `ItineraryTab.tsx` 呼叫改為 `groupItineraryByDate(list, { startDate, endDate })`、
    空狀態判斷改依 `groups.length`、空日組只渲染標題＋「＋在這天新增一列」按鈕（不畫表格與小計）。
    DB／備份／`weekdayLabel` 皆未動。
  - **行程起訖時間（endTime＋時數自動計算）**（T18，✅ 2026-07-08）：`ItineraryItem` 加
    `endTime?: string`（optional 相容舊資料）；`src/lib/itinerary.ts` 新增純函式 `hoursBetween`
    （`HH:MM`＋`end > start` 才回 `round(hours, 2)`，跨夜/等時/格式不合/空值一律 `null`——
    刻意不處理跨夜）；`ItineraryTab.tsx` 時間欄拆「開始／結束」，任一欄失焦寫入時取新值＋
    另一欄現存值算 `hoursBetween`，非 null 同步 patch `hours`、null 只寫時間不動 hours（時數
    欄仍可手動改）；`addRow` 寫入 `endTime: ''`；空狀態 `colSpan` 11 → 12、表格 `min-w-[66rem]`
    → `min-w-[72rem]`。排序仍以 `time`（開始）為準、不動 Dexie 版、備份自動相容。
  - **第二輪定案（2026-07-07，T11–T23，規格詳見 ISSUE_LIST.md）**：
    行程頁——同日依時間排序＋時間/日期輸入失焦寫入（T11 ✅）、列小計改外幣為主＋頁尾三數值總計（T12 ✅）、
    依旅程日期自動列出所有天數（顯示層補空日，T13 ✅ 2026-07-08）、移除付錢/分攤欄＋結算只彙整花費（T17 ✅ 2026-07-08）、
    起訖時間 `endTime`＋時數自動計算（T18 ✅ 2026-07-08）、逐日行程匯出文字（T22 ✅ 2026-07-10）；
    景點庫——類型加「住宿」「交通」（T14 ✅ 2026-07-08）、「已去過」單一標記（任何旅程參照過即 ✓，T15 ✅ 2026-07-08）、
    `AttractionPicker` 三段式「類型→都市→景點」＋國家完全鎖死（T16 ✅ 2026-07-10）；
    花費／總覽——「已結清」生效（結算排除，T19 ✅ 2026-07-08）、移除人數欄＋平均改用成員數
    （T20 ✅ 2026-07-08，解掉「平均人數 vs 分帳成員數」兩套來源的矛盾）；
    行李繼承上次旅程（T21 ✅ 2026-07-10，`TripList.addTrip` 在同一 transaction 內把「最近更新的既有旅程」
    的 packing 全複製為新旅程的行李、勾選狀態歸零、id 換發；無既有旅程或行李為空則跳過）；
    匯入備份可選「取代／合併」（T23 ✅ 2026-07-10，`TopNav.handleImportFile` 與 `SyncDialog.handleDownload`
    改兩段 confirm：先問合併、取消再問取代、再取消才中止；flash/setMsg 訊息帶模式；`backup.ts`／`importAll`
    與上傳流程未動）。
  - **分帳成對淨額＋各幣別獨立結算**（T24，✅ 2026-07-08，與擁有者討論增補）：`settle()` 轉帳由
    最少筆數貪婪法改成對淨額（兩兩互欠對沖、可追溯，筆數可能較多——已拍板：直觀優先）；
    新增 `settleByCurrency` 按列幣別分桶獨立結算、不換匯、不跨幣別對沖，外幣列的台幣手續費入 TWD 桶；
    `SettlementTab` 一個幣別一個區塊。
  - **第三輪定案（2026-07-12，T25–T33，規格詳見 ISSUE_LIST.md）**：
    同步——SyncDialog 下載按鈕文字修正＋備份 `version` 升 5（T25 ✅ 2026-07-13）、Gist 上傳防覆蓋保護
    （上傳前 `read()` 比對雲端 `updated_at` 與本機 `tr.sync.lastSyncedAt`，不同即 confirm；
    雲端無備份、或內容為空／`{}` 直接上傳；上傳／下載成功皆更新 lastSyncedAt；T26 ✅ 2026-07-14）；
    輸入元件——時間輸入改 24 小時制純文字＋失焦正規化（`930`→`09:30`；已拍板放棄原生時間
    滾輪換取保證 24h 與窄欄寬，T27 ✅ 2026-07-14）、數字輸入以全域 CSS 隱藏上下箭頭（T28 ✅ 2026-07-15）；
    行程頁——移除「行程／活動」欄＋AttractionPicker 三下拉（類型／都市／景點）拆成獨立表格欄
    （已拍板：`activity` 資料欄位保留、T22 匯出對舊資料照常輸出，僅 UI 移除；T29 ✅ 2026-07-15）、
    旅程日期整批平移（trip 起訖＋行程列日期；花費日期不動——付款日是歷史事實；T30 ✅ 2026-07-15，
    `src/lib/itinerary.ts` 新增純函式 `shiftDateStr(date, days)`、`OverviewTab.tsx` 加「平移日期」
    按鈕以 `prompt`+`confirm` 觸發 `db.transaction('rw', db.trips, db.itinerary, ...)` 一次更新
    trip 起訖與該旅程所有非空 itinerary `date`）；
    **手機卡片式檢視（本輪重點投資，擁有者特別強調）**——行程頁先行（T31 ✅ 2026-07-15，
    `AttractionPicker` 加 `variant?: 'cells' | 'stack'` prop、`ItineraryTab` 加 `expandedIds`
    state＋ `renderCard`；`sm` 以下卡片、桌面表格保留、邏輯共用不複製）、花費頁接續（T32 ✅ 2026-07-15，
    沿用 T31 模式，`ExpensesTab.tsx` 新增 `expandedIds`／`toggleExpand`／`renderCard`、
    `renderRow` 抽函式、表格外容器拆桌面／手機雙渲染，`MemberSelect`／`ParticipantsPicker` 元件不動）；
    健檢擴充成員孤兒參照（T33 ✅ 2026-07-15，`src/lib/orphanMembers.ts` 提供 `findOrphanMemberRefs`
    純函式，`Attractions.tsx` 的 `HealthPanel` 新增第二區塊「成員參照」，逐列「清除參照」按鈕依
    `orphanPayer`／`orphanParticipantIds` 組 patch 更新 `db.expenses`；凍結區解凍範圍嚴守規格）。
  - **第四輪定案（2026-07-17，T34–T39，規格詳見 ISSUE_LIST.md）**：
    小修——電腦版時間欄寬修正（T27 縮過頭致 `08:30` 被截斷，`w-16` → `w-20`；T34 ✅ 2026-07-17）；
    **連結超連結化**——`ItineraryItem.link` 沿用單一字串但支援 `[名稱](網址)` 編碼
    （新 `src/lib/link.ts`：`parseLink`／`serializeLink`／`linkDisplayText` 純函式；
    新 `src/components/LinkField.tsx`：顯示可點超連結＋✎ popover 兩欄「名稱／連結」編輯，
    使用者不手打括號；網址空＝儲存清空整欄；不加欄位、不升 Dexie、備份零改動；↗ 按鈕退役；
    T35 行程頁 ✅ 2026-07-17（`ItineraryTab.tsx` 桌面 `renderRow` 連結 `<Td>` 與手機 `renderCard`
    的「連結」`CardField` 兩處都換 LinkField、原 ↗ 按鈕移除）；T36 景點庫網址欄比照 ✅ 2026-07-18
    （`Attractions.tsx` 景點列的網址欄換 LinkField、DedupePanel 網址顯示改 `linkDisplayText`）；
    行程手機卡片摘要改版（收合不再顯示時數／金額，改「時間＋景點名＋可點連結＋▼」＋
    第二行灰字備註；金額只在展開後；摘要列因內含 `<a>` 改 `div role="button"`；T37）；
    **分帳／行李凍結區局部解凍（版面層）**——分帳頁同行者手機卡片（收合只顯示中英名
    「姓名＋護照名」）＋結餘表手機拿掉 `min-w` 自然壓縮＋護照名 placeholder「LIN,LIWEN」移除
    （T38，`settle`／彙整迴圈／`MemberSelect`／`ParticipantsPicker` 不動）；
    行李頁手機卡片（已拍板互動分工：**勾選框收合直接可點打勾（stopPropagation）、
    點列其他處展開編輯**；T39）。
  - **觀察中（未排程）**：行程頁直接新增景點；當日景點串 Google Maps 路線；
    總覽頁旅程摘要卡；花費分類統計；T22 匯出文字輸出連結（T35 後可行、未決定）。
    **不做**：備份提醒；匯率 API 自動抓；連結欄自動抓網頁標題（跨域抓不到）。
- **已知小限制**：
  - 分帳：**未設付錢者**或標「已結清」的列不列入結算；刪除成員後，參照它的列需重新指定
    （T33 起可在景點庫「健檢」→「成員參照」一鍵清除孤兒參照）。
    各幣別獨立結算（T24）——同一人可能同時在台幣區塊應收、外幣區塊應付，App 不做跨幣別對沖。
    （花費頁「平均」的分母自 T20 起＝分帳成員數，`trip.peopleCount` 已無 UI、僅為備份相容保留。）
  - CSV：「名稱只放在『地點』欄、而『景點』欄空白」的少數列（如 動物園、北海道神宮）匯入會被略過，需手動補。

## 10. 開發注意

- 開發在指定的功能分支進行；commit 後推送。**未經同意不要 push 到別的分支、不要開 PR。**
- **Git commit message 一律用繁體中文撰寫**，讓維護者一眼看出這個 commit 做了什麼；
  技術名詞（函式名、檔名、套件名、指令、型別、CLI flag 等）保留英文原樣。
  第一行為簡短標題（建議 50 字內、不加句號），需要細節時空一行再寫本文說明「為什麼」而非「做了什麼」。
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
