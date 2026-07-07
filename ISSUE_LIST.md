# ISSUE_LIST.md — 開發任務清單

> 與專案擁有者討論收斂出的開發計畫，拆成自足任務供後續 session 逐項接手
> （接手者可能是較低階模型，因此每個任務都寫明目標、已拍板的設計決定、涉及檔案、實作步驟與驗收條件，
> **請勿重新發明設計**；規格沒寫到的細節以 CLAUDE.md 慣例與現有程式風格為準）。
>
> **T1–T10 已全部完成**（2026-07-06 ～ 07-07），完整規格已歸檔——完成內容摘要見 **CLAUDE.md §7**，
> 本檔只保留其進度列。現行任務為 **T11–T23**（2026-07-07 與擁有者第二輪討論定案）。

## 使用方式

1. **開工前必讀 `CLAUDE.md`**（專案架構、慣例、部署眉角都在那）。
2. 一個 session 建議只做一個任務；先確認「依賴」欄的前置任務已完成。
3. 完成後：`npm run test` 與 `npm run build` 必須全綠 → 更新本檔進度表（狀態改 ✅ 加日期）→
   更新 CLAUDE.md §7／§9 → commit（訊息含任務編號，例 `feat(T11): ...`）→ push 到該 session 指定的分支。
4. 難度 ★★★ 以上的任務建議由較強模型執行，或拆多個 session（先純函式庫、後 UI）。

## 進度總覽

### 已完成（歸檔，規格見 CLAUDE.md §7）

| # | 任務 | 狀態 |
|---|------|------|
| T1 | 購物併入花費、移除購物分頁 | ✅ 2026-07-06 |
| T2 | 總覽頁：地點下拉＋幣別/匯率自動帶入 | ✅ 2026-07-06 |
| T3 | 行程景點下拉依旅程國家預選 | ✅ 2026-07-06 |
| T4 | 景點庫樹狀階層＋節點批次編輯 | ✅ 2026-07-06 |
| T5 | 景點刪除防護 | ✅ 2026-07-06 |
| T6 | 行程逐日檢視 | ✅ 2026-07-06 |
| T7 | 小型 UX 三件組 | ✅ 2026-07-06 |
| T8 | 重複景點合併工具 | ✅ 2026-07-06 |
| T9 | 孤兒參照健檢 | ✅ 2026-07-06 |
| T10 | Gist 加密同步（手動上傳/下載） | ✅ 2026-07-07 |

### 進行中（T11–T23，表列順序＝建議施工順序）

| # | 任務 | 優先 | 難度 | 依賴 | 狀態 |
|---|------|------|------|------|------|
| T11 | 行程同日依時間排序＋時間/日期輸入失焦寫入 | P1 | ★★ | 無 | ✅ 2026-07-07 |
| T12 | 行程列小計改外幣為主＋頁尾三數值總計 | P1 | ★ | 建議 T11 後（同檔） | ✅ 2026-07-07 |
| T13 | 行程頁依旅程日期自動列出所有天數 | P1 | ★★ | 建議 T11 後（同函式） | 待做 |
| T14 | 景點類型擴充「住宿」「交通」 | P1 | ★ | 無 | 待做 |
| T15 | 景點「已去過」標記 | P2 | ★★ | 無 | 待做 |
| T16 | AttractionPicker 三段式改造（類型→都市→景點、國家鎖死） | P1 | ★★★ | T14；建議 T15 後（同元件） | 待做 |
| T17 | 行程移除付錢/分攤欄＋分帳結算不再計入行程 | P1 | ★★ | 無 | 待做 |
| T18 | 行程起訖時間（endTime＋時數自動計算） | P1 | ★★ | 建議 T11/T12/T17 後（同檔） | 待做 |
| T19 | 花費「已結清」生效（結算排除） | P1 | ★ | T17 | 待做 |
| T20 | 總覽移除人數欄＋花費平均改用成員數 | P1 | ★ | 無 | 待做 |
| T21 | 行李清單繼承上次旅程 | P2 | ★ | 無 | 待做 |
| T22 | 逐日行程匯出文字（複製到剪貼簿） | P2 | ★★ | T18 | 待做 |
| T23 | 匯入備份可選「取代／合併」 | P2 | ★★ | 無 | 待做 |

