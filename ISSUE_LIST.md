# ISSUE_LIST.md — 開發任務清單

> 2026-07 與專案擁有者討論收斂出的開發計畫，拆成自足任務供後續 session 逐項接手
> （接手者可能是較低階模型，因此每個任務都寫明目標、已拍板的設計決定、涉及檔案與驗收條件，
> **請勿重新發明設計**；規格沒寫到的細節以 CLAUDE.md 慣例與現有程式風格為準）。

## 使用方式

1. **開工前必讀 `CLAUDE.md`**（專案架構、慣例、部署眉角都在那）。
2. 一個 session 建議只做一個任務；先確認「依賴」欄的前置任務已完成。
3. 完成後：`npm run test` 與 `npm run build` 必須全綠 → 更新本檔進度表（狀態改 ✅ 加日期）→
   更新 CLAUDE.md §7／§9 → commit（訊息含任務編號，例 `feat(T3): ...`）→ push 到該 session 指定的分支。
4. 難度 ★★★★ 的任務建議由較強模型執行，或拆多個 session（先純函式庫、後 UI）。

## 進度總覽

| # | 任務 | 優先 | 難度 | 依賴 | 狀態 |
|---|------|------|------|------|------|
| T1 | 購物併入花費、移除購物分頁 | P1 | ★★ | 無 | ✅ 2026-07-06 |
| T2 | 總覽頁：地點下拉＋幣別/匯率自動帶入 | P1 | ★★ | 無 | ✅ 2026-07-06 |
| T3 | 行程景點下拉依旅程國家預選 | P1 | ★ | T2 | ☐ 未開始 |
| T6 | 行程逐日檢視 | P1 | ★★ | 無 | ☐ 未開始 |
| T4 | 景點庫樹狀階層＋節點批次編輯 | P2 | ★★★ | 無 | ☐ 未開始 |
| T5 | 景點刪除防護 | P2 | ★ | 無 | ☐ 未開始 |
| T7 | 小型 UX 三件組（開網址／名稱搜尋／優先度星星） | P2 | ★ | 建議 T4 後 | ☐ 未開始 |
| T8 | 重複景點合併工具 | P3 | ★★★ | 建議 T5 後 | ☐ 未開始 |
| T9 | 孤兒參照健檢 | P3 | ★★ | 建議 T5/T8 後 | ☐ 未開始 |
| T10 | Gist 加密同步（手動上傳/下載） | P3 | ★★★★ | 無 | ☐ 未開始 |

## 共通守則（每個任務都適用）

- **凍結區勿動**：分帳（`SettlementTab.tsx`、`money.ts` 的 `settle`）、成員（`MemberSelect.tsx`、members 表）、
  分攤（`ParticipantsPicker.tsx`）、行李（`PackingTab.tsx`）——除非任務規格明說，否則不要修改；
  型別編譯錯誤時做最小修正即可。
- 新表單欄位一律沿用 `src/components/cells.tsx` 的聚焦緩衝元件（原因見 CLAUDE.md §6）。
- 可測試的邏輯寫成 `src/lib/` 純函式＋ Vitest 測試；UI 檔案只留組裝與 DB 呼叫。
- Dexie 目前 schema 版本為 **v4**；**只有 T1 升到 v5**。新增「無索引」欄位不需要升版
  （Dexie 物件是 schemaless，索引才需要宣告）。
- 個人資料（真實景點 CSV、護照號碼等）不得進 repo；測試用合成樣本。
- 純文件 commit 訊息加 `[skip ci]`。

---

## T1 購物併入花費、移除購物分頁（P1・★★・依賴：無）

**背景／目標**：購物與花費定位重複，決議只留「花費」（保留付錢者/分攤欄位作為未來分帳空間）。
既有購物資料一次性搬進花費表（備註標示來源），購物分頁移除。

