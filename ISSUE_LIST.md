# ISSUE_LIST.md — 開發任務清單

> 與專案擁有者討論收斂出的開發計畫，拆成自足任務供後續 session 逐項接手
> （接手者可能是較低階模型，因此每個任務都寫明目標、已拍板的設計決定、涉及檔案、實作步驟與驗收條件，
> **請勿重新發明設計**；規格沒寫到的細節以 CLAUDE.md 慣例與現有程式風格為準）。
>
> **T1–T24 已全部完成**（2026-07-06 ～ 07-10），完整規格已歸檔——完成內容摘要見 **CLAUDE.md §7**，
> 本檔只保留其進度列。現行任務為 **T25–T33**（2026-07-12 與擁有者第三輪討論定案，
> 含時間輸入 24 小時制、行程欄位重組、手機卡片式檢視等設計均已拍板）。

## 使用方式

1. **開工前必讀 `CLAUDE.md`**（專案架構、慣例、部署眉角都在那）。
2. 一個 session 建議只做一個任務；先確認「依賴」欄的前置任務已完成。
3. 完成後：`npm run test` 與 `npm run build` 必須全綠 → 更新本檔進度表（狀態改 ✅ 加日期）→
   更新 CLAUDE.md §7／§9 → commit（訊息含任務編號，例 `feat(T27): ...`）→ push 到該 session 指定的分支。
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
| T11 | 行程同日依時間排序＋時間/日期輸入失焦寫入 | ✅ 2026-07-07 |
| T12 | 行程列小計改外幣為主＋頁尾三數值總計 | ✅ 2026-07-07 |
| T13 | 行程頁依旅程日期自動列出所有天數 | ✅ 2026-07-08 |
| T14 | 景點類型擴充「住宿」「交通」 | ✅ 2026-07-08 |
| T15 | 景點「已去過」標記 | ✅ 2026-07-08 |
| T16 | AttractionPicker 三段式改造（類型→都市→景點、國家鎖死） | ✅ 2026-07-10 |
| T17 | 行程移除付錢/分攤欄＋分帳結算不再計入行程 | ✅ 2026-07-08 |
| T18 | 行程起訖時間（endTime＋時數自動計算） | ✅ 2026-07-08 |
| T19 | 花費「已結清」生效（結算排除） | ✅ 2026-07-08 |
| T20 | 總覽移除人數欄＋花費平均改用成員數 | ✅ 2026-07-08 |
| T21 | 行李清單繼承上次旅程 | ✅ 2026-07-10 |
| T22 | 逐日行程匯出文字（複製到剪貼簿） | ✅ 2026-07-10 |
| T23 | 匯入備份可選「取代／合併」 | ✅ 2026-07-10 |
| T24 | 分帳成對淨額＋各幣別獨立結算 | ✅ 2026-07-08 |

### 進行中（T25–T33，表列順序＝建議施工順序）

| # | 任務 | 優先 | 難度 | 依賴 | 狀態 |
|---|------|------|------|------|------|
| T25 | 同步小修：下載按鈕文字＋備份 version 升 5 | P1 | ★ | 無 | ✅ 2026-07-13 |
| T26 | Gist 上傳防覆蓋保護 | P1 | ★★ | 建議 T25 後（同檔） | ✅ 2026-07-14 |
| T27 | 時間輸入改 24 小時制純文字（失焦正規化） | P1 | ★★ | 無 | ✅ 2026-07-14 |
| T28 | 數字輸入移除上下箭頭（spinner） | P1 | ★ | 無 | ⬜ |
| T29 | 行程表欄位重組：移除活動欄＋景點三下拉拆欄 | P1 | ★★ | 建議 T27/T28 後（同檔） | ⬜ |
| T30 | 旅程日期整批平移 | P2 | ★★ | 無 | ⬜ |
| T31 | 行程頁手機卡片式檢視 | P1 | ★★★ | T29（欄位定案後再做） | ⬜ |
| T32 | 花費頁手機卡片式檢視 | P2 | ★★★ | T31（沿用其模式） | ⬜ |
| T33 | 健檢擴充：成員孤兒參照 | P3 | ★★ | 無（凍結區局部解凍） | ⬜ |

## 共通守則（每個任務都適用）

- **凍結區（局部解凍）**：分帳／成員（`SettlementTab.tsx`、`money.ts` 的 `settle`、`MemberSelect.tsx`、
  `ParticipantsPicker.tsx`、members 表）與行李（`PackingTab.tsx`）原則上仍凍結，
  **本輪僅 T33 有明文解凍範圍**（讀 members 表、寫 expenses 的 `payerId`／`participantIds`）——
  僅限該任務點名的檔案與範圍，不要順手重構或擴充凍結區的其他程式。型別編譯錯誤時做最小修正即可。