## 共通守則（每個任務都適用）

- **凍結區（局部解凍）**：分帳／成員（`SettlementTab.tsx`、`money.ts` 的 `settle`、`MemberSelect.tsx`、
  `ParticipantsPicker.tsx`、members 表）與行李（`PackingTab.tsx`）原則上仍凍結，
  **但 T17／T19／T20／T21 的規格明文要求修改的部分可以動**——僅限各該任務點名的檔案與範圍，
  不要順手重構或擴充凍結區的其他程式。型別編譯錯誤時做最小修正即可。
- 新表單欄位一律沿用 `src/components/cells.tsx` 的聚焦緩衝元件（原因見 CLAUDE.md §6）。
- 可測試的邏輯寫成 `src/lib/` 純函式＋ Vitest 測試；UI 檔案只留組裝與 DB 呼叫。
- Dexie 目前 schema 版本為 **v5**。**新增「無索引」欄位不需要升版**（Dexie 物件是 schemaless，
  索引才需要宣告）——T18 加 `endTime` 即屬此類；T11–T23 **沒有任何任務需要升 Dexie 版本**。
- 個人資料（真實景點 CSV、護照號碼等）不得進 repo；測試用合成樣本。
- 純文件 commit 訊息加 `[skip ci]`。
- 本批任務的設計決定（含取捨原因）都已與擁有者拍板，規格內標明「已拍板」者**不要改成別的做法**。

---

## T11 行程同日依時間排序＋時間/日期輸入失焦寫入（P1・★★・依賴：無）

**背景／目標**：T6 逐日檢視的組內排序目前依 `sort`（＝新增順序），改為依「時間」排序。
同時把時間／日期輸入改成**失焦才寫入 DB**——已拍板：即時寫入會讓列在編輯中途重排、
瀏覽器搬動 DOM 節點時輸入框會失焦，失焦寫入可整個避開。

**規格**：
1. `src/lib/itinerary.ts` 的 `groupItineraryByDate`：組內排序由 `a.sort - b.sort` 改為：
   - 兩者 `time` 皆非空 → `a.time.localeCompare(b.time)`（`HH:MM` 字串序＝時間序）；
   - 一空一非空 → **空 `time` 排後面**（已拍板：未定時間的列沉底）；
   - `time` 相同或皆空 → `a.sort - b.sort`（維持穩定）。
   - 同步更新函式 JSDoc。
2. `src/components/cells.tsx`：`TextLike` 加 prop `commitOnBlur?: boolean`（預設 `false`＝行為完全不變）：
   - `true` 時：輸入過程只更新內部 `text` state、不呼叫 `onChange`；
     `onBlur` 時（`setFocused(false)` 之外）若 `text !== value` 才呼叫 `onChange(text)`。
   - `TimeInput` 與 `DateInput` 改為**固定**以 `commitOnBlur` 模式渲染（所有用到它們的頁面一起生效，
     花費頁／總覽頁的日期時間欄延後寫入無害）。`TextInput`／`NumberInput` **不要動**。
3. 測試：`src/lib/itinerary.test.ts` 至少加 3 條——
   同日 `10:00`／`09:00`／`''` 三列 → 排序為 `09:00, 10:00, ''`；
   同 `time` 依 `sort`；全空 `time` 時順序與改動前相同（依 `sort`）。

**不要做**：不動日期分組本身；不動 schema；不改其他輸入元件的寫入時機。

**驗收**：`npm run test`（含新測試）與 `npm run build` 全綠；
手動：行程頁同日列依時間排序、修改時間在**離開欄位後**該列才移動位置。

---

## T12 行程列小計改外幣為主＋頁尾三數值總計（P1・★・依賴：建議 T11 後，同檔）