**規格**：
1. 新檔 `src/lib/migrate.ts`：純函式
   `shoppingToExpense(s: ShoppingItem, sort: number): ExpenseItem`
   - 欄位對應：`tripId/date/time/item/currency/amount/fee/payerId/participantIds` 原樣；
     `paid: false`、`paidBy: ''`、`paymentStatus: ''`。
   - `notes`：前綴 `[購物]`（原 notes 空 → `'[購物]'`；非空 → `'[購物] ' + notes`）。
   - **`id` 沿用原 ShoppingItem 的 id**（重跑不會產生重複列，冪等）。
   - `sort` 由呼叫端給：同一 trip 內接在既有花費之後
     （sortBase = 該 trip 現有花費最大 sort + 1，購物列先依原 sort 排序後依序 +1）。
2. `src/db/db.ts` 加 **version(5)**：`stores` 與 v4 完全相同（**保留 shopping 表定義**，
   舊備份匯入與凍結程式碼仍會引用），`upgrade` 內把 shopping 全表依上述函式轉入 expenses 後清空 shopping。
3. `src/lib/backup.ts` 的 `importAll`：`data.shopping`（舊備份會有）同樣轉成 expenses 寫入
   （replace/merge 模式皆是；沿用原 id 保冪等），不再寫入 shopping 表。`exportAll` 照舊輸出
   `shopping` 欄位（此後恆為空陣列），JSON 格式不變。
4. UI：`TripDetail.tsx` 移除「購物」分頁；刪除 `src/components/trip/ShoppingTab.tsx`；
   `TripList.tsx` 刪旅程時的 shopping 連帶清理**保留**（表還在）。
5. 凍結區注意：`SettlementTab` 有讀 shopping——遷移後該表恆空、計算仍正確，**不需要改**。

**測試**：`shoppingToExpense` 欄位對應、notes 前綴（空/非空兩案）、id 沿用、sort 接續。

**驗收**：`npm run dev` 手動驗證——含購物資料的舊庫升級後，購物列出現在花費頁且備註帶 `[購物]`、
購物分頁消失；匯入含 shopping 的舊 JSON 也轉入花費。test/build 全綠。

---

## T2 總覽頁：地點下拉＋幣別/匯率自動帶入（P1・★★・依賴：無）

**背景／目標**：總覽頁「地點/地區」自由文字欄改為連動景點庫的「國家／都市」下拉；
選國家自動帶幣別與匯率，三者皆可手動改。

**規格**：
1. `src/types.ts`：`Trip` 加 `country: string` 與 `city: string`。
   **不升 Dexie 版本**（無索引）；所有讀取處以 `trip.country ?? ''` 容錯舊資料。
   舊 `region` 欄位與資料保留不刪（備份相容）。
2. 新檔 `src/lib/currency.ts`：
   - `COUNTRY_CURRENCY: Record<string, { code: string; label: string }>`，至少含：
     日本 JPY 日元、韓國 KRW 韓元、泰國 THB 泰銖、越南 VND 越南盾、新加坡 SGD 新加坡幣、
     馬來西亞 MYR 令吉、印尼 IDR 印尼盾、菲律賓 PHP 披索、中國 CNY 人民幣、香港 HKD 港幣、
     澳門 MOP 澳門幣、美國 USD 美元、英國 GBP 英鎊、法國/德國/義大利/西班牙/荷蘭 EUR 歐元、
     澳洲 AUD 澳幣、紐西蘭 NZD 紐幣、台灣 TWD 台幣。
   - `DEFAULT_RATES: Record<string, number>`：對台幣參考匯率（只當第一次的預設值，過時無妨），
     例：JPY 0.21、KRW 0.023、USD 31、EUR 34、GBP 39、THB 0.9、HKD 4.0、CNY 4.3、SGD 23、
     AUD 20、NZD 18、MYR 7、PHP 0.55、VND 0.0012、IDR 0.002、MOP 3.9、TWD 1。
   - `pickExchangeRate(trips: Trip[], code: string, excludeTripId: string): number | undefined`：
     在**其他**旅程中找 `currencyCode === code` 且 `exchangeRate > 0`、`updatedAt` 最新者回傳其匯率
     （優先沿用使用者實際用過的數字）；沒有 → `DEFAULT_RATES[code]`；再沒有 → `undefined`（呼叫端不改值）。