- 新表單欄位一律沿用 `src/components/cells.tsx` 的聚焦緩衝元件（原因見 CLAUDE.md §6）。
- 可測試的邏輯寫成 `src/lib/` 純函式＋ Vitest 測試；UI 檔案只留組裝與 DB 呼叫。
- Dexie 目前 schema 版本為 **v5**。**新增「無索引」欄位不需要升版**（Dexie 物件是 schemaless，
  索引才需要宣告）——T25–T33 **沒有任何任務需要升 Dexie 版本**，也沒有任務新增資料欄位。
- 個人資料（真實景點 CSV、護照號碼等）不得進 repo；測試用合成樣本。
- 純文件 commit 訊息加 `[skip ci]`。
- 本批任務的設計決定（含取捨原因）都已與擁有者拍板，規格內標明「已拍板」者**不要改成別的做法**。

---

## T25 同步小修：下載按鈕文字＋備份 version 升 5（P1・★・依賴：無）

**背景／目標**：兩個文件性小修——
1. `SyncDialog.tsx` 的下載按鈕文字「下載（Gist→**取代本機**）」是 T10 時代的殘留：
   T23 之後下載其實會先問「合併」、取消才問「取代」，按鈕文字與行為不符。
2. `backup.ts` 的 `exportAll` 仍寫 `version: 4`，但 Dexie schema 已是 v5（T1 購物併入花費）。
   `importAll` 不檢查版本號所以無實害，但未來若要靠版本判斷格式會踩到。

**規格**：
1. `SyncDialog.tsx`（約 L249）：按鈕文字改「下載（Gist→本機）」。
2. `backup.ts`（約 L39）：`version: 4` 改 `version: 5`。舊備份檔不受影響（`importAll` 依欄位形狀
   而非版本號做相容判斷，見既有 v2-/v3/v4 正規化邏輯）。

**不要做**：不動 `importAll` 邏輯；不加版本檢查。

**驗收**：`npm run build` 全綠、既有測試全綠；手動：同步對話框按鈕文字正確；
匯出的 JSON 首段 `version` 為 5、匯入舊檔（version 4）仍正常。

---

## T26 Gist 上傳防覆蓋保護（P1・★★・依賴：建議 T25 後，同檔 SyncDialog）

**背景／目標**：上傳目前是「盲寫」——兩台裝置共用同一 Gist 時，B 裝置拿舊資料上傳會直接
蓋掉 A 剛上傳的新備份，且無任何提示（下載端已有時間戳確認框，上傳端沒有）。
已拍板（2026-07-12）：上傳前比對雲端變動、必要時 confirm；不做自動合併。

**規格**：
1. `src/lib/sync.ts`：`SyncBackend.write` 與 `GistBackend.write` 回傳型別由 `Promise<void>` 改
   `Promise<{ updatedAt: string }>`——PATCH 成功後解析回應 JSON 的 `updated_at`（缺值回 `''`）。
   `read()` 不動（已回傳 `updatedAt`）。
2. `SyncDialog.tsx`：`LS` 常數表加 `lastSyncedAt: 'tr.sync.lastSyncedAt'`。
   - **每次成功上傳**：以 `write()` 回傳的 `updatedAt` 寫入 localStorage。
   - **每次成功下載**：以 `snap.updatedAt` 寫入 localStorage
     （`handleDownload` 的 merge 與 replace **兩個成功分支都要寫**）。
3. `handleUpload` 流程改為：先 `new GistBackend(token, gistId).read()`：
   - `snap === null`，或 `snap.content.trim()` 為空／為 `'{}'`（`createGist` 的初始 placeholder）
     → 視為雲端無備份，直接上傳、不 confirm。
   - 雲端有備份且 `snap.updatedAt !== localStorage 的 lastSyncedAt`（含本機無紀錄）→ `confirm`：
     「雲端備份最後更新：{updatedAt 轉本地時間}\n本裝置上次同步：{lastSyncedAt 轉本地時間，無紀錄顯示「（無紀錄）」}\n\n雲端內容可能來自其他裝置，直接上傳將覆蓋它。仍要上傳？」
     取消 ⇒ 中止（不上傳、不清欄位）。
   - 相同 → 直接上傳。
   - 之後照舊 `exportAll → encryptText → write`，成功後依第 2 點更新 lastSyncedAt。
   - `read()` 拋錯（網路／HTTP 錯誤）⇒ 顯示錯誤並**中止上傳**——整段放在既有 try/catch 內即自然成立；
     **不可**改成「讀不到就直接上傳」（那會讓防覆蓋檢查失效）。