**背景／目標**：行程每列的「小計(元)」目前只有台幣換算；交通／花費輸入本來就是旅程外幣，
已拍板：**列小計改外幣為主、台幣為輔（同格兩行）**；頁尾總計比照當日標題顯示三個數值。

**規格**：
1. `src/lib/money.ts` 加純函式
   `itineraryForeignSubtotal(item: Pick<ItineraryItem, 'transportCost' | 'activityCost'>): number`
   ＝ `round((transportCost || 0) + (activityCost || 0))`。＋2 條測試（一般、缺值當 0）。
2. `ItineraryTab.tsx` 的小計欄（現為 `fmt(itinerarySubtotal(it, trip))`）改為同格兩行：
   主行外幣 `fmt(itineraryForeignSubtotal(it))`、
   下方一行小灰字（`text-xs text-gray-400`）台幣 `fmt(itinerarySubtotal(it, trip))`。
   表頭 `小計(元)` 改 `小計({cur})`。
3. 頁尾總計（現為「交通＋花費小計：X 元」）改為與當日標題同格式：
   以 `itineraryDaySubtotal(list, trip)` 對整趟清單計算，顯示
   `總計 {hours} 小時 · {cur} {foreign} · 台幣 {twd}`。

**不要做**：不動花費頁的小計；不動 `itinerarySubtotal`／`itineraryTotal` 本身。

**驗收**：test／build 全綠；手動：列小計顯示外幣＋灰字台幣、頁尾三數值與各日小計加總一致。

---

## T13 行程頁依旅程日期自動列出所有天數（P1・★★・依賴：建議 T11 後，同函式）

**背景／目標**：新旅程在總覽選好出發／回程日期後，行程頁自動出現整個區間每一天的空日區塊。
已拍板：**顯示層補空日、不建任何資料列**（DB 與備份完全不變）。

**規格**：
1. `src/lib/itinerary.ts`：`groupItineraryByDate` 加第二參數
   `range?: { startDate: string; endDate: string }`：
   - 僅當兩端皆符合 `^\d{4}-\d{2}-\d{2}$`、`startDate <= endDate`（字串比較即可）、
     且區間天數 **≤ 90**（防呆：年份打錯不會炸出幾千組）時才補空日；否則行為與現在完全相同。
   - 對區間內每個「沒有任何行程列」的日期插入 `{ date, items: [] }`，與既有組一起依 date 升冪；
     區間**外**的日期組照常顯示；「未排日期」組照舊置底。
   - 日期迭代寫一個小 helper（`export` 出來供測試）：用 `new Date(y, m-1, d)` 本地時區逐日 +1，
     再格式化回 `YYYY-MM-DD`（`padStart`），**不要**用 `new Date('YYYY-MM-DD')`（UTC 時區陷阱，
     同 `weekdayLabel` 的注意事項）。
2. `ItineraryTab.tsx`：
   - 呼叫改為 `groupItineraryByDate(list, { startDate: trip.startDate, endDate: trip.endDate })`。
   - 渲染分支改依 `groups.length === 0` 判斷空狀態（現在依 `list.length`——補空日後
     `list` 可能為空但 `groups` 非空，此時要走一般渲染）。
   - `items.length === 0` 的空日組：**不渲染表格與當日小計**，只渲染日期標題列（日期＋週幾）
     與「＋在這天新增一列」按鈕。
3. 測試：補空日（含跨月）、區間外日期組仍存在、`endDate < startDate` 不補、
   格式不合不補、天數 > 90 不補、不傳 `range` 行為不變。

**不要做**：不建空白 ItineraryItem；不動備份格式；不動 `weekdayLabel`。

**驗收**：test／build 全綠；手動：新旅程選 5 天日期 → 行程頁出現 5 個空日區塊，各可一鍵新增該日列。

---

## T14 景點類型擴充「住宿」「交通」（P1・★・依賴：無）