3. `OverviewTab.tsx`：
   - 移除「地點/地區」欄，改為「國家」「都市」兩個 input＋datalist
     （寫法比照 `Attractions.tsx` 篩選列；選項用 `getLocationOptions(attractions)`，
     attractions 以 `useLiveQuery` 讀全庫；選了國家後都市選項連動，換國家時清空都市）。
     可自由輸入清單外的值（新目的地還沒建景點時得打得進去）。
   - 舊 `region` 有值且 `country` 空時，欄位下方顯示一行灰字「舊地區欄：{region}」供參考。
   - 國家值改變時：查 `COUNTRY_CURRENCY`，命中則寫入 `currencyCode`/`currencyLabel`，
     並以 `pickExchangeRate` 結果寫 `exchangeRate`（`undefined` 則不動）；TWD 的匯率一律設 1。
     三個欄位照舊可手動修改。

**測試**：`pickExchangeRate`——取最新同幣別、排除自身旅程、fallback 到 DEFAULT_RATES、查無回 undefined。

**驗收**：手動驗證選「日本」自動帶 JPY/日元＋匯率、可手改；test/build 全綠。

---

## T3 行程景點下拉依旅程國家預選（P1・★・依賴：T2）

**規格**：`AttractionPicker.tsx` 加 prop `defaultCountry?: string`，內部「國家篩選」state 以它初始化
（僅初始化，使用者可改回「全部」）；`ItineraryTab.tsx` 傳入 `trip.country`。
若該國家在景點庫沒有景點，顯示空清單即可（篩選仍可切回全部）。

**驗收**：手動驗證（無純邏輯可測）；build 綠。

---

## T4 景點庫樹狀階層＋節點批次編輯（P2・★★★・依賴：無，建議在 T7 前）

**背景／目標**：景點庫由「平面分組表」改為 國家→都市→區域 樹狀顯示（可摺疊），
並在節點上提供批次編輯——這同時是「CSV 匯入後批次補國家」的工作介面
（匯入固定把 country 留空，見 `importAttractions.ts`）。

**規格**：
1. `src/lib/group.ts` 加純函式 `buildLocationTree(attractions: Attraction[]): CountryNode[]`：
   - `CountryNode { country: string; count: number; cities: CityNode[] }`
   - `CityNode { city: string; count: number; direct: Attraction[]; districts: DistrictNode[] }`
     （`direct`＝district 為空的列）
   - `DistrictNode { district: string; list: Attraction[] }`
   - 排序沿用 `localeCompare(..., 'zh-Hant')`；`country === ''` 的節點保留，UI 顯示「未分類」並**置頂**。
2. `Attractions.tsx` 改為樹狀渲染：國家節點（預設展開）→ 都市節點（預設摺疊、標題顯示筆數）→
   區域節點 → 景點表格列。摺疊狀態放 component state 即可。既有篩選列**保留**（先篩選後建樹）。
3. 節點「編輯」動作（要有確認步驟）：
   - 國家節點：改國家名 → 子樹所有列 update `country`。
   - 都市節點：可改 國家＋都市 → 子樹所有列 update。
   - 區域節點：可改 國家＋都市＋區域。
   - 批次更新用 `db.attractions.where('id').anyOf(ids).modify(...)` 或 toArray＋bulkPut。
   - 「未分類」節點的編輯＝批次補國家。
4. 景點列**移除** 國家/都市/區域 三欄（位置改由樹決定），新增「搬移」動作：
   popover 三個輸入（datalist 帶現有選項）預填現值，儲存後更新該列。表格 `min-w` 可隨之調降。

**測試**：`buildLocationTree`（分組、排序、空層歸位、未分類置頂）。

**驗收**：手動驗證摺疊/展開、節點改名整組生效、搬移單筆；test/build 全綠。

---

## T5 景點刪除防護（P2・★・依賴：無）