4. 錯誤處理照舊：HTTP 錯誤只回 status、token/passphrase 不進任何訊息。多一次 read API call 可接受。

**不要做**：不做自動合併／三方 merge；不動加密流程與下載的兩段 confirm（T23）；
不比對內容雜湊（updated_at 已足夠）。

**驗收**：build 全綠。沙箱無法連 `api.github.com`（同 T10），真機驗證由擁有者完成：
裝置 A 上傳 → 裝置 B（未同步過或較舊）上傳時出現覆蓋確認；
同一裝置連續上傳兩次，第二次不應跳 confirm（lastSyncedAt 已對齊）。

---

## T27 時間輸入改 24 小時制純文字（失焦正規化）（P1・★★・依賴：無）

**背景／目標**：時間欄目前是原生 `<input type="time">`，12/24 小時制跟隨裝置語系、HTML 無法強制，
且原生控件橫向偏寬。已拍板（2026-07-12）：**改純文字輸入＋失焦自動正規化**，保證 24 小時制、
欄寬縮到最小；代價＝手機上沒有原生時間滾輪、改用數字鍵盤（擁有者接受）。

**規格**：
1. `src/lib/itinerary.ts` 加純函式 `normalizeTimeText(raw: string): string | null`
   （與 `hoursBetween`／`weekdayLabel` 同檔，時間工具集中）：
   - `trim()` 後為 `''` → 回 `''`（合法，代表清空）。
   - `/^\d{1,2}$/`（如 `9`、`14`）→ 視為整點 → `HH:00`。
   - `/^\d{3}$/`（如 `930`）→ 首位為時、後兩位為分 → `09:30`。
   - `/^\d{4}$/`（如 `0930`、`1745`）→ 前兩位時、後兩位分。
   - `/^\d{1,2}:\d{2}$/`（如 `9:30`）→ 時補零。
   - 以上皆需通過範圍檢查：時 0–23、分 0–59；不通過或不符任何格式 → 回 `null`。
   - **不變量**：非 null 回傳值一定是 `''` 或 `HH:MM`——與 `groupItineraryByDate` 的
     `localeCompare` 排序及 `hoursBetween` 的 `^\d{2}:\d{2}$` 假設相容，DB 永遠只存這兩種形狀。
2. `src/components/cells.tsx`：
   - `TextLikeProps` 加 `normalize?: (raw: string) => string | null` 與 `inputMode?: 'numeric'`
     （皆 optional，預設不影響現有呼叫者）。
   - `onBlur`（`commitOnBlur` 模式）：先 `const out = normalize ? normalize(text) : text`；
     `out === null` → `setText(value)` 恢復原值、**不**呼叫 `onChange`；
     否則 `setText(out)`，且 `out !== value` 才呼叫 `onChange(out)`。
   - `TimeInput` 改為 `type="text"`＋`inputMode="numeric"`＋`placeholder="HH:MM"`＋
     `normalize={normalizeTimeText}`（`commitOnBlur` 照舊固定 true）。固定值寫在 `{...p}` 展開
     **之後**（後者覆蓋）；`tsc` 若對 `Omit` 型別報錯，把新 prop 名一併加進 `Omit` 清單即可。
     `TextInput`／`DateInput`／`NumberInput` **不動**（日期仍用原生 date picker，與 12/24h 無關）。
3. 欄寬：`ItineraryTab.tsx` 開始／結束欄（約 L94／L97）`w-24` → `w-16`；
   `ExpensesTab.tsx` 時間欄（約 L80）`w-24` → `w-16`。
4. 測試：`itinerary.test.ts` 加 `normalizeTimeText` ≥ 8 條——空字串、`9`→`09:00`、`930`→`09:30`、
   `0930`、`9:30`→`09:30`、`24:00`／`1260`（分超界）→ null、`abc`→ null、已是 `HH:MM` 原樣通過。

**不要做**：不動 `DateInput`；不支援 12 小時制輸入（如 `930p`）；不做跨欄自動跳格。

**驗收**：test／build 全綠；手動：打 `930` 失焦變 `09:30` 並觸發時數自動計算（T18）；
打亂字失焦恢復原值；手機鍵盤為數字；行程同日排序照常。