**規格**：
1. `src/types.ts`：`Attraction.type` 型別由 `'attraction' | 'food' | ''` 擴為
   `'attraction' | 'food' | 'lodging' | 'transport' | ''`。
2. 順手在 `src/types.ts` export 一個共用常數（給下拉與標籤用，避免四處硬寫）：
   `export const ATTRACTION_TYPES = [
     { value: 'attraction', label: '景點' },
     { value: 'food', label: '美食' },
     { value: 'lodging', label: '住宿' },
     { value: 'transport', label: '交通' },
   ] as const`。
3. `src/pages/Attractions.tsx`：現有三處類型 `<option>` 清單（新增列的類型、列上類型下拉、
   篩選列類型下拉，約在 L357／L412／L521 附近）與兩處 state 型別（`newType`／`fType`）改用新聯集，
   選項改由 `ATTRACTION_TYPES` map；DedupePanel 內的類型標籤（約 L911 `a.type === 'food' ? '美食' : '景點'`）
   改查 `ATTRACTION_TYPES` 對應 label（查無顯示「景點」維持舊行為）。
4. `src/components/AttractionPicker.tsx`：`fType` state 型別與類型選項同步擴充（同樣用 `ATTRACTION_TYPES`）。
5. `src/lib/importAttractions.ts` **不要動**（CSV 匯入只會產生 `'attraction' | 'food'`，正確）。

**不要做**：不升 Dexie 版（type 無索引）；不動 CSV 匯入；不改備份格式。

**驗收**：build 全綠、既有測試不變仍綠；手動：景點可設「住宿」「交通」並以類型篩選。

---

## T15 景點「已去過」標記（P2・★★・依賴：無）

**背景／目標**：擁有者想以「景點是否出現在任何旅程的行程」作為去過的紀錄。
已拍板：**單一標記**——只要被**任何**旅程的行程列參照過就標 ✓，不區分過去／未來旅程。

**規格**：
1. 新檔 `src/lib/visited.ts`：純函式
   `visitedAttractionIds(itinerary: Array<Pick<ItineraryItem, 'attractionId'>>): Set<string>`
   ——收集非空 `attractionId` 成 Set。＋測試（基本、空清單、重複 id 去重，3 條）。
2. `src/pages/Attractions.tsx`：頁面層已有 `useLiveQuery(() => db.itinerary.toArray())`（T9 加的，約 L107），
   直接以其結果算 `visitedAttractionIds`；樹狀列表中被包含的景點，名稱旁顯示綠色小 `✓`
   （`title="已排入行程（去過）"`）。
3. `src/components/AttractionPicker.tsx`：加 optional prop `visitedIds?: Set<string>`，
   option 文字在名稱後綴 ` ✓`。
4. `ItineraryTab.tsx`：新增一個 `useLiveQuery(() => db.itinerary.toArray(), [], [])`（**全庫**，
   不同於現有的當前旅程查詢），算出 Set 後傳給每列的 `AttractionPicker`（資料量小，全掃無妨，沿 T5 慣例）。

**不要做**：不加 schema 欄位（純推導）；不加索引。

**驗收**：test／build 全綠；手動：把景點排進任一旅程行程後，景點庫與下拉皆出現 ✓。

---

## T16 AttractionPicker 三段式改造（P1・★★★・依賴：T14；建議 T15 後，同元件）

**背景／目標**：行程的景點下拉改為「類型 → 都市 → 景點」三段；已拍板：
**國家完全鎖死為旅程國家、國家下拉整個移除**（未分類＝國家空白的景點在行程頁選不到，
匯入 CSV 後須先到景點庫用「未分類」節點批次補國家——這是刻意的工作流）。

**規格**：
1. Props 變更：移除 `defaultCountry?: string`，改為
   `country: string`（旅程國家，過濾鎖定用）與 `defaultCity?: string`。
   `ItineraryTab.tsx` 傳 `trip.country ?? ''` 與 `trip.city ?? ''`。（T15 的 `visitedIds` prop 保留。）