**規格**：`Attractions.tsx` 刪除景點前先算引用數：
`await db.itinerary.filter((r) => r.attractionId === id).count()`
（`attractionId` 無索引、個人資料量小，**不要**為此加索引升版）。
count > 0 → `window.confirm('此景點被 N 筆行程使用，刪除後那些行程列將顯示空白。仍要刪除？')`；
count = 0 → 簡單 confirm 一次。

**驗收**：手動驗證兩種情境；build 綠。

---

## T6 行程逐日檢視（P1・★★・依賴：無）

**背景／目標**：行程頁由單一平面表格改為「依日期分組」，貼近實際排程思考。

**規格**：
1. 純函式（放新檔 `src/lib/itinerary.ts`）：`groupItineraryByDate(items: ItineraryItem[])` 回傳
   依 date 升冪的組（date 空字串的列歸「未排日期」組、**置底**），組內依現有 `sort`；
   以及每日小計函式（時數合計、`transportCost + activityCost` 合計——金額為旅程外幣，
   台幣換算沿用 `money.ts` 現有函式，不要另寫換算）。
2. `ItineraryTab.tsx`：每個日期一個表格區塊，標題列顯示 `日期＋（週X）＋當日小計（外幣與台幣）`；
   每個區塊尾端「＋新增」按鈕，預填該組 date（未排日期組不填）。整趟旅程的**總計列保留在頁尾**。

**測試**：`groupItineraryByDate`＋每日小計（含空 date 置底、組內排序）。

**驗收**：手動驗證分組、預填日期新增；test/build 全綠。

---

## T7 小型 UX 三件組（P2・★・依賴：建議 T4 後，動同一頁）

**規格**：
1. **網址開啟鈕**：`Attractions.tsx` 的 url 欄與 `ItineraryTab.tsx` 的 link 欄旁加小圖示（↗）：
   有值可點、`window.open(url, '_blank', 'noopener')`；空值隱藏。
2. **名稱搜尋**：Attractions 篩選列加「名稱」輸入框，
   比對 `a.name.toLowerCase().includes(q.toLowerCase())`（順手包含 address/notes 亦可，不強求）。
3. **優先度星星**：priority 0–3。列上改為三顆可點星星（點第 n 顆設 n；再點同一顆歸 0）；
   組內排序 priority 降冪、同分依名稱；`AttractionPicker.tsx` 選項同步 priority 降冪、
   文字前綴對應數量的 ★。

**驗收**：手動驗證三項；若動到 group.ts 排序需補測試；test/build 全綠。

---

## T8 重複景點合併工具（P3・★★★・依賴：建議 T5 後）

**背景／目標**：匯入去重只擋「國家＋都市＋名稱」完全相同（`mergeAttractions`），
地名寫法不同的同一景點會並存。合併的關鍵是**行程參照要跟著改指向**，不能單純刪除。

**規格**：
1. 新檔 `src/lib/dedupeAttractions.ts`，純函式＋測試：
   - `findDuplicateGroups(attractions): Attraction[][]`——名稱正規化
     （trim、移除全形/半形空白、lowercase）後相同者成組，組內 ≥ 2 筆才回傳。
   - `mergeAttractionFields(survivor, losers): Attraction`——各欄位取 survivor 非空值優先、
     否則第一個非空 loser 值；`notes` 取聯集以 `・` 串接去重；`priority` 取最大。
2. DB 操作 `applyMerge(survivorId, loserIds)`（**勿**與 `importAttractions.ts` 的
   `mergeAttractions` 撞名）：單一 transaction 內
   ① 以 `mergeAttractionFields` 更新 survivor
   ② `db.itinerary.filter((r) => loserIds.includes(r.attractionId)).modify((r) => { r.attractionId = survivorId })`
   ③ 刪除 losers。
3. UI：Attractions 頁「整理重複」按鈕 → 面板逐組顯示候選（各筆的位置/地址/備註差異），
   radio 選保留者（預設「非空欄位最多」那筆），每組可「合併」或「略過」。

**驗收**：合併後行程列仍指向留下的景點（手動驗證）；純函式測試綠；test/build 全綠。

---

## T9 孤兒參照健檢（P3・★★・依賴：建議 T5/T8 後）