---

## T28 數字輸入移除上下箭頭（P1・★・依賴：無）

**背景／目標**：`NumberInput`（`type="number"`）的瀏覽器原生上下箭頭（spinner）常遮住數字。
已拍板：全域隱藏。

**規格**：
1. `src/index.css` **檔尾**（既有 `body` 規則之後）直接加下列規則——此檔目前**沒有** `@layer` 區塊，
   比照既有 `html, body` 規則的寫法即可、不要自己開 `@layer`：
   ```css
   input[type='number']::-webkit-outer-spin-button,
   input[type='number']::-webkit-inner-spin-button {
     -webkit-appearance: none;
     margin: 0;
   }
   input[type='number'] {
     -moz-appearance: textfield;
     appearance: textfield;
   }
   ```
2. `cells.tsx` 的 `NumberInput` **不動**（仍 `type="number"`＋`inputMode="decimal"`，
   手機數字鍵盤與小數輸入行為不變）。

**不要做**：不改成 `type="text"`；不動任何元件邏輯。

**驗收**：build 全綠；手動：花費／行程各數字格 hover／聚焦皆無上下箭頭，仍可輸入小數（如 0.21）。

---

## T29 行程表欄位重組：移除活動欄＋景點三下拉拆欄（P1・★★・依賴：建議 T27/T28 後，同檔減衝突）

**背景／目標**：「景點」欄目前是 AttractionPicker 疊兩行（上：類型＋都市小下拉；下：景點下拉），
擠在一格；「行程／活動」自由文字欄使用率低（行程內容以景點庫為主，交通/住宿已有 T14 類型可表達）。
已拍板（2026-07-12）：**移除「行程／活動」欄**；AttractionPicker 的三個下拉
**拆成三個獨立表格欄**「類型」「都市」「景點」。
**activity 資料欄位保留**（`types.ts` 不動、備份相容、T22 匯出文字對舊資料照常輸出）——
只是表格不再顯示／編輯。

**規格**：
1. `src/components/AttractionPicker.tsx`：改為回傳 fragment 內含三個 `<Td>`
   （類型 `w-20`、都市 `w-24`、景點 `min-w-[14rem]`；`Td` 由 `cells.tsx` import）。
   內部 state（`fType`／`fCity`）、過濾邏輯、optgroup label 自組、「目前選取」保底、
   `visitedIds`、★ 前綴等 **T16 的行為全部不變**，純版面容器改變；
   唯一呼叫者是 `ItineraryTab.tsx`（已確認），Props 介面不動。
2. `src/components/trip/ItineraryTab.tsx`（行號以現檔為準，約略位置供快速定位）：
   - 表頭（`renderHead`，約 L165–184）「景點」一欄改為「類型」「都市」「景點」三欄；
     `renderRow` 內原景點 `<Td>`（約 L100–109）改為直接放 `<AttractionPicker …/>` 於 `<tr>` 之下
     （元件自帶三個 `<Td>`；React fragment 是合法的 `<tr>` 子內容）。
   - 移除「行程／活動」`Th`（約 L173）＋`Td`（約 L110–112，含其 `TextInput`）；
     `addRow` **仍寫入** `activity: ''`（型別必填、備份相容）。
   - 空狀態 `colSpan`（約 L194）12 → 13；表格 `min-w-[72rem]`（兩處）依新欄寬微調
     （估 74rem 上下，施工時自量，原則：不出現欄位互擠、也不留大片空白）。
3. **不動**：`types.ts`（`activity` 欄位保留）、`exportItinerary.ts`（舊資料 activity 照常輸出，
   新列 activity 恆空自然不輸出）、`orphanItinerary` 健檢面板的 activity 顯示、DB、備份。

**不要做**：不做 activity 資料遷移（已拍板保留原地）；不改 AttractionPicker 的過濾／保底邏輯；
不動花費頁。

**驗收**：build 全綠、既有測試不變；手動：行程表三個下拉各自成欄、無「行程／活動」欄；
每列篩選獨立運作、「目前選取」保底照常；舊資料的 activity 文字在「複製行程文字」輸出中仍可見。

---

## T30 旅程日期整批平移（P2・★★・依賴：無）

**背景／目標**：機票改期時，目前得逐列改行程日期。已拍板（2026-07-12）：提供「整趟平移 N 天」。
**平移範圍＝trip 起訖日期＋該旅程所有行程列的非空 `date`；花費列日期不動**
（付款日是歷史事實，不隨行程改期而改變）。