2. 版面：第一行「類型＋都市」兩個小下拉（取代現在的國家＋類型），第二行景點下拉，高度不變。
   - 類型下拉：「全部」＋ `ATTRACTION_TYPES`（T14）。
   - 都市下拉：首選項「全部都市」（value `''`）；`country` 非空 →
     `getLocationOptions(attractions).citiesByCountry.get(country) ?? []`；
     `country` 空 → 全庫都市去重、`zh-Hant` 排序。
3. 過濾：`country` 非空 → 只留 `a.country === country`；再套類型／都市篩選。
   `country` 空 → 不過濾國家（退化為類型＋都市對全庫篩選）。
4. 內部 state 初始化（`useState` 初值，只初始化一次）：
   - `fType`：一律 `''`（全部）。
   - `fCity`：若 `value` 非空且該景點存在於 `attractions` → **用該景點自己的 `city`**
     （已拍板：避免「已選了別的都市的景點、卻被預設篩選藏起來」的空白假象）；
     否則若 `defaultCity` 存在於第 2 點的都市選項中 → `defaultCity`；否則 `''`。
5. 景點下拉 optgroup：沿用 `groupByLocation(filtered)`（**不要改 group.ts**——它回傳的
   `{country, city, district}` parts 足夠），label 改由 parts 自組：
   - `fCity` 非空（已選定都市）→ `g.district || '未分區'`；
   - `fCity` 空且 `country` 非空 → `[g.city, g.district].filter(Boolean).join(' · ') || '未分類'`；
   - `country` 空 → 沿用 `g.label`。
   組內排序、★ 前綴、`✓` 後綴（T15）照舊。
6. 「目前選取」保底：若 `value` 非空且**不在**過濾後清單中，於景點下拉最上方加
   optgroup「目前選取」，內含該景點的 option（文字後綴其都市，例 `大阪城（大阪）`）；
   若 `value` 在 `attractions` 中查無（孤兒參照）→ 該保底 option 顯示 `(景點已刪除)`。
   目的：`<select>` 永遠顯示得出目前值，不出現空白。
7. 鎖定國家在景點庫**沒有任何景點**時：景點下拉內放一個 `disabled` option
   「景點庫尚無此國家的景點」（value `''` 之外另一個提示列即可）。

**不要做**：不動 `group.ts`／`getLocationOptions`；不動 `OverviewTab`；
篩選狀態不寫入 DB（純 component state）；不做「切回全部國家」的逃生口（已拍板完全鎖死）。

**驗收**：build 全綠；手動逐項驗證——
新空白列預設帶旅程都市；已選他都市景點的列，下拉可見該景點（初始化用其 city）；
把類型切到不含已選景點的組合時出現「目前選取」保底；旅程國家在庫內無景點時顯示提示；
總覽未選國家時退化為類型＋都市全庫篩選。

---

## T17 行程移除付錢/分攤欄＋分帳結算不再計入行程（P1・★★・依賴：無）

**背景／目標**：分帳功能凍結、行程頁瘦身。已拍板：行程表移除「付錢」「分攤」兩欄，
且**分帳結算改為只彙整花費**（行程列不再是結算的隱形輸入；舊資料若行程曾設付錢者，
結算數字會改變——擁有者已同意）。

**規格**：
1. `ItineraryTab.tsx`：移除「付錢」「分攤」兩欄（`Th`＋`Td`、`MemberSelect`／`ParticipantsPicker`
   import 一併移除）；`addRow` 仍寫入 `payerId: ''`、`participantIds: []`（型別必填、備份相容）；
   表格 `min-w-[78rem]` 依剩餘欄寬酌降（例 `min-w-[66rem]`）；空狀態列的 `colSpan` 同步 −2。
2. `SettlementTab.tsx`（凍結區，本任務明文允許動以下範圍）：
   - `entries` 彙整移除 **itinerary** 迴圈；順手移除 **shopping** 迴圈（v5 起恆空，無行為差異）；
     兩者對應的 `useLiveQuery` 讀取與 `itinerarySubtotal` import 一併清掉。
   - 說明文字改：「彙整花費：每筆依『付錢』與『分攤』計算。預設全體均分；『付錢』未指定的列不列入結算。」