**規格**：
1. 純函式 `findOrphanItinerary(itinerary, attractions): ItineraryItem[]`——
   `attractionId` 非空且不存在於 attractions 者。＋測試。
2. UI：景點庫頁一個「健檢」入口：列出孤兒列（旅程名、日期、活動名），
   每列可「清除參照」（`attractionId = ''`）或連到該旅程；無孤兒顯示「無問題」。

**驗收**：手動驗證（先手動刪一個被引用的景點製造孤兒）；test/build 全綠。

---

## T10 Gist 加密同步（P3・★★★★・依賴：無；建議較強模型執行，或拆「先 lib 後 UI」兩個 session）

**背景／目標**：跨裝置半即時同步＋異地備份——手動「上傳/下載」按鈕，
資料加密後存進使用者**自己的私人 GitHub Gist**。全程 opt-in、無第三方伺服器。
**注意**：成員表含護照號碼，因此**內容一律先加密再上傳**，不可省略。
完成後更新 CLAUDE.md §1 的隱私原則描述（「資料只上使用者自己的雲、且加密、opt-in」）。

**規格**：
1. `src/lib/crypto.ts`（WebCrypto，Node 20 Vitest 有 `globalThis.crypto` 可直接測）：
   - `encryptText(plain: string, passphrase: string): Promise<string>` → JSON 字串
     `{ v: 1, alg: 'AES-GCM', kdf: 'PBKDF2-SHA256', iter: 310000, salt, iv, data }`
     （salt 16 bytes、iv 12 bytes 隨機，base64 編碼）。
   - `decryptText(payload: string, passphrase: string): Promise<string>`；密語錯誤丟明確 Error。
2. `src/lib/sync.ts`：
   - `interface SyncBackend { read(): Promise<{ content: string; updatedAt: string } | null>; write(content: string): Promise<void> }`
   - `GistBackend(token, gistId)`：GitHub API（`https://api.github.com/gists/{id}`，
     headers `Authorization: Bearer …`、`Accept: application/vnd.github+json`，CORS 可用）。
     檔名固定 `travel-recorder.enc.json`；write 用 PATCH；
     read 時若回應標記 `truncated` 改抓 `raw_url`。
   - `createGist(token): Promise<string>` 建**私人** gist（`public: false`）回傳 id。
3. 設定存 localStorage（key 前綴 `tr.sync.`）：token、gistId。
   **密語預設不儲存**、每次操作輸入；提供「記住密語（此裝置）」勾選（勾了才存，附風險說明文字）。
4. UI：`TopNav.tsx` 加「同步」→ dialog：設定區（token、gistId 或「建立新 Gist」）＋兩顆按鈕：
   - **上傳**：`exportAll()` → `JSON.stringify` → `encryptText` → `write`。
   - **下載**：`read` → `decryptText` → `parseBackup` → 比對雲端 `exportedAt` 與本機
     （trips 最大 `updatedAt`）→ 顯示兩邊時間並 confirm → `importAll(data, 'replace')`。
   - 離線或 fetch 失敗：給明確錯誤訊息（沙箱注意：開發環境連不到外網屬正常，靠測試與真機驗證）。
5. 安全守則：建議 fine-grained PAT 僅 gist 權限；**絕不**把 token/密語寫進 repo、log 或錯誤訊息。

**測試**：crypto roundtrip（正確密語還原、錯誤密語丟錯、每次 salt/iv 不同）；
GistBackend 可用注入 fetch mock 測 read/write/truncated 分支（不強求）。

**驗收**：真 Gist 手動驗證：裝置 A 上傳 → 裝置 B（或另一瀏覽器 profile）下載還原成功；
gist 上看到的是密文；test/build 全綠。

---

## 觀察中／不做

- **觀察中（未排程）**：花費/行程頁窄螢幕卡片式檢視（手機體驗）。等 T4 完成後視實際痛感再議。
- **不做**：備份提醒（距上次匯出 N 天提示）——擁有者評估不需要。
- **凍結**（保留功能與資料、暫停開發）：分帳／成員、行李。