**規格**：
1. `src/lib/itinerary.ts` 加純函式 `shiftDateStr(date: string, days: number): string`：
   - `date` 符合 `^\d{4}-\d{2}-\d{2}$` 且 `days` 為整數 → 以本地時區 `new Date(y, m-1, d)`
     加 `days` 天再格式化回 `YYYY-MM-DD`（`padStart`；**不要**用 `new Date('YYYY-MM-DD')`，
     UTC 時區陷阱同 `datesInRange` 注意事項）。
   - 格式不合或 `days` 非整數 → 回傳原字串（含空字串——「未排日期」列不動）。
   - 測試 ≥ 5 條：+N、−N、跨月、跨年、非法輸入原樣返回。
2. `OverviewTab.tsx`：出發／回程日期的 grid 下方加「平移日期」小按鈕（`rounded border` 樣式
   比照全 App 既有小按鈕）：
   - `prompt('整趟平移天數（正數延後、負數提前）')` → `parseInt`；非有限整數或 0 ⇒ 中止。
   - `confirm` 摘要：新的起訖日期（各以 `shiftDateStr` 預算）＋「將同步平移 N 筆行程列日期
     （花費日期不變）」→ 取消 ⇒ 中止。
   - 確定 ⇒ `db.transaction('rw', db.trips, db.itinerary, ...)`：
     更新 `trip.startDate`／`endDate`（非空者才平移）＋該旅程所有行程列的非空 `date`；
     trip 的更新沿用本檔既有 `update` 慣例（約 L15：
     `db.trips.update(trip.id, { ...patch, updatedAt: now() })`，`now` 已 import）。
3. UI 用原生 `prompt`／`confirm`（同 T23 慣例，不做自訂 modal）。

**不要做**：不平移花費列日期（已拍板）；不做跨旅程批次；不做日曆選擇器。

**驗收**：test／build 全綠；手動：旅程 +2 天 → 總覽起訖與所有行程列日期皆 +2、
「未排日期」列不動、花費列日期不動；−N 天亦正常；T13 的空日補齊隨新區間即時更新。

---

## T31 行程頁手機卡片式檢視（P1・★★★・依賴：T29——欄位定案後再做，避免重工）

**背景／目標**：App 的真實使用場景是旅途中用手機看行程，但行程表 `min-w` 七十多 rem、
手機上全靠橫向捲動。已拍板（2026-07-12）：**手機體驗是本輪重點投資項**，行程頁先行。

**規格**（★★★ 大項；架構如下已拍板，視覺細節施工時可再與擁有者確認）：
1. 斷點：Tailwind `sm`（640px）**以下**改卡片式、以上維持現有表格——同一份資料兩套渲染
   （表格容器 `hidden sm:block`、卡片容器 `sm:hidden`），`useLiveQuery`／handlers／
   `addRow`／`update`／`remove` **共用，不得複製業務邏輯**；逐日分組外框、當日小計標題列、
   「＋在這天新增一列」按鈕兩種檢視皆保留。
2. 卡片＝一列行程，預設**收合**只顯示摘要行：
   - 摘要：開始–結束時間（皆空顯示灰字 `--:--`）＋景點名（`attractionId` 查表；未選顯示
     灰字「(未選景點)」）＋右側時數／外幣小計；點卡片本體展開／收合（收合狀態存 component
     state，`Set<string>` of id）。
   - 展開後：直向表單列出全部欄位——日期、開始／結束（T27 的 `TimeInput`）、
     類型／都市／景點三下拉（做法**指定**：`AttractionPicker` 加 `variant?: 'cells' | 'stack'` prop，
     預設 `'cells'`＝T29 的三個 `<Td>`、`ItineraryTab` 表格不用改呼叫；`'stack'`＝直向排列的
     三個 select 供卡片用。**內部 state／過濾／保底邏輯只有一份**，`variant` 只切換最外層版面容器）、
     時數、交通、花費、備註、連結（含 ↗）、刪除 ✕。欄位元件一律沿用 `cells.tsx`。
3. 新增列（該日「＋新增」）後自動展開該卡片，方便直接編輯。
4. 頁尾總計與「複製行程文字」按鈕在手機版照常顯示（既有 flex-wrap 微調即可）。
5. 無 schema／純函式變動——純 UI 任務；若摘要文字組合等邏輯可萃取，放 `src/lib/` 純函式＋測試（可選）。

**不要做**：不動桌面表格版面；不做拖曳排序；不動花費頁（T32 才做）。