3. `src/types.ts` **不動**（`ItineraryItem.payerId`／`participantIds` 欄位保留，備份相容）。

**不要做**：不動 `settle()` 純函式；不動花費頁的付錢／分攤欄；不刪 schema 欄位。

**驗收**：test／build 全綠（`settle` 測試不受影響）；
手動：行程表無付錢／分攤欄；行程列設定交通／花費金額後，分帳頁結算**不**出現該金額。

---

## T18 行程起訖時間（P1・★★・依賴：建議 T11/T12/T17 後，同檔避免衝突）

**背景／目標**：行程時間由單一「時間」改為「開始／結束」，時數自動計算。
已拍板：加 `endTime` 欄位；**不升 Dexie 版**（無索引欄位免升版，同 T2 加 `trip.country` 的先例）。

**規格**：
1. `src/types.ts`：`ItineraryItem` 加 `endTime?: string`（`HH:MM` 或空；**optional** 以相容
   舊資料與舊備份，讀取處以 `?? ''` 容錯）。
2. `src/lib/itinerary.ts` 加純函式
   `hoursBetween(start: string, end: string): number | null`：
   兩者皆符合 `^\d{2}:\d{2}$` 且 `end > start`（字串比較）→ 回傳小時數（`round(…, 2)`，
   例 `09:00`→`12:30` ＝ 3.5）；其餘（含跨夜 `end <= start`、任一空或格式不合）→ `null`
   （已拍板：不處理跨夜，使用者自己填時數）。＋測試 ≥ 4 條（一般、半小時、跨夜 null、格式不合 null）。
3. `ItineraryTab.tsx`：
   - 「時間」欄拆成「開始」「結束」兩欄（各一個 `TimeInput`、`w-24`；表頭 `開始`／`結束`）。
   - 任一時間欄寫入時（T11 後為失焦時）：取「新值＋另一欄的現存值」呼叫 `hoursBetween`，
     非 `null` → patch 同時寫入 `{ time 或 endTime, hours }`；`null` → 只寫時間欄位、`hours` 不動。
   - 「時數」欄**保留且仍可手動修改**（手改覆寫自動值；下次改時間若可計算會再覆寫回來）。
   - `addRow` 寫入 `endTime: ''`。
4. 排序（T11）仍以 `time`（開始）為準，**不要**把 `endTime` 加進排序鍵。
5. 備份：`exportAll`／`importAll` 是整物件序列化，多一個欄位自動相容，**不需要改 backup.ts**。

**不要做**：不升 Dexie 版；不處理跨夜自動計算；不動花費頁時間欄。

**驗收**：test／build 全綠；手動：填開始＋結束自動帶時數、只填開始不影響時數、時數仍可手改；
舊資料（無 endTime）正常顯示為空。

---

## T19 花費「已結清」生效（P1・★・依賴：T17，同動 SettlementTab）

**背景／目標**：`paymentStatus`（—／已付／未付／已結清）目前**全專案沒有任何邏輯讀取**，
是純顯示欄。已拍板：讓「已結清」真的生效——結算時排除該列（語意：該筆的債務已私下處理，
付錢與分攤都不計入）；「已付」「未付」維持純備註。

**規格**：
1. `SettlementTab.tsx`：expenses 彙整迴圈中跳過 `e.paymentStatus === '已結清'` 的列
   （字面值比對，資料就是存中文字串）。
2. 說明文字改：「彙整花費：每筆依『付錢』與『分攤』計算，預設全體均分；
   『付錢』未指定**或標『已結清』**的列不列入結算。」
3. `ExpensesTab.tsx`：狀態欄下拉不動；`<Th>狀態</Th>` 加 `title="標「已結清」的列不列入分帳結算"`
   （若 `Th` 元件不支援 title，加在內層即可）。

**不要做**：不動 `settle()` 純函式（過濾在彙整層做）；不改 `paymentStatus` 的選項清單；
不動 `paid` boolean（無 UI 的遺留欄位，保留相容）。

**驗收**：build 全綠；手動：兩位成員各付一筆 → 其中一筆標「已結清」→ 結算建議即時排除該筆金額。

---

## T20 總覽移除人數欄＋花費平均改用成員數（P1・★・依賴：無）

**背景／目標**：`trip.peopleCount`（花費頁平均的分母）與分帳成員清單各自獨立，
造成「平均（2 人）」與「應分攤 ÷ 3」並存的矛盾（擁有者截圖回報過）。
已拍板：移除人數欄，**全 App 人數來源統一為分帳頁的成員清單**。

**規格**：
1. `OverviewTab.tsx`：移除「人數（算平均用）」`Field`（`peopleCount` 不再有任何 UI；
   同一 grid 的「匯率」欄版面自行調整）。
2. `ExpensesTab.tsx`：`expensesAverage(total, trip.peopleCount)` 改為
   `expensesAverage(total, members.length)`（members 的 `useLiveQuery` 已存在）；
   顯示改「平均（{members.length} 人）：X 元」；`members.length === 0` 時**整段平均隱藏**。
3. `src/types.ts` 與 `TripList.tsx` 的 `addTrip` **不動**（`peopleCount` 欄位與預設值保留，備份相容）。

**不要做**：不刪 schema 欄位；不動 `expensesAverage` 純函式；不動分帳頁。

**驗收**：build 全綠；手動：總覽無人數欄；花費頁平均人數＝分帳成員數（與應分攤一致）；
無成員時不顯示平均。

---

## T21 行李清單繼承上次旅程（P2・★・依賴：無）

**背景／目標**：行李清單每次旅行大同小異。已拍板：**建立新旅程時自動複製**
「最近更新的既有旅程」的行李清單（勾選狀態歸零）。

**規格**：
1. `TripList.tsx` 的 `addTrip`：
   - 先 `const prev = await db.trips.orderBy('updatedAt').last()`（新 trip 尚未寫入，不會撈到自己）。
   - 用 `db.transaction('rw', db.trips, db.packing, async () => { ... })`：寫入新 trip；
     若 `prev` 存在 → 讀 `db.packing.where('tripId').equals(prev.id).sortBy('sort')`，
     逐筆複製為 `{ ...p, id: newId(), tripId: 新trip.id, checked: false }` 後 `bulkAdd`。
   - 之後照舊 `navigate`。
2. 無既有旅程（第一個旅程）→ 跳過複製。
3. 凍結區注意：`PackingTab.tsx` **不動**，本任務只動 `TripList.tsx` 的建立邏輯（明文允許寫入 packing 表）。

**不要做**：不加「選擇來源旅程」的 UI（永遠取最近更新那個）；不複製花費／行程／成員。

**驗收**：build 全綠；手動：旅程 A 建立行李 3 筆（勾 2 筆）→ 新增旅程 B → B 的行李頁有同樣 3 筆、全未勾選。

---

## T22 逐日行程匯出文字（P2・★★・依賴：T18，格式含起訖時間）

**背景／目標**：資料只在本機，缺「分享行程給同行者」的管道。已拍板：輸出**易讀純文字**
（不含金額），一鍵複製到剪貼簿、貼通訊軟體即可。