**驗收**：build 全綠；手動（DevTools 手機模擬 390px 寬＋真機）：行程頁**無橫向捲動**、
逐日結構清楚、卡片可展開編輯所有欄位、時間輸入喚起數字鍵盤（T27）、桌面寬度下與改版前無異。

---

## T32 花費頁手機卡片式檢視（P2・★★★・依賴：T31，沿用其模式）

**背景／目標**：比照 T31 把 `ExpensesTab.tsx` 的表格在手機改卡片式。

**規格**：
1. 斷點、雙渲染、邏輯共用原則**完全比照 T31**。
2. 卡片摘要行：日期＋品項＋金額（該列幣別）；展開後直向列出全部欄位
   （日期、時間、品項、幣別、金額、手續費、付錢者、分攤、狀態、備註、刪除——
   付錢者／分攤沿用 `MemberSelect`／`ParticipantsPicker`，**僅擺放位置改變、元件不動**，
   不屬凍結區解凍範圍）。
3. 頁尾小計／總計／平均照常顯示。

**不要做**：不動桌面表格；不動分帳頁（`SettlementTab` 維持凍結）；不動任何金額計算。

**驗收**：build 全綠；手動（390px 寬）：花費頁無橫向捲動、卡片可展開編輯全部欄位、
台幣換算小計照常即時更新。

---

## T33 健檢擴充：成員孤兒參照（P3・★★・依賴：無；凍結區局部解凍）

**背景／目標**：刪除成員後，花費列的 `payerId`／`participantIds` 可能指向已不存在的成員
（CLAUDE.md「已知小限制」記載的問題）。健檢（T9）目前只查行程→景點孤兒。
已拍板（2026-07-12）：列入但**低優先（P3）**。

**規格**：
1. 新檔 `src/lib/orphanMembers.ts`：純函式
   `findOrphanMemberRefs(expenses: ExpenseItem[], members: Array<Pick<Member, 'id'>>): OrphanMemberRef[]`，
   其中 `OrphanMemberRef = { expense: ExpenseItem; orphanPayer: boolean; orphanParticipantIds: string[] }`：
   - 以 members id 建 Set；`payerId` 非空且查無 → `orphanPayer: true`；
     `participantIds` 內查無的 id 收進 `orphanParticipantIds`。
   - 兩者皆無問題的列不回傳；保留輸入順序。＋測試 ≥ 3 條（payer 孤兒、participant 部分孤兒、無孤兒空陣列）。
2. `Attractions.tsx` 的 `HealthPanel` 加第二區塊「成員參照」（鏡射既有孤兒行程區塊版型）：
   - 額外 `useLiveQuery` 讀 `db.expenses`／`db.members`（全表，沿 T5 全掃慣例）。
   - 依 `tripId` 分組列出問題列（日期／品項／問題描述，如「付錢者已刪除」「分攤含 2 位已刪成員」）。
   - 每列「清除參照」按鈕：confirm 後一鍵清該列全部孤兒——組 patch 物件：
     `orphanPayer` 為 true 時加 `payerId: ''`；`orphanParticipantIds` 非空時加
     `participantIds: 原陣列過濾掉孤兒 id 後的結果`；沒問題的欄位**不要**寫進 patch；
     最後一次 `db.expenses.update(id, patch)`。
     confirm 訊息需提醒：「清除後若分攤名單變為空，該列改為**全體均分**；付錢者清空後該列**不列入結算**。」
   - 無問題時顯示「無成員孤兒參照，資料一致。」
3. **凍結區解凍範圍（僅此）**：讀 `db.members`、寫 `db.expenses` 的 `payerId`／`participantIds`。
   `SettlementTab`／`settle()`／`MemberSelect`／`ParticipantsPicker` 一律不動。

**不要做**：不做「重新指定成員」的進階 UI（只清除）；不動行程列的 `payerId`（T17 後行程不進結算，無實害）；
不加索引。

**驗收**：test／build 全綠；手動：刪除有花費參照的成員 → 健檢列出該列 → 清除後分帳頁不再出現幽靈結餘。

---

## 觀察中／不做

- **觀察中（未排程）**：行程頁直接新增景點（picker 內開 modal）；當日景點串 Google Maps 路線；
  總覽頁旅程摘要卡；花費分類統計。
- **不做**：備份提醒（擁有者評估不需要）；匯率 API 自動抓（牴觸離線優先、增加網路依賴）。
- **凍結（保留功能與資料、暫停開發）**：分帳／成員、行李——T33 的局部修改除外（見共通守則）。