**規格**：
1. 新檔 `src/lib/exportItinerary.ts`：純函式
   `itineraryToText(trip: Pick<Trip, 'name' | 'startDate' | 'endDate'>, groups: ItineraryDayGroup[], attractions: Attraction[]): string`：
   - 首行 `{name}（{startDate} ～ {endDate}）`；任一日期空 → 只輸出 `{name}`。
   - 每組之間空一行；組標題 `■ {MM/DD}（{週X}）`（`MM/DD` 由 `YYYY-MM-DD` 切字串，
     週幾用現有 `weekdayLabel`；「未排日期」組標題 `■ 未排日期`）。
   - 每列一行：`{時間段} {標題}`——
     時間段：`time` 與 `endTime` 皆有 → `{time}–{endTime}`；只有 `time` → `{time}`；皆無 → 省略；
     標題：景點名（由 `attractionId` 查 `attractions`）與 `activity` 皆有 → `{景點名}｜{activity}`，
     只有一者 → 該者，皆空 → `(未填)`；
     `notes` 非空 → 次行 `　備註：{notes}`。
   - 空日組（`items` 為空，T13 產生）**跳過不輸出**。
   ＋測試 ≥ 3 條（完整旅程、無日期旅程、時間／名稱各種缺漏組合）。
2. `ItineraryTab.tsx` 頁尾（總計旁）加「複製行程文字」按鈕：
   `navigator.clipboard.writeText(itineraryToText(...))`，成功 → 按鈕文字暫變「已複製 ✓」約 2 秒
   （比照 TopNav 的 flash 手法）；失敗（try/catch）→ `alert('複製失敗，請改用匯出備份')`。

**不要做**：不含金額／付錢資訊；不做檔案下載（剪貼簿即可）；不做格式選項。

**驗收**：test／build 全綠；手動：複製後貼到記事本，格式如上、逐日分段、可讀。

---

## T23 匯入備份可選「取代／合併」（P2・★★・依賴：無）

**背景／目標**：`importAll` 早已支援 `'merge'`（同 id 以匯入檔為準覆蓋、本機獨有的保留），
但 UI 一律 `'replace'`。已拍板：TopNav 匯入與 Gist 下載都提供兩種模式，降低誤覆蓋風險。

**規格**：
1. `TopNav.tsx` 的 `handleImportFile`：parse 成功後改為兩段 `confirm`：
   - 第一段：`「要以『合併』方式匯入嗎？\n合併＝保留本機資料、同 id 以備份為準；本機已刪除但備份仍有的資料會被加回。\n（按「取消」改問是否『取代』）」`
     → 確定 ⇒ `importAll(data, 'merge')`。
   - 取消後第二段：`「改以『取代』匯入？將清空本機所有資料、完全以備份內容取代。」`
     → 確定 ⇒ `importAll(data, 'replace')`；再取消 ⇒ 中止。
   - flash 訊息帶上模式（「匯入完成（合併）」／「匯入完成（取代）」）。
2. `SyncDialog.tsx` 的 `handleDownload`：現有 confirm（顯示雲端／本機時間戳）比照改兩段式——
   第一段文字保留兩邊時間戳資訊＋合併說明，確定 ⇒ `importAll(data, 'merge')`；
   取消後第二段問「取代」，確定 ⇒ `importAll(data, 'replace')`；再取消 ⇒ 中止。
   成功訊息帶模式。
3. `src/lib/backup.ts` **不動**（merge 已實作）。

**不要做**：不做自訂 modal（原生 confirm 兩段式即可，之後真的不夠用再議）；不動上傳流程。

**驗收**：build 全綠；手動：本機有 A、備份有 B → 合併後 A＋B 都在；取代後只剩 B；
Gist 下載同樣可選。

---

## 觀察中／不做

- **觀察中（未排程，2026-07-07 討論過但暫緩）**：
  行程頁直接新增景點（picker 內開 modal）；旅程日期整批平移；當日景點串 Google Maps 路線；
  總覽頁旅程摘要卡；花費分類統計；花費/行程頁窄螢幕卡片式檢視（手機體驗，長期最值得投資的大項）；
  Gist 上傳防覆蓋保護（上傳前比對雲端 `exportedAt`）。
- **不做**：備份提醒（擁有者評估不需要）；匯率 API 自動抓（牴觸離線優先、增加網路依賴）。
- **凍結（保留功能與資料、暫停開發）**：分帳／成員、行李——T17／T19／T20／T21 的局部修改除外（見共通守則）。
