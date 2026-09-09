# ISSUE_LIST.md — 開發任務清單

> 與專案擁有者討論收斂出的開發計畫，拆成自足任務供後續 session 逐項接手
> （接手者可能是較低階模型，因此每個任務都寫明目標、已拍板的設計決定、涉及檔案、實作步驟與驗收條件，
> 關鍵新程式碼直接附**參考實作**可照抄；**請勿重新發明設計**；
> 規格沒寫到的細節以 CLAUDE.md 慣例與現有程式風格為準）。
>
> **T1–T33 已全部完成**（2026-07-06 ～ 07-15），完整規格已歸檔——完成內容摘要見 **CLAUDE.md §7**，
> 本檔只保留其進度列。現行任務為 **T34–T39**（2026-07-17 與擁有者第四輪討論定案，
> 含連結超連結化、行程卡片摘要改版、分帳／行李手機卡片等設計均已拍板，
> 擁有者並已確認過互動示意頁）。

## 使用方式

1. **開工前必讀 `CLAUDE.md`**（專案架構、慣例、部署眉角都在那）。
2. 一個 session 建議只做一個任務；先確認「依賴」欄的前置任務已完成。
3. 完成後：`npm run test` 與 `npm run build` 必須全綠 → 更新本檔進度表（狀態改 ✅ 加日期）→
   更新 CLAUDE.md §7／§9 → commit（訊息含任務編號，例 `feat(T35): ...`）→ push 到該 session 指定的分支。
4. 規格附「參考實作」的程式碼**照抄後再依上下文微調 import 路徑即可**，不要改寫邏輯。
5. **新增新任務／需求**：先在對話中討論並確認需求內容，依功能大小與相依性分類（拆子任務／標
   `T##`／註明依賴），經開發者在對話中確認後，才對 `main` 編輯本檔（進度表加一列＋視需要補規格
   段落）、commit + push 到 `main`，不用開功能分支等 PR（詳見 CLAUDE.md §10）——這樣兩人不論誰在
   哪條分支開發，都能在 `main` 立刻看到已確認的待辦事項。**動手實作**某個任務時才切到該任務指定
   的功能分支，完成並驗證後才合併回 `main`。

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
| T25 | 同步小修：下載按鈕文字＋備份 version 升 5 | ✅ 2026-07-13 |
| T26 | Gist 上傳防覆蓋保護 | ✅ 2026-07-14 |
| T27 | 時間輸入改 24 小時制純文字（失焦正規化） | ✅ 2026-07-14 |
| T28 | 數字輸入移除上下箭頭（spinner） | ✅ 2026-07-15 |
| T29 | 行程表欄位重組：移除活動欄＋景點三下拉拆欄 | ✅ 2026-07-15 |
| T30 | 旅程日期整批平移 | ✅ 2026-07-15 |
| T31 | 行程頁手機卡片式檢視 | ✅ 2026-07-15 |
| T32 | 花費頁手機卡片式檢視 | ✅ 2026-07-15 |
| T33 | 健檢擴充：成員孤兒參照 | ✅ 2026-07-15 |

### 進行中（T34–T48，表列順序＝建議施工順序）

| # | 任務 | 優先 | 難度 | 依賴 | 狀態 |
|---|------|------|------|------|------|
| T34 | 電腦版時間欄寬修正（w-16 → w-20） | P1 | ★ | 無 | ✅ 2026-07-17 |
| T35 | 連結超連結化：`[名稱](網址)` 解析＋LinkField 元件＋行程頁套用 | P1 | ★★ | 建議 T34 後（同檔 ItineraryTab） | ✅ 2026-07-17 |
| T36 | 景點庫網址欄比照 LinkField | P2 | ★ | T35 | ✅ 2026-07-18 |
| T37 | 行程手機卡片摘要改版（金額→備註＋連結） | P1 | ★★ | T35（同檔＋用到連結顯示） | ✅ 2026-07-18 |
| T38 | 分帳頁：同行者手機卡片＋結餘表壓縮＋護照名 placeholder 移除 | P2 | ★★ | 無（凍結區局部解凍） | ✅ 2026-07-19 |
| T39 | 行李頁手機卡片 | P2 | ★★ | 無（凍結區局部解凍） | ✅ 2026-07-19 |
| T40 | 新增旅程可選「全空／從既有旅程複製」 | P2 | ★★ | 無（凍結區局部解凍） | ✅ 2026-09-07 |
| T41 | 新增旅程時強制先輸入旅程名稱與日期 | P2 | ★ | T40（同對話框） | ✅ 2026-09-07 |
| T42 | 新旅程花費預設帶入常用項目（機票×2／飯店／接駁／換匯／保險） | P2 | ★★ | T40（同建立流程） | ✅ 2026-09-07 |
| T43 | 景點庫新增改「完整表單＋確定」＋輸入框 datalist 級聯建議 | P2 | ★★ | 無 | ✅ 2026-09-07 |
| T44 | 電腦版排版微調（總覽／花費／行程欄寬＋景點庫新增表單版面） | P2 | ★★ | 無 | ✅ 2026-09-08 |
| T45 | 行程頁欄寬微調：貼近花費頁寬度、縮減橫向捲動範圍 | P3 | ★ | T44（同欄位／同表格） | ✅ 2026-09-08 |
| T46 | 行程景點下拉加入「出發地國家」（Trip 加 `originCountry`） | P1 | ★★ | 無（改到 T16 的 AttractionPicker） | ✅ 2026-09-09 |
| T47 | 景點庫新增表單：按鈕移到最下方獨立一列＋手機兩欄順序重排 | P2 | ★ | 無 | ✅ 2026-09-09 |
| T48 | 景點列表手機卡片式檢視（修「類型」欄手機被壓扁） | P1 | ★★★ | 無（建議 T47 後，同檔） | ⬜ |

## 共通守則（每個任務都適用）

- **凍結區（局部解凍）**：分帳／成員（`SettlementTab.tsx`、`money.ts` 的 `settle`／`settleByCurrency`、
  `MemberSelect.tsx`、`ParticipantsPicker.tsx`、members 表）與行李（`PackingTab.tsx`）原則上仍凍結。
  **本輪明文解凍**：T38（`SettlementTab.tsx` 的**版面層**——members 卡片化、結餘表手機壓縮、
  護照名 placeholder 移除；**不動** `settle`／`settleByCurrency`／expenses 彙整迴圈／`MemberSelect`／
  `ParticipantsPicker`）與 T39（`PackingTab.tsx` 的**版面層**）。僅限各該任務點名的檔案與範圍，
  不要順手重構或擴充凍結區的其他程式。
- 新表單欄位一律沿用 `src/components/cells.tsx` 的聚焦緩衝元件（原因見 CLAUDE.md §6）。
  **例外**：T35 的 LinkField popover 內兩個輸入框用原生 `<input>`＋local state——
  它們按「儲存」才寫回 DB、不是「即時寫入」欄位，不需要聚焦緩衝。
- 可測試的邏輯寫成 `src/lib/` 純函式＋ Vitest 測試；UI 檔案只留組裝與 DB 呼叫。
- Dexie 目前 schema 版本為 **v5**。**T34–T39 沒有任何任務需要升 Dexie 版本、也沒有任務新增資料欄位**
  ——連結沿用既有 `ItineraryItem.link`／`Attraction.url` 字串欄位，只是字串**內容**多一種
  `[名稱](網址)` 形狀（純網址與空字串照舊合法）。舊備份匯入後純網址照常顯示，零遷移。
- 手機卡片一律沿用 T31/T32 的既有模式：Tailwind `sm`（640px）斷點雙渲染
  （桌面表格 `hidden sm:block`、手機卡片 `divide-y sm:hidden`）、`expandedIds: Set<string>`
  state＋`toggleExpand(id)`、新增列後自動展開、`useLiveQuery`／handlers 兩種檢視**共用不複製**、
  空狀態雙容器（桌面表格一列＋手機置中文字）、檔尾放 local `CardField` 元件
  （抄 `ItineraryTab.tsx` 檔尾那個：`w-14` 標籤＋`flex-1` 欄位）。
- **摘要列若內含可互動元素（連結 `<a>`、勾選框），外層不可用 `<button>`**（HTML 禁止巢狀互動元素，
  React 會警告且行為不可靠）——改用
  `<div role="button" tabIndex={0} aria-expanded={expanded} onClick={...} onKeyDown={...}>`，
  `onKeyDown` 處理 Enter 與空白鍵（空白鍵要 `e.preventDefault()` 防捲動）也觸發展開；
  內部的 `<a>`／checkbox 在自己的 `onClick` 呼叫 `e.stopPropagation()` 避免同時展開卡片。
  摘要列**沒有**內部互動元素時（如 T38 成員卡片）維持 `<button>` 即可。
- 個人資料（真實景點 CSV、護照號碼等）不得進 repo；測試用合成樣本。
- 純文件 commit 訊息加 `[skip ci]`。
- 本批任務的設計決定（含取捨原因）都已與擁有者拍板並經互動示意頁確認，
  規格內標明「已拍板」者**不要改成別的做法**。

---

## T34 電腦版時間欄寬修正（P1・★・依賴：無）

**背景／目標**：T27 把時間欄改純文字輸入時欄寬從 `w-24` 縮到 `w-16`（64px），但扣掉
`Td` 內距（`px-1.5`）、輸入框內距（`px-2`）與邊框後，文字區只剩約 34px，`08:30` 五碼
被截成「08:」（擁有者截圖確認）。修正：欄寬放寬到 `w-20`（80px，文字區約 50px 夠放五碼）。

**規格**：
1. `src/components/trip/ItineraryTab.tsx`：`renderRow` 內「開始」「結束」兩個
   `<Td className="w-16">`（約 L123、L126）改 `w-20`；表格 `min-w-[74rem]`（**兩處**，
   約 L334 與 L389）改 `min-w-[76rem]`（兩欄各加 1rem）。
2. `src/components/trip/ExpensesTab.tsx`：「時間」欄 `<Td className="w-16">`（約 L74）改
   `w-20`；表格 `min-w-[68rem]`（約 L245）改 `min-w-[69rem]`。
   **注意**：同檔約 L311 的 `CardField` 標籤 `w-16` 是手機卡片的標籤寬，**不要動**。
3. 手機卡片內的 `TimeInput`（CardField 版）是 `flex-1` 不受影響，不用改。

**不要做**：不動 `cells.tsx`／`normalizeTimeText`；不改輸入框內距。

**驗收**：build 全綠、既有測試全綠；手動（桌面寬度）：行程頁開始／結束、花費頁時間欄
可完整顯示 `08:30` 五碼不被截斷。

---

## T35 連結超連結化：`[名稱](網址)` 解析＋LinkField 元件＋行程頁套用（P1・★★・依賴：建議 T34 後，同檔減衝突）

**背景／目標**：行程「連結」欄目前是常駐輸入框＋↗ 按鈕，只能存裸網址。已拍板（2026-07-17，
經互動示意頁確認）：連結欄改「**顯示可點超連結＋✎ 編輯**」——
- 存 `[google](https://google.com)` → 顯示 **google**，文字本身是超連結（新分頁、noopener）；
- 存裸網址 `https://google.com` → 顯示完整網址，同樣可點；
- 空 → 只顯示一顆灰色 ✎。
- 點 ✎ 開 popover，**兩個欄位「名稱」「連結」**，儲存時組回單一字串。
使用者永遠不用手打括號——`[名稱](網址)` 只是儲存編碼。
**儲存仍是單一 `link` 字串欄位**：不加欄位、不升 Dexie、備份／Gist 同步／`importAll` 零改動，
備份 JSON 人眼可讀。原 ↗ 按鈕退役（文字本身可點）。

**規格**：

1. 新檔 `src/lib/link.ts`，參考實作（照抄）：

   ```ts
   export type ParsedLink = { text: string; url: string }

   /**
    * 解析連結欄字串。`[名稱](網址)` → { text: 名稱, url: 網址 }；
    * 其餘非空字串整串視為網址（text 為 ''）；空／全空白 → 兩者皆 ''。
    * 錨定頭尾的貪婪正則可正確處理名稱含 `]`、網址含 `()`（如維基百科的 `Osaka_(city)`）。
    * `[名稱]()`（網址空）不視為合法格式，整串當網址處理。
    */
   export function parseLink(raw: string): ParsedLink {
     const s = (raw ?? '').trim()
     if (!s) return { text: '', url: '' }
     const m = /^\[(.*)\]\((.*)\)$/.exec(s)
     if (m && m[2].trim()) return { text: m[1].trim(), url: m[2].trim() }
     return { text: '', url: s }
   }

   /**
    * 組回儲存字串。網址空 → ''（名稱單獨存在無意義，等同清空；純文字備忘請用備註欄——已拍板）；
    * 名稱空 → 存裸網址；兩者皆有 → `[名稱](網址)`。
    */
   export function serializeLink(text: string, url: string): string {
     const t = text.trim()
     const u = url.trim()
     if (!u) return ''
     if (!t) return u
     return `[${t}](${u})`
   }

   /** 顯示文字：有名稱用名稱，否則完整網址；空字串回 ''。 */
   export function linkDisplayText(raw: string): string {
     const p = parseLink(raw)
     return p.text || p.url
   }
   ```

2. 新檔 `src/lib/link.test.ts`：≥ 10 條——
   `[google](https://google.com)` 解析、裸網址解析、空字串／全空白、
   網址含括號 `[維基](https://en.wikipedia.org/wiki/Osaka_(city))`（url 需完整含 `(city)`）、
   `[名稱]()` 整串當網址、前後空白 trim、
   `serializeLink('google','https://google.com')`、名稱空存裸網址、網址空回 `''`（名稱有值也一樣）、
   roundtrip（`parseLink(serializeLink(t,u))` 還原）、`linkDisplayText` 有名稱／無名稱兩型。

3. 新檔 `src/components/LinkField.tsx`：顯示＋popover 編輯的自足元件。
   popover 開關與「點外面關閉」手法**照抄 `ParticipantsPicker.tsx`**（`relative` 容器＋
   `useRef`＋document `mousedown` listener）。參考實作（照抄後可微調樣式）：

   ```tsx
   import { useEffect, useRef, useState } from 'react'
   import { parseLink, serializeLink } from '../lib/link'

   /**
    * 連結欄位：顯示狀態＝可點超連結（有名稱顯名稱、無名稱顯完整網址）＋ ✎；
    * 點 ✎ 開 popover 編輯「名稱」「連結」。value 為單一字串（`[名稱](網址)`、裸網址或 ''）。
    * popover 內用原生 input＋local state，按「儲存」才 onChange 寫回。
    */
   export default function LinkField({
     value,
     onChange,
   }: {
     value: string
     onChange: (raw: string) => void
   }) {
     const [open, setOpen] = useState(false)
     const [text, setText] = useState('')
     const [url, setUrl] = useState('')
     const ref = useRef<HTMLDivElement>(null)

     useEffect(() => {
       if (!open) return
       const onDoc = (e: MouseEvent) => {
         if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
       }
       document.addEventListener('mousedown', onDoc)
       return () => document.removeEventListener('mousedown', onDoc)
     }, [open])

     function openEditor() {
       const p = parseLink(value)
       setText(p.text)
       setUrl(p.url)
       setOpen(true)
     }
     function save() {
       onChange(serializeLink(text, url))
       setOpen(false)
     }

     const p = parseLink(value)
     const inputCls =
       'w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
     return (
       <div className="relative flex min-w-0 items-center gap-1" ref={ref}>
         {p.url && (
           <a
             href={p.url}
             target="_blank"
             rel="noopener noreferrer"
             onClick={(e) => e.stopPropagation()}
             className="truncate text-sky-600 underline decoration-sky-300 underline-offset-2 hover:text-sky-800"
           >
             {p.text || p.url}
           </a>
         )}
         <button
           type="button"
           title={p.url ? '編輯連結' : '新增連結'}
           onClick={(e) => {
             e.stopPropagation()
             if (open) setOpen(false)
             else openEditor()
           }}
           className="shrink-0 rounded px-1.5 py-1 text-xs text-gray-400 hover:bg-sky-50 hover:text-sky-700"
         >
           ✎
         </button>
         {open && (
           <div
             className="absolute right-0 top-full z-20 mt-1 w-64 space-y-2 rounded border bg-white p-2 shadow-lg"
             onClick={(e) => e.stopPropagation()}
           >
             <label className="flex items-center gap-2 text-sm">
               <span className="w-8 shrink-0 text-xs text-gray-500">名稱</span>
               <input
                 className={inputCls}
                 value={text}
                 placeholder="例如：官網（可留空）"
                 autoFocus
                 onChange={(e) => setText(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && save()}
               />
             </label>
             <label className="flex items-center gap-2 text-sm">
               <span className="w-8 shrink-0 text-xs text-gray-500">連結</span>
               <input
                 className={inputCls}
                 value={url}
                 placeholder="https://"
                 inputMode="url"
                 onChange={(e) => setUrl(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && save()}
               />
             </label>
             <p className="text-xs text-gray-400">
               名稱留空＝顯示完整網址；連結留空＝儲存時清除此欄。
             </p>
             <div className="flex justify-end gap-2">
               <button
                 type="button"
                 onClick={() => setOpen(false)}
                 className="rounded border px-2.5 py-1 text-xs hover:bg-gray-50"
               >
                 取消
               </button>
               <button
                 type="button"
                 onClick={save}
                 className="rounded bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-700"
               >
                 儲存
               </button>
             </div>
           </div>
         )}
       </div>
     )
   }
   ```

   已知限制（與 `ParticipantsPicker` 相同、接受）：popover 在表格 `overflow-x-auto` 容器內
   靠近邊緣時可能被裁切或觸發捲動；若在極左欄溢出可把 `right-0` 換 `left-0`，施工時目測即可。

4. `src/components/trip/ItineraryTab.tsx` 兩處套用（把「`TextInput`＋↗ 按鈕」整組換成
   `<LinkField value={it.link} onChange={(v) => update(it.id, { link: v })} />`）：
   - 桌面 `renderRow` 的連結 `<Td className="w-40">`（約 L161–179）——`Td` 與 `w-40` 保留，
     內層整個 `<div className="flex ...">` 換成 LinkField。
   - 手機卡片展開表單的「連結」`CardField`（約 L295–313）——同樣把內層 flex 換成 LinkField。
   - `addRow` 的 `link: ''` 與 DB／型別**都不動**。

**不要做**：不加 `linkText` 資料欄位（已拍板用單一字串編碼）；不做網址合法性驗證；
不自動抓網頁標題（前端跨域抓不到，已拍板名稱手動填）；不動 `exportItinerary.ts`
（匯出文字目前不含連結，維持現狀）；popover 不用 `cells.tsx` 聚焦緩衝元件（見共通守則）。

**驗收**：test／build 全綠；手動（桌面＋手機模擬）：
✎ 開 popover 填名稱＋網址 → 儲存後顯示名稱、點名稱開新分頁；只填網址 → 顯示完整網址可點；
連結欄留空儲存 → 欄位清空只剩 ✎；重開 popover 現存值正確拆回兩欄；
舊資料（裸網址）不經任何轉換直接正常顯示。

---

## T36 景點庫網址欄比照 LinkField（P2・★・依賴：T35）

**背景／目標**：擁有者拍板「其他連結也比照處理」——景點庫的「網址」欄（`Attraction.url`，
同樣是單一字串欄位）套用與 T35 相同的顯示／編輯模式。

**規格**：
1. `src/pages/Attractions.tsx` 景點列的網址 `<Td className="min-w-[10rem]">`（約 L351–369）：
   內層「`TextInput`＋↗ 按鈕（T7）」整組換成
   `<LinkField value={a.url} onChange={(v) => update(a.id, { url: v })} />`。
2. 同檔 `DedupePanel` 的網址差異顯示（約 L956–959 的 `{a.url || —}`）：
   改 `{linkDisplayText(a.url) || <span className="text-gray-300">—</span>}`
   （import 自 `../lib/link`）——比對重複景點時顯示名稱或網址，不顯示原始括號字串。
3. **不動**：`importAttractions.ts`（CSV 匯入寫入的是裸網址，本來就相容）、
   `dedupeAttractions.ts` 的 `mergeAttractionFields`（url 是不透明字串，擇優邏輯照舊）、
   `AttractionPicker`（不顯示 url，無破口）、名稱搜尋（T7 的篩選比對 name/address/notes，不含 url）。

**不要做**：不動 CSV 匯入；不做既有資料轉換（裸網址照常顯示）。

**驗收**：build 全綠、既有測試全綠；手動：景點庫網址欄可 ✎ 編輯名稱＋網址、顯示可點連結；
「整理重複」面板網址顯示的是名稱（或裸網址），不出現 `[...](...)` 原始字串。

---

## T37 行程手機卡片摘要改版：金額 → 備註＋連結（P1・★★・依賴：T35，同檔）

**背景／目標**：手機卡片收合時目前右側顯示「時數 · 外幣小計」，但旅途中看行程要的是
地點、備註與連結，錢展開再看即可。已拍板（2026-07-17，經示意頁確認）：
**收合摘要不再顯示時數與金額**（金額只在展開後的小計行），改為——
主行「時間＋景點名＋連結（可點）＋▼」、第二行灰字備註（截斷、沒備註不顯示）。
當日小計照舊留在日期標題列，桌面表格完全不動。

**規格**（全部在 `src/components/trip/ItineraryTab.tsx` 的 `renderCard`，約 L211–327）：
1. 摘要列外層由 `<button>` 改
   `<div role="button" tabIndex={0} aria-expanded={expanded} onClick={() => toggleExpand(it.id)} onKeyDown={...}>`
   （原因與 `onKeyDown` 寫法見共通守則——內部要放 `<a>`，不能巢在 `<button>` 裡）。
   原 className（`flex w-full items-center gap-2 px-3 py-2 ...` 加上 `cursor-pointer`）沿用；
   結構改為外層 div 包「主行 flex」＋「備註行」兩層，讓點備註行也能展開。
2. 主行內容：
   - 時間（既有 `timeSummary(it)`）與景點名（既有 `attractionName`）**照舊**。
   - **刪除**右側時數／外幣小計的 `<span>`（約 L236–240，`it.hours ? ... foreign ...` 那段）。
   - 原位置改放連結（`parseLink(it.link)`，import 自 `../../lib/link`）：`p.url` 非空才渲染
     ```tsx
     <a
       href={p.url}
       target="_blank"
       rel="noopener noreferrer"
       onClick={(e) => e.stopPropagation()}
       className="max-w-[7.5rem] shrink-0 truncate text-xs text-sky-600 underline decoration-sky-300 underline-offset-2"
     >
       {p.text || p.url}
     </a>
     ```
     （摘要列**不放 ✎**——編輯入口在展開後的連結欄位，該欄 T35 已換 LinkField。）
   - 展開三角 ▼／▲ 照舊放最右。
3. 備註行：`it.notes` 非空時，主行下方渲染
   `<div className="truncate pb-2 text-xs text-gray-400">{it.notes}</div>`
   （水平 padding 跟主行對齊；沒備註時不渲染、主行自己的 `py-2` 維持卡片高度）。
4. 展開後表單**不動**（T35 已把連結欄換 LinkField；小計行本來就在展開區，金額資訊不流失）。
5. `timeSummary`／`attractionName`／`expandedIds`／`toggleExpand`／桌面 `renderRow` 全部不動。

**不要做**：不動桌面表格；不動當日標題列與頁尾總計；不把時數塞回摘要（已拍板金額類全部移展開後）。

**驗收**：build 全綠；手動（390px 寬）：收合卡片顯示「時間＋景點名＋連結名＋▼」與備註第二行、
無時數／金額；點連結開新分頁**且卡片不展開**；點卡片其他處（含備註行）展開；
鍵盤 Enter／空白鍵也能展開；展開後小計照常顯示。

---

## T38 分帳頁：同行者手機卡片＋結餘表壓縮＋護照名 placeholder 移除（P2・★★・依賴：無；凍結區局部解凍）

**背景／目標**：分帳頁在手機上整頁橫向捲動。已拍板（2026-07-17）：
①「同行者」表手機改卡片式，**收合只顯示中英名**（姓名＋護照名）；
② 護照名輸入框的示範 placeholder「LIN,LIWEN」移除、留空白；
③ 結餘表（唯讀數字表）手機不橫捲、四欄自然壓縮。
**凍結區解凍範圍（僅此）**：`SettlementTab.tsx` 的版面層——`settle`／`settleByCurrency`、
expenses 彙整迴圈（含 T19 已結清過濾、T24 幣別分桶）、`MemberSelect`／`ParticipantsPicker`
一律不動；members 的讀寫沿用檔內既有 `addMember`／`updateM`／`removeM`。

**規格**（全部在 `src/components/trip/SettlementTab.tsx`）：
1. **placeholder**：護照名 `TextInput` 的 `placeholder="LIN,LIWEN"`（約 L79）整個屬性刪除。
2. **同行者卡片**（模式照共通守則／T31）：
   - 外層 `<div className="overflow-x-auto rounded-lg border bg-white">`（約 L59）拆成
     `rounded-lg border bg-white` 容器＋桌面 `<div className="hidden overflow-x-auto sm:block">`
     （原表格 `min-w-[40rem]` 照舊）＋手機 `<div className="divide-y sm:hidden">`（卡片群）。
   - 加 `expandedIds: Set<string>` state＋`toggleExpand(id)`（抄 `ItineraryTab.tsx` 約 L31–38）；
     `addMember` 在 `db.members.add(m)` 之後把 `m.id` 加入 `expandedIds`（新增即展開）。
   - 卡片收合摘要（無內部互動元素 → 用 `<button>` 即可，抄 `ItineraryTab.renderCard` 的
     `card-sum` 版型）：`{m.name || 灰字「(未命名)」}`（`flex-1 truncate`）＋
     `m.passportName` 灰字小字（`shrink-0 text-xs text-gray-500`，空就不渲染）＋▼／▲。
   - 展開後直向表單（檔尾加 local `CardField`，抄 `ItineraryTab.tsx` 檔尾）：
     姓名（`TextInput`）、護照名（`TextInput`，無 placeholder）、護照號碼（`TextInput`）、
     生日（`DateInput`）、右下 `✕ 刪除這位成員`（呼叫既有 `removeM`，樣式抄
     `ItineraryTab` 卡片的刪除鈕）。
   - 空狀態雙容器：桌面既有 `colSpan={5}` 列照舊、手機置中灰字同文案。
3. **結餘表壓縮**：結餘表 `<table className="w-full min-w-[32rem] text-sm">`（約 L142）改
   `min-w-[32rem]` → `sm:min-w-[32rem]`——手機斷點下無最小寬度、
   「成員／已付／應分攤／結餘」四欄自然壓縮同屏。表格內容、`fmt`、紅綠結餘樣式全部不動。
   「結算建議」區塊本來就是文字清單，不動。

**不要做**：不動 `settle`／`settleByCurrency`／entries 彙整；不動花費頁的
`MemberSelect`／`ParticipantsPicker`；不加成員排序／拖曳；不做護照號碼遮罩。

**驗收**：build 全綠、既有測試全綠；手動（390px 寬）：分帳頁**無橫向捲動**；
同行者卡片收合顯示「姓名＋護照名」、展開可編輯四欄與刪除、新增成員自動展開；
結餘表四欄同屏；桌面寬度下與改版前無異（除 placeholder 消失）；
結算數字與改版前完全相同（版面層任務，數字變了就是動到不該動的）。

---

## T39 行李頁手機卡片（P2・★★・依賴：無；凍結區局部解凍）

**背景／目標**：行李頁手機也改卡片式。行李的特殊點（已拍板，2026-07-17）：
**手機上最常做的動作是「邊收行李邊打勾」**——所以**勾選框在收合狀態就直接可點**
（不用先展開），點列的其他地方才是展開編輯。
**凍結區解凍範圍（僅此）**：`PackingTab.tsx` 的版面層；`addRow`／`update`／`remove`／
T21 行李繼承（在 `TripList.tsx`）一律不動。

**規格**（全部在 `src/components/trip/PackingTab.tsx`）：
1. 雙渲染（模式照共通守則）：外層 `<div className="overflow-x-auto rounded-lg border bg-white">`
   （約 L36）拆桌面（`hidden overflow-x-auto sm:block`，原表格 `min-w-[36rem]` 照舊）＋
   手機（`divide-y sm:hidden` 卡片群）；空狀態雙容器。
2. 加 `expandedIds: Set<string>`＋`toggleExpand(id)`；`addRow` 在 `db.packing.add(row)` 之後
   把 `row.id` 加入 `expandedIds`。
3. 卡片收合摘要——**內含 checkbox（互動元素），外層必須用 `div role="button"`**（見共通守則）：
   - 勾選框：沿用桌面同款 `<input type="checkbox" className="h-4 w-4 accent-sky-600" ...>`，
     `checked={it.checked}`、`onChange={(e) => update(it.id, { checked: e.target.checked })}`、
     **另加 `onClick={(e) => e.stopPropagation()}`**——點勾選框只打勾、不展開。
   - 項目名（`flex-1 truncate`）：`it.item` 空 → 灰字「(未填)」；`it.checked` 為 true →
     加 `text-gray-400 line-through`（比照桌面）。
   - 份量：`it.quantity` 非零 → 灰字小字顯示數字（`shrink-0 text-xs text-gray-500`，
     不加單位；零＝不顯示，與全 App「數字 0 顯示空白」慣例一致）。
   - ▼／▲ 最右。
   - `it.notes` 非空 → 主行下方備註行 `<div className="truncate pb-2 text-xs text-gray-400">`
     （版型同 T37 第 3 點）。
4. 展開後直向表單（檔尾 local `CardField`）：項目（`TextInput`，checked 時同樣劃線變灰）、
   份量(人)（`NumberInput`）、備註（`TextInput`）、右下 `✕ 刪除這列`。
5. 頁尾「＋新增一列」與「已勾選 X / Y」照常（既有 flex-wrap 版面不用改）。

**不要做**：不動桌面表格；不做拖曳排序；不做「點整列打勾」（已拍板：勾選框打勾、
點列展開，與其他分頁卡片行為一致）；不動 T21 繼承邏輯。

**驗收**：build 全綠、既有測試全綠；手動（390px 寬）：行李頁**無橫向捲動**；
收合狀態直接點勾選框可打勾／取消**且卡片不展開**，項目名即時劃線；
點列其他處展開可編輯；新增一列自動展開；「已勾選 X / Y」即時更新；桌面寬度下與改版前無異。

---

## T40 新增旅程可選「全空／從既有旅程複製」（P2・★★・依賴：無；凍結區局部解凍）✅ 2026-09-07

> ⚠️ 此任務為擁有者臨時提出、直接實作後補記歸檔（非第四輪原規劃）。已完成並推送
> （分支 `claude/journey-copy-or-new-6t06u2`、PR #51）。此段為事後規格紀錄。

**背景／目標**：新增旅程時，除了「全新空白旅程」外，希望能**選一個舊旅程當範本複製**，
省去每次重設國家／幣別、重打同行者、重列行李。擁有者拍板（2026-09-07）：
- 複製範圍＝**旅程基本設定＋同行者名單＋行李清單**；
- **不複製**逐日行程（itinerary）與花費（expenses——花費是歷史記帳）；
- 出發／回程**日期一律留空待填**（不帶來源日期）。

**凍結區解凍範圍（僅此）**：`TripList.tsx` 新增旅程流程——允許在建立時寫入 members／packing
（沿 T21 慣例，T21 本就明文允許 `TripList` 寫 packing；本任務再加 members）。
`SettlementTab.tsx`／`PackingTab.tsx`／`settle`／`MemberSelect`／`ParticipantsPicker` 一律不動。

**規格**（全部在 `src/pages/TripList.tsx`）：
1. 點「＋ 新增旅程」改為先開對話框（新 `adding`／`copyFromId` 兩個 `useState`）：
   頂部「建立全新空白旅程」按鈕、分隔線「或從既有旅程複製」、下方「來源旅程」`<select>`
   （列出既有旅程 name＋startDate）＋「複製並建立」按鈕（未選來源時 `disabled`）＋「取消」。
   modal 版型沿用專案既有（`fixed inset-0 z-50 ... bg-black/40`、內層 `max-w-md ... stopPropagation`）。
2. `addTrip` 重構為 `createTrip(source: Trip | null)`：
   - `source === null`：沿用原空白預設值（`name:'新旅程'`、country/city/region 空、
     JPY/日元/匯率 0.21/peopleCount 2、日期空）。
   - `source` 為某 `Trip`：複製 `country`／`city`／`region`／`currencyCode`／`currencyLabel`／
     `exchangeRate`／`peopleCount`；`name` 加「（複製）」後綴；`startDate`／`endDate` 一律 `''`。
   - 同一 `db.transaction('rw', db.trips, db.members, db.packing, ...)`：`db.trips.add(trip)` 後，
     `source` 存在時各以 `where('tripId').equals(source.id).sortBy('sort')` 讀 members／packing，
     逐筆換發 `id`、改指新 `tripId`（packing 另 `checked: false` 歸零）後 `bulkAdd`。
   - 建立後 `navigate(/trip/新id)`。
3. `openAdd()`：無既有旅程時（`!trips || trips.length === 0`）跳過對話框、直接建空白旅程。

**⚠️ 取代 T21**：此變更**取代 T21 的「自動繼承上一趟行李」**——行李（與同行者）改為
「選擇複製來源」時才帶入，「全空的」即真正全空、不再自動帶行李（符合擁有者「一個全空的」需求）。

**不要做**：不複製 itinerary／expenses；不帶來源日期；不做「選擇性勾選要複製哪些項目」的細部 UI
（範圍已由擁有者拍板固定）；不升 Dexie、不動 schema／備份格式。

**驗收**：build 全綠、既有 155 綠測試不變；手動：無旅程時點新增直接建空白；有旅程時點新增跳對話框，
選來源複製後新旅程帶到設定／同行者／行李（行李未勾選）、行程與花費為空、日期為空、名稱含「（複製）」。

---

## T41 新增旅程時強制先輸入旅程名稱與日期（P2・★・依賴：T40）✅ 2026-09-07

> 狀態：**已完成**（2026-09-07，與 T42 同批實作於 `TripList.tsx`）。

**背景／目標**：目前無論「全空」或「複製」，新旅程都是直接建立（名稱給預設值、日期留空），
使用者常忘了補。改為在 T40 的新增對話框裡**先要求輸入旅程名稱與出發／回程日期（皆必填）**，
填完且日期合法才能建立，減少「無名稱、無日期」的旅程。**此任務覆蓋 T40 原本的「日期留空待填」決定。**

**牽涉檔案**：`src/pages/TripList.tsx`（T40 的新增對話框、`createTrip`）。

**規格**：
1. T40 對話框加三個欄位（放在「全空／複製」選擇之上，兩路徑共用）：旅程名稱（`TextInput`）、
   出發日期、回程日期（`DateInput`）。
2. **名稱與兩個日期皆必填**。建立按鈕（「建立空白旅程」／「複製並建立」）在
   「名稱空 或 出發日期空 或 回程日期空 或 回程 < 出發」任一成立時 `disabled`。
   日期合法性檢查＝`endDate >= startDate`（字串 `YYYY-MM-DD` 可直接字典序比較）。
   建議在對話框內以灰字提示「回程需晚於或等於出發」，不合法時該提示轉紅、按鈕 disabled。
3. `createTrip` 改為接受使用者輸入的 name／startDate／endDate 寫入 trip，
   不再用「新旅程」預設名、也不再一律留空日期。
4. 欄位預設值（**拍板**）：
   - 全空路徑：名稱欄**預設空**（強制使用者輸入）、日期欄空。
   - 複製路徑：名稱欄預設帶「（來源名）（複製）」讓使用者可改；日期欄空、由使用者填。

**不要做**：不加行事曆選擇器（沿用既有 `DateInput`）；不動 T40 的複製範圍；名稱不做去重檢查。

**驗收**：build／既有測試全綠；手動：名稱或任一日期空、或回程早於出發時，建立按鈕不可按；
填完合法名稱＋日期後建立，新旅程即帶正確名稱與日期（總覽頁顯示一致）。

---

## T42 新旅程花費預設帶入常用項目（P2・★★・依賴：T40）✅ 2026-09-07

> 狀態：**已完成**（2026-09-07，與 T41 同批實作於 `TripList.tsx`）。

**背景／目標**：每趟旅程幾乎都會有機票、飯店、機場接駁、換匯、保險這幾筆花費。
希望**建立新旅程時（全空或複製都一樣）自動在「花費」分頁預先帶入這些空白項目**，
使用者只要填金額，不必每次重打品項名稱。可用對話框勾選開關控制是否帶入。

**預設項目（拍板，品項名稱照此文字、金額留空待填、依序）**：
1. `機票（去程）`
2. `機票（回程）`  ← 「機票來回共兩項」
3. `飯店`
4. `交通（機場接駁）`
5. `換匯`
6. `保險`

**幣別（拍板）**：全部 6 筆一律 `TWD`。

**牽涉檔案**：`src/pages/TripList.tsx`（新增對話框加勾選、`createTrip` 於同一 transaction
`bulkAdd` 這些 `ExpenseItem`）；預設清單抽成常數（放 `TripList.tsx` 檔頂或新 `src/lib/` 常數檔）。
`ExpenseItem` 型別／schema 不動（沿用既有欄位）。

**規格**：
1. 定義預設品項常數陣列（上列 6 項字串，依序）。
2. 對話框加勾選框「帶入常用花費項目（機票×2／飯店／接駁／換匯／保險）」，
   **預設為勾起**；此勾選同時作用於「全空」與「複製」兩路徑。以 `useState<boolean>(true)` 保存。
3. `createTrip` 依勾選值決定是否帶入：勾起 → 在 `db.trips.add` 後、同一 transaction
   `db.expenses.bulkAdd` 這 6 筆（`id` 各 `newId()`、`tripId` 為新旅程、`item` 為品項名、
   `currency:'TWD'`、`sort` 依序遞增、`amount`/`fee` 為 0、`paid:false`、`paidBy:''`、
   `paymentStatus:''`、`notes:''`，`payerId`/`participantIds` 留未設＝全體均分）；
   未勾 → 完全不帶入。
4. 交易表加入 `db.expenses`（T40 現為 `db.trips, db.members, db.packing`，改為四表）。
5. 複製路徑：T40 不複製來源花費，故這 6 筆（若勾起）照常帶入、不會與複製資料重複。

**與 T41 的關係**：兩者都改 T40 同一個對話框與 `createTrip`。若一起做，對話框由上而下為
名稱／出發／回程（T41）＋全空／複製選擇（T40）＋「帶入常用花費項目」勾選（T42）。
先做哪個都行；後做者需留意合併同一 `createTrip` 簽章。

**不要做**：不做「花費範本管理 UI」（本任務只是硬編的預設清單＋開關）；不做逐項幣別；
不動分帳邏輯；不升 Dexie／不動 schema。

**驗收**：build／既有測試全綠；手動：勾選狀態下新建旅程（全空與複製）後花費分頁即出現這 6 筆
台幣空白項目、順序正確、可正常編輯與刪除；取消勾選則新旅程花費為空；台幣小計/總計/平均照常運作。

---

## T43 景點庫新增改「完整表單＋確定」＋輸入框 datalist 級聯建議（P2・★★・依賴：無）

> 狀態：**已完成**（2026-09-07 實作，全 155 綠、build 通過）。

**背景／目標**：目前景點庫的新增流程有兩個痛點：
1. 右上新增區只帶「國家／都市／區域／類型」，按「＋新增景點」會**立刻**在樹裡插入一列**空白**景點，
   使用者得再到樹狀表格裡就地補景點名／地址／網址／備註／優先度——資料還沒填完就已進資料庫。
2. 新增區的國家／都市／區域是**純文字框、無建議**（只有下方「篩選」列才有 datalist 級聯建議）。

擁有者拍板（2026-09-07）：
- **新增改「填完整再確定」**：新增區做成完整表單（含景點名／地址／網址／備註／優先度），
  全部填好按「確定新增」才寫入，不再先插空白列。**景點名稱必填**（空白時按鈕 disabled）。
  成功後**保留國家／都市／區域**（方便連續新增同區景點）、清空其餘欄位。
- **三個輸入框加 datalist 級聯建議**：國家／都市／區域比照「篩選」列跳出景點庫既有值，
  國家→都市→區域級聯（沿用既有 `getLocationOptions`）。**只給建議清單、不自動代入**。

**性質**：純 UI／流程調整，**單一檔案** `src/pages/Attractions.tsx`。
無 schema、無 `src/lib` 純函式、無 CSV／備份變動。

**規格**（全部在 `src/pages/Attractions.tsx`）：

**A. 新增區改成完整表單（需求 1）**
1. **State**：既有 `newCountry / newCity / newDistrict / newType` 補上
   `newName / newAddress / newUrl / newNotes`（string，預設 `''`）與 `newPriority`（number，預設 `0`）。
2. **改寫 `addRow()`**（約 L159–173）：
   - 開頭防呆 `if (!newName.trim()) return`。
   - `name / address / url / notes / priority` 由硬寫空字串／0 改為寫入對應 state（`name` 記得 `.trim()`）。
   - `db.attractions.add(a)` 之後清空 `newName / newType / newAddress / newUrl / newNotes / newPriority`，
     **保留** `newCountry / newCity / newDistrict`。
3. **改寫右上新增區版面**（約 L409–474）：在「國家／都市／區域／類型」後補
   「景點名稱／地址／網址／備註／優先度」欄位，一律沿用 `cells.tsx`（`TextInput`；優先度用既有 `PriorityStars`）。
   欄位變多，新增區由單排 flex 改為一個小區塊（標題「新增景點」＋欄位換行排列），維持頁面上方原位置。
   「＋新增景點」按鈕文字改「確定新增」，`newName.trim()` 為空時 `disabled`，旁附灰字「請先輸入景點名稱」。
   「匯入 CSV／整理重複／健檢」三顆按鈕位置與行為**不動**。

**B. 三個輸入框加 datalist 級聯建議（需求 2）**
4. 國家／都市／區域三個 `TextInput` 加 `list={...}` 指向三個 `<datalist>`，用獨立 id
   （例 `new-countries / new-cities / new-districts`，避開篩選列的 `fl-*`）：
   - 國家：`opts.countries`
   - 都市：`newCountry ? (opts.citiesByCountry.get(newCountry) ?? []) : 全庫都市去重＋zh-Hant 排序`
   - 區域：`(newCountry || newCity) ? (opts.districtsByCityKey.get(\`${newCountry}${SEP}${newCity}\`) ?? []) : 全庫區域去重＋zh-Hant 排序`
   - 級聯行為與現有「篩選」列**完全一致**（`getLocationOptions` 既有、不改）；只給建議、不自動代入。
   - `TextInput` 已支援 `list` prop（見 `cells.tsx`），**不需改 `cells.tsx`**。

**不要做**：不動樹狀表格既有景點的就地編輯／搬移／刪除防護（T5）／已去過 ✓（T15）／
網址欄 LinkField（T36）；不動篩選列、`DedupePanel`、`HealthPanel`、`getLocationOptions`、
資料模型、備份、CSV 匯入、其他分頁；不做「打半個字都市即時縮」（沿用現有「選到完整國家名才級聯」的一致行為）。

**驗收**：`npm run test`（155）與 `npm run build`（含 `tsc --noEmit`）全綠；手動——
填完整表單按「確定新增」→ 樹裡直接出現已填好的景點（非空白列）；景點名空白時按鈕不可按；
新增成功後國家/都市/區域保留、其餘清空可續新增；國家框打「日」跳「日本」建議，
選「日本」後都市框跳該國家既有都市（如大阪）、區域框跟著級聯。

---

## T44 電腦版排版微調（總覽／花費／行程欄寬＋景點庫新增表單版面）（P2・★★・依賴：無）✅ 2026-09-08

> 狀態：**已完成**（2026-09-08）。純版面／CSS 寬度調整，無 schema、無 `src/lib` 純函式、無資料變動。
> 擁有者提供多張截圖逐項確認，細節見下；實作結果與下方規格的差異記於各節末尾「實作結果」。

**背景／目標**：擁有者逐頁檢視電腦版（桌面寬度）介面，指出多處欄位寬度不合理——
不是太寬浪費空間、就是太窄導致文字被截斷（尤其時間欄 `HH:MM` 常態性被切字）。
本任務彙整四個畫面的排版微調，**皆為 CSS／JSX 版面調整，不動任何商業邏輯／資料流**。

### A. 總覽頁（`OverviewTab.tsx`）

現況：
- 出發日期／回程日期 為 `grid grid-cols-2`（約 L112–119）獨立一行；「平移日期」按鈕（約 L120–131）
  另起一行、下方灰字說明再一行。
- 外幣名稱／外幣代碼 為 `grid grid-cols-2`（約 L132–147）一行；匯率（對台幣）
  又是獨立的 `grid grid-cols-2`（約 L148–152，只用掉一格）另一行。

**變更**：
1. 「出發日期」「回程日期」「平移日期」三者併同一行、平均三等分（例如
   `grid grid-cols-3 gap-3`，第三格放平移日期按鈕＋維持原按鈕樣式；下方灰字說明另起一行、
   不佔格）；出發／回程日期的 `DateInput` 隨欄寬縮窄（沿用共通日期欄寬，見 D 節）。
2. 「外幣名稱」「外幣代碼」「匯率（對台幣）」三者併同一行、平均三等分
   （`grid grid-cols-3 gap-3`），取代現有兩個 `grid grid-cols-2`。
3. 其餘欄位（旅程名稱、國家／都市）與說明文字不動。

### B. 花費頁（`ExpensesTab.tsx`）

現況：日期 `<Td className="w-32">`（約 L71）＋時間 `<Td className="w-20">`（約 L74，T34 已從
`w-16` 放寬）。擁有者截圖仍看到時間輸入中與 placeholder 的 `HH:MM` 最後一碼被切掉一點。

**變更**：
4. 日期欄再縮窄一些（釋出的寬度分給時間欄），讓時間欄的 `HH:MM`（含輸入中與 placeholder）
   完整顯示、不被截斷。實際寬度數字由實作時桌面瀏覽器目測微調決定（不是本規格鎖死某個
   px/rem 值），但**日期欄與時間欄的最終寬度需與行程頁一致**（見 D 節）。
5. 手機卡片版（`CardField` 內的 `TimeInput`/`DateInput`，`flex-1`）不受影響、不用改。

### C. 行程頁（`ItineraryTab.tsx` ＋ `AttractionPicker.tsx`）

現況（`renderRow`，約 L119–170）：日期 `<Td className="w-32">`（L122）、開始／結束時間各
`<Td className="w-20">`（L125、L128）、時數 `<Td className="w-20">`（L139，內為 `NumberInput`）。
`AttractionPicker.tsx`（`variant='cells'` 分支，約 L138–144）：類型 `<Td className="w-20">`、
都市 `<Td className="w-24">`；都市下拉的「全部」選項文字目前是 `全部都市`（約 L92）。

**變更**：
6. 日期欄改用與 B 節相同的**固定較窄寬度**（見 D 節），不要目前的 `w-32`。
7. 開始／結束時間欄改用與 B 節相同的**固定寬度**，需完整顯示 `HH:MM`（見 D 節）。
8. 類型欄（`AttractionPicker.tsx` L140）固定寬度，需完整顯示 2 個中文字（如「全部」「景點」）
   不被截斷；目前 `w-20` 是否足夠由實作時目測微調。
9. 都市欄（`AttractionPicker.tsx` L141）：
   - 選項文字「全部都市」（L92）改成「全部」。
   - 欄寬固定，需完整顯示 4 個中文字（如都市名「東京都」＋緩衝，或篩選詞「全部」對齊類型欄）
     不被截斷；目前 `w-24` 是否足夠由實作時目測微調。
10. 時數欄（`Td` L139）縮小，只要能放下 2 個英文字元大小（例如 `12`）即可，不需要目前
    `w-20` 這麼寬——注意 `hours` 是 `NumberInput`（可能到兩位小數，如 `1.5`），縮小時留意
    小數點與 2 位小數仍可讀（不強制縮到剛好 2 碼，只要求比現況明顯窄）。

### D. 全站共通：日期／時間欄寬統一

11. **日期欄固定寬度**與**時間欄固定寬度**這兩組數值，全站只訂一份、各處共用
    （目前花費頁與行程頁的日期欄、時間欄已經都是 `w-32`／`w-20`，數字相同但各自寫在
    各檔案裡；本次 B、C 節縮窄後的新數字，也要讓花費頁與行程頁維持一致，不要兩邊各自
    調出不同結果）。**建議做法**（實作時可視情況調整，非強制）：在 `cells.tsx` 或一個小型
    共用常數（例如 `export const DATE_COL = 'w-24'`／`TIME_COL = 'w-16'` 之類）集中定義，
    `ExpensesTab.tsx`／`ItineraryTab.tsx` 的日期／時間 `<Td>` 都引用同一個 class 字串，
    避免以後其中一處改了、另一處忘記同步改。
12. 未來任何新增的日期／時間輸入欄位，比照套用同一組寬度（寫進共通守則供之後任務遵守）。

### E. 景點庫頁（`Attractions.tsx`）新增景點表單版面

現況（約 L470–578，`grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3`）：
- 第一排：國家／都市／區域
- 第二排：類型／**景點名稱**／**詳細地址**
- 第三排：網址／備註／優先度
- 「確定新增」按鈕在九宮格**下方獨立一列**（L567–577）

**變更**：
13. 「景點名稱」「詳細地址」從第二排移到與「網址」「備註」「優先度」同一排
    （即目前第三排的位置，變成五個欄位：可視覺分兩行呈現，例如新第二排＝
    網址／景點名稱／詳細地址，新第三排＝備註／優先度／(空)，實際排列順序由實作時
    決定，只要求「景點名稱、詳細地址」與「網址、備註、優先度」視覺上同屬一組即可）。
14. 「確定新增」按鈕從獨立一列移到目前「詳細地址」原本所在的格子位置（第二排第三格）；
    按鈕的 `disabled`（`newName.trim()` 為空時不可按）與「請先輸入景點名稱」提示文字邏輯不變，
    只是位置從九宮格下方移進格子裡。
15. 「類型」欄位仍留在原位置（第二排第一格）。
16. datalist 級聯建議（T43）、`addRow` 邏輯、成功後保留國家/都市/區域清空其餘欄位——
    全部不動，純粹是視覺排列調整。

### 不要做

- 不動任何 `src/lib` 純函式、資料模型、Dexie schema、備份格式。
- 不動 `settle`／`MemberSelect`／`ParticipantsPicker`／分帳與行李頁（本任務未提及這兩頁，
  維持凍結）。
- 不改變任何欄位的資料語意或驗證邏輯，純粹是欄寬與版面排列。
- 手機卡片版面（T31/T32/T37/T38/T39 已完成的部分）不在本任務範圍內，不要順手調整。

### 驗收

- `npm run test` 與 `npm run build` 全綠。
- 手動（桌面寬度）：
  - 總覽頁：出發／回程日期／平移日期同一行三等分；外幣名稱／代碼／匯率同一行三等分。
  - 花費頁：時間欄 `HH:MM`（含 placeholder）完整不截斷。
  - 行程頁：日期欄變窄；開始／結束時間 `HH:MM` 完整不截斷；類型欄完整顯示「全部」等
    兩字詞；都市欄選項文字為「全部」（非「全部都市」）且都市名不被截斷；時數欄明顯變窄。
  - 花費頁與行程頁的日期欄寬、時間欄寬視覺上一致。
  - 景點庫新增表單：景點名稱／詳細地址與網址／備註／優先度同組；確定新增按鈕位於原
    詳細地址位置；datalist 建議與新增邏輯行為不變。

### 實作結果（2026-09-08）

- **D 節共用常數**：採納建議做法，`src/components/cells.tsx` 新增
  `export const DATE_COL_CLASS = 'w-24'`／`export const TIME_COL_CLASS = 'w-28'`，
  `ExpensesTab.tsx`／`ItineraryTab.tsx` 的日期／時間 `<Td>` 都改引用這兩個常數。
- **關鍵技術發現（表格 auto table-layout 會壓縮欄寬，不能只改 `<Td>` 的 class）**：
  `ItineraryTab`／`ExpensesTab` 的 `<table>` 都沒有 `table-layout: fixed`，瀏覽器用預設的
  auto 演算法決定每欄實際寬度——`<Td>` 上的 Tailwind `w-*` 只是「提示」，真正欄寬還要看：
  (1) 該欄最寬 cell 的**內容最小寬度**（原生 `<input type="date">` 在表格情境下有瀏覽器
  內建的最小內容寬度，實測約 162px，即使 `<Td>` 指定更窄的 class 也無法再壓縮）、
  (2) 表格總寬（`min-w-[Xrem]` 是下限，`w-full` 又受外層 `overflow-x-auto` 容器寬度影響）
  是否足夠讓每欄都達到各自的 hint 寬度——若各欄 hint 總和超過表格實際寬度，瀏覽器會把
  「有彈性」的欄位（文字輸入、下拉選單）壓縮到 hint 以下（用 Playwright 實測到時間欄
  `w-28`＝112px 在原表格寬度下只拿到 ~77–82px，導致 `HH:MM` 仍被裁切），但「沒彈性」的
  日期欄反而會被撐大到超過其 `w-24` hint（因為原生 date input 的最小內容寬度比 hint 大）。
  **修法**：不改表格為 `table-layout: fixed`（風險較高、牽動 13／12 欄既有其他任務的版面），
  改為把表格的 `min-w-[Xrem]` 調大到「各欄 hint 寬度＋日期欄實測最小寬度（約 162px）之總和」
  以上，讓 auto-layout 不需要壓縮任何一欄：
  - `ItineraryTab.tsx` 兩處 `min-w-[76rem]` → `min-w-[96rem]`。
  - `ExpensesTab.tsx` 的 `min-w-[69rem]` → `min-w-[84rem]`。
  調整後用 Playwright 量測每欄實際 `getBoundingClientRect().width`，確認日期／時間／類型／
  都市欄都達到（或超過）各自的 Tailwind class 數值，`HH:MM`／「全部」皆完整顯示不截斷
  （見下方各欄最終 class）。代價：兩個表格整體變寬，桌面寬度下更容易觸發既有的
  `overflow-x-auto` 橫向捲動——這是既有機制（改版前已會捲動），只是捲動範圍變大，
  非本任務新增行為。
- **A 節（總覽頁）**：完全依規格實作，`grid grid-cols-3 gap-3` 兩組；「平移日期」按鈕
  對齊用 `<Field label="">` 包裹（空字串仍佔滿與其他 label 相同的高度，維持三欄下緣切齊）。
  下方「機票改期時…」灰字說明移到 grid 外單獨一行。
- **B／C 節最終欄寬**：`DATE_COL_CLASS='w-24'`、`TIME_COL_CLASS='w-28'`（花費頁／行程頁一致，
  D 節要求）；行程頁類型欄 `w-20→w-24`、都市欄 `w-24→w-28`（`AttractionPicker.tsx`）、
  都市「全部都市」→「全部」；時數欄 `w-20→w-14`。實際 rem 數字與規格草稿的例子
  （如 D 節提到的 `TIME_COL='w-16'`）不同，因為草稿只是舉例、非鎖定值，且如上述发現
  auto-layout 會壓縮，需要比「文字本身所需寬度」更寬的 class 才能在實際表格中達標。
- **E 節（景點庫新增表單）**：依規格實作，新排列為：第一排 國家／都市／區域；
  第二排 類型／(空白格)／確定新增按鈕（原「詳細地址」格）；第三排 景點名稱／詳細地址／網址；
  第四排 備註／優先度。空白格用 `<div aria-hidden="true" />` 占位（純版面留白，無語意）。
  按鈕改用 `flex flex-col justify-end` 讓「請先輸入景點名稱」提示文字能疊在按鈕下方、
  對齊其他欄位的視覺高度。`addRow`／datalist 級聯／成功後保留國家都市區域——皆未動。
- 手動以 Playwright（Chromium）在 1400px 寬視窗驗證：總覽頁三欄對齊；花費頁／行程頁
  `HH:MM` 與「全部」完整顯示不截斷；景點庫新增表單填完整後「確定新增」可正常寫入、
  國家/都市保留、其餘欄位清空。`npm run test`（155）與 `npm run build` 全綠。

### 第二輪修正（2026-09-08，擁有者看截圖後回饋三點）

擁有者看過第一輪截圖後提出三項調整，皆已修正並用 Playwright 重新截圖確認：

1. **「平移日期」按鈕與日期輸入框沒有切齊**：原因是 `<Field label="">` 傳入**空字串**，
   瀏覽器對完全沒有文字內容的 `<span>` 可能不產生與有文字時相同高度的 line box，導致
   空 label 那格比「出發日期」「回程日期」的 label 矮一點、按鈕因此往上偏移。修法：
   `OverviewTab.tsx` 改傳 `<Field label=" ">`（一個空白字元，非空字串），確保三個 label
   span 都有實際文字內容、line box 高度一致，按鈕與日期輸入框頂端切齊。
2. **時間欄 `w-28`（112px）比「剛好顯示 `HH:MM`」還寬，留了太多空白**：用 Playwright
   `canvas.measureText` 量測 `HH:MM` 在 14px 系統字型下實際文字寬度約 47.4px；扣掉
   `Td` 內距（12px）＋輸入框內距（16px）＋邊框（2px）＝ 30px 固定開銷，`w-24`（96px）
   可留 66px 文字區（約 19px 緩衝，足夠不裁切又不會太空）比 `w-28` 更貼近「剛好顯示」。
   `src/components/cells.tsx` 的 `TIME_COL_CLASS` 由 `'w-28'` 改回 `'w-24'`（`DATE_COL_CLASS`
   維持 `'w-24'` 不變）。因為 T44 第一輪已把兩個表格的 `min-w`（`ItineraryTab.tsx` 96rem、
   `ExpensesTab.tsx` 84rem）加大到「不需壓縮任何一欄」的程度，縮小這個 class 會直接等比例
   縮小實際渲染寬度（不會像最初 w-20/w-24 時被 auto-layout 壓縮到更小），驗證後 `HH:MM`
   仍完整顯示、且視覺上不再有多餘留白。
3. **景點庫新增表單版面**：擁有者提出更明確的比例規格（取代第一輪的「四排」版面）：
   - 第一排 5 項、各佔 1/5：國家／都市／區域／類型／確定新增。
   - 第二排 3 項：景點名稱（1/5）／詳細地址（2/5）／網址（2/5）。
   - 第三排 2 項：備註（2/5）／優先度（3/5）。
   `src/pages/Attractions.tsx` 的新增景點表單容器改為
   `grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-5`（桌面 5 欄），國家／都市／區域／類型／
   確定新增五個欄位皆不加 `col-span`（各佔預設 1 欄＝1/5，桌面下剛好排滿第一排）；
   景點名稱不加 span（1/5），詳細地址與網址各加 `sm:col-span-2`（2/5，排滿第二排）；
   備註加 `sm:col-span-2`（2/5），優先度加 `sm:col-span-3`（3/5，排滿第三排）。手機
   （`grid-cols-2`，未觸發 `sm:` 前綴）退回每列 2 欄的自然換行，未特別設計但可用。
   `addRow`／datalist 級聯／`disabled` 邏輯與確定新增按鈕的 `flex flex-col justify-end`
   對齊寫法——皆未動，純調整 class 與 DOM 排列順序。

驗證：`npm run test`（155 綠）與 `npm run build` 全綠；Playwright 截圖確認三項修正後的
桌面畫面（1400px）：平移日期按鈕與日期框頂端切齊、時間欄 `HH:MM` 貼齊顯示無多餘空白、
景點庫新增表單依 5/2/2 比例排列；新增景點功能（填名稱＋確定新增→寫入、保留國家都市、
清空其餘欄位）重新測試通過。

### 第三輪修正（2026-09-08，擁有者再看花費頁截圖回饋四點）

擁有者針對花費頁再提出四點，核心訴求是「整行盡量不要橫向捲動」：

1. **時間欄再縮小**：`cells.tsx` 的 `TIME_COL_CLASS` 由 `'w-24'` 再縮到 `'w-20'`（80px）——
   花費頁與行程頁（共用常數）都套用；Playwright 截圖確認 `HH:MM` 在兩頁皆仍完整顯示。
2. **幣別欄縮小**：`ExpensesTab.tsx` 幣別 `<Select>` 的 `<Td>` 由 `w-24` 改 `w-20`，
   「台幣」／幣別代碼（如 `JPY`）＋下拉箭頭仍完整顯示。
3. **金額／手續費／小計三欄同尺寸縮小**：三欄統一改 `w-20`（金額、手續費，皆為
   `NumberInput`）／`w-16`（小計，純文字顯示、無輸入框內距與邊框開銷，可比另兩欄更窄）。
4. **整行盡量不捲動**：發現頁面外層 `App.tsx` 的 `max-w-6xl`（72rem）容器扣除左右
   padding 後，實際可用寬度固定約 1118px（**與瀏覽器視窗寬度無關**——只要視窗寬度
   ≥ 該容器所需的 ~72rem+padding，容器就不會再變寬，因此把桌面調得多寬都沒用，
   問題出在「欄位總寬度總和」有沒有小於等於 1118px）。原表格欄位總和（含①②③縮小後）
   仍超出 1118px 約 60px，用 Playwright 量測後額外微調：付錢欄（`MemberSelect`）
   `w-24→w-20`（該元件內部本就寫死 `min-w-[5rem]`＝80px 的安全下限，改到 `w-20`＝80px
   剛好貼齊、不算過度壓縮）；備註欄 `min-w-[8rem]→min-w-[7rem]`。**景點名稱欄
   （項目欄）維持原本 `min-w-[8rem]` 不變**——原本嘗試也一併縮小到 `min-w-[7rem]`，
   但發現 T42 預設花費項目「交通（機場接駁）」（8 個全形字）在更窄的欄位下方無法完整
   顯示（滑鼠點進去仍可看到完整文字、資料本身沒有遺失，只是視覺上被裁切）；
   由於這是輸入資料本身的顯示問題、且此欄位並非本輪擁有者要求縮小的欄位，故改為
   保留原寬度、改在別處（付錢欄、備註欄）找回所需的縮減量，避免產生新的視覺缺陷。
   最終加總後花費頁整行寬度剛好落在容器可用寬度（1118px）之內、`min-w-[84rem]`
   降為 `min-w-[69rem]`，**桌面上完全不需要橫向捲動**（Playwright 於 1280px／1366px／
   1400px 三種視窗寬度分別量測 `scrollWidth === clientWidth`，皆為 `false`／不需捲動）。
   行程頁欄位較多（13 欄，含三段式景點選擇器與連結欄），本輪未要求做到「零捲動」，
   仍保留橫向捲動（`min-w-[96rem]` 隨 D 節共用時間欄縮寬同比例降為 `min-w-[90rem]`，
   避免縮時間欄後備註／景點欄意外被撐得更寬、但不強行壓到零捲動）。

驗證：`npm run test`（155 綠）與 `npm run build` 全綠；Playwright 於 1280/1366/1400px
三種視窗寬度確認花費頁整行無需橫向捲動即可完整顯示；各欄位（時間、幣別、金額、
手續費、小計）zoom 截圖確認文字不被裁切；行程頁時間欄同步變窄且 `HH:MM` 仍完整顯示。

---

## T45 行程頁欄寬微調：貼近花費頁寬度、縮減橫向捲動範圍（P3・★・依賴：T44，同欄位／同表格）

**背景／目標**：T44 完成後行程頁（13 欄）仍保留橫向捲動。與擁有者逐欄討論（2026-09-08，
對照花費頁 T44 第三輪已定案的最終欄寬）拍板以下 8 個欄位縮寬。依 Tailwind class 加總估算，
套用全部變更後行程頁欄位總寬仍比容器可用寬度（≈1118px，見 T44 第三輪筆記）多出約
50–60px——**無法完全消除橫向捲動**，但可把目前的捲動幅度大幅縮小（估算比 T44 完成時減少
約 100px+）。此為已知取捨、不強求零捲動。

**規格**：

1. `src/components/AttractionPicker.tsx`（`variant='cells'` 分支，供桌面表格用）：
   - 類型 `<Td className="w-24">`（約 L140）→ `w-20`（貼齊花費頁「幣別」欄）。
   - 都市 `<Td className="w-28">`（約 L141）→ `w-24`。
   - 景點 `<Td className="min-w-[14rem]">`（約 L142）→ `min-w-[12rem]`。
2. `src/components/trip/ItineraryTab.tsx`（`renderRow`）：
   - 交通(日元) `<Td className="w-24">`（約 L152）→ `w-20`（貼齊花費頁「金額」欄）。
   - 花費(日元) `<Td className="w-24">`（約 L158）→ `w-20`（貼齊花費頁「手續費」欄）。
   - 小計(日元) `<Td className="w-24 text-right font-medium tabular-nums">`（約 L164）→
     `w-16`（貼齊花費頁「小計」欄）。
   - 備註 `<Td className="min-w-[8rem]">`（約 L170）→ `min-w-[7rem]`（貼齊花費頁備註欄）。
   - 連結 `<Td className="w-40">`（約 L173）→ `w-28`。
3. **表格 `min-w` 需同步調降**（關鍵！見 T44「實作結果」的技術發現：`<table>` 是預設
   auto table-layout，`min-w-[90rem]` 是表格的硬性下限——只改 `<Td>` 的 class、不調這個
   下限，瀏覽器仍會把多出的空間分回各欄，欄寬不會真的變窄）。`ItineraryTab.tsx` 兩處
   `min-w-[90rem]`（約 L335、L390）需一併調降；實作時用 Playwright 量測各欄實際
   `getBoundingClientRect().width`，抓「調整後各欄 hint 寬度總和」附近的值，
   不要調到比總和還窄（否則又會被壓縮出現裁切，尤其景點下拉選項文字與連結顯示文字）。

**不要做**：不動花費頁欄寬（`ExpensesTab.tsx` 已在 T44 第三輪調到最終值，不在本任務範圍）；
不動 `AttractionPicker` 的 `variant='stack'`（手機卡片）分支；不動 T37 手機卡片摘要版面；
不追求「完全不橫向捲動」（差距已知約 50–60px，擁有者已接受）；不動任何 `src/lib` 純函式、
資料模型、Dexie schema、備份格式。

**驗收**：`npm run test` 與 `npm run build` 全綠；手動（桌面寬度，建議用 Playwright 量測）：
- 類型／都市／景點／交通／花費／小計／備註／連結八欄變窄，但文字不被截斷（尤其
  景點下拉選項的 ★／✓ 前綴、常見全形品項名稱、連結顯示文字）。
- 行程頁橫向捲動範圍較 T44 完成時明顯縮小。
- 桌面 1280/1366/1400px 三種視窗寬度下無新增的文字裁切問題；花費頁不受影響。

### 實作結果（2026-09-08）

依規格完成 8 欄變更：`AttractionPicker.tsx`（`variant='cells'`）類型 `w-24→w-20`、
都市 `w-28→w-24`、景點 `min-w-[14rem]→min-w-[12rem]`；`ItineraryTab.tsx` `renderRow`
交通(日元) `w-24→w-20`、花費(日元) `w-24→w-20`、小計(日元) `w-24→w-16`、
備註 `min-w-[8rem]→min-w-[7rem]`、連結 `w-40→w-28`；表格 `min-w-[90rem]`（兩處）
同步調降為 `min-w-[80rem]`。

用 Playwright（Chromium，1280/1366/1400px 三種視窗寬度）建立測試旅程＋一筆行程列
（刻意用較長景點名「大阪城公園（賞櫻名所．周邊）」與較長備註文字模擬真實使用情境）
量測每欄 `getBoundingClientRect()` 與 `scrollWidth` vs `clientWidth`：**全部 13 欄
`clipped: false`**，即使加長備註文字重測一次仍無裁切（`<input>` 本身會內部捲動、
不會視覺裁切；真正有「最小內容寬度」限制的只有原生 `<input type="date">`——實測
約 162px，比 `DATE_COL_CLASS='w-24'`＝96px 的 hint 大，瀏覽器會自動把該欄撐到
162px，這點與 T44 的發現一致）。

容器可用寬度實測固定 **1118px**（與 T44 筆記一致）；調整後表格總寬 **1280px**
（= 新 `min-w-[80rem]`，且恰好貼近各欄自然內容需求總和，沒有多餘留白），
與可用寬度的差距由 T44 完成時的 **322px**（`min-w-[90rem]`=1440px）縮小到
**162px**，橫向捲動範圍縮減近半；仍非零捲動（13 欄含三段式景點選擇器＋連結欄，
與 T44 當初評估一致，未強求）。

未動花費頁（`ExpensesTab.tsx`）、`AttractionPicker` 的 `variant='stack'`（手機卡片）、
`renderCard`（T37 手機摘要）；`npm run test`（155 綠）與 `npm run build` 全綠。

---

## T46 行程景點下拉加入「出發地國家」（P1・★★・依賴：無；改到 T16 的 AttractionPicker）✅ 2026-09-09

**背景／目標**：T16 把 `AttractionPicker` 的國家**完全鎖死**成旅程的目的地國家（`trip.country`），
於是「出發地」的景點——桃園機場、機場捷運、台北車站、國內接駁點——在行程頁的景點下拉裡
**永遠選不到**，但這些正是每趟旅程第一列與最後一列會用到的東西（擁有者回報）。

**已拍板的設計決定（2026-09-09 討論，勿重新設計）**：

1. `Trip` 新增欄位 **`originCountry`**（出發地國家），總覽頁多一個下拉／datalist 欄位。
2. 讀取一律 `trip.originCountry ?? '台灣'`——**舊資料／舊備份沒有此欄 ⇒ 視為「台灣」**
   （台灣使用者的預設情境，升級後立刻可用，不必逐趟補填）；使用者**手動清成空字串**則
   視為「不設出發地」，行為退回目前（只剩目的地國家）。`??` 只吃 undefined，兩者可區分。
3. **不升 Dexie 版**（新欄位無索引，同 T2 加 `trip.country`／T18 加 `endTime` 的先例）；
   `backup.ts`／備份格式**零改動**（整物件序列化）。
4. **幣別／匯率自動帶入只看目的地國家**——`onCountryChange` 完全不動，改出發地國家不會動到
   `currencyCode`／`currencyLabel`／`exchangeRate`，也不清空都市。
5. Picker 的國家**仍然鎖死**，只是從「一國」變成「目的地＋出發地兩國」——**不**把 T16 拿掉的
   國家下拉加回來；未分類（`country` 為空）的景點依舊選不到（維持 T16「先去景點庫用未分類
   節點批次補國家」的工作流）。
6. 都市下拉在兩國各自都有都市時用 **optgroup 分「目的地（日本）／出發地（台灣）」兩組**；
   只有一國有都市（或兩國同名、或出發地留空）時**不分組**，畫面與現在完全一樣。
7. **已知小限制**：都市過濾是「以都市名稱字串比對」，若目的地與出發地兩國有**同名都市**，
   選該都市會同時列出兩國的景點——罕見，不處理（景點下拉的 optgroup 這時會顯示完整
   `國家 · 都市 · 區域`，看得出來是哪一國）。

**涉及檔案**：`src/types.ts`、`src/lib/group.ts`（＋`group.test.ts`）、
`src/components/AttractionPicker.tsx`、`src/components/trip/ItineraryTab.tsx`、
`src/components/trip/OverviewTab.tsx`、`src/pages/TripList.tsx`。

### A. 資料模型（`src/types.ts`）

`Trip` 介面在 `city` 之後加一欄：

```ts
  originCountry: string // 出發地國家（T46；舊資料以 `?? '台灣'` 容錯，空字串＝不設出發地）
```

### B. 純函式（`src/lib/group.ts`，＋`src/lib/group.test.ts` 測試）

**參考實作**（照抄，放在 `getLocationOptions` 之後）：

```ts
/**
 * T46：AttractionPicker 要吃的國家清單——目的地優先、出發地次之，去空值與重複。
 * 兩者皆空 → 回空陣列（＝不依國家過濾，維持 T16 `country=''` 的既有行為）。
 */
export function pickerCountries(country: string, originCountry: string): string[] {
  const out: string[] = []
  for (const c of [country, originCountry]) {
    if (c && !out.includes(c)) out.push(c)
  }
  return out
}

/**
 * T46：都市下拉選項，依 `countries` 順序**一國一組**（供 optgroup 使用）。
 * `countries` 為空 → 回單一組 `{ country: '', cities: 全庫都市 }`（沿用 T16 的 fallback）。
 * 各組 cities 去重＋zh-Hant 排序；該國沒有任何都市時仍回一組空陣列（呼叫端自行略過）。
 */
export function citiesForCountries(
  attractions: Pick<Attraction, 'country' | 'city'>[],
  countries: string[],
): { country: string; cities: string[] }[] {
  const sortZh = (a: string, b: string) => a.localeCompare(b, 'zh-Hant')
  if (countries.length === 0) {
    const set = new Set<string>()
    for (const a of attractions) if (a.city) set.add(a.city)
    return [{ country: '', cities: [...set].sort(sortZh) }]
  }
  return countries.map((c) => {
    const set = new Set<string>()
    for (const a of attractions) if (a.country === c && a.city) set.add(a.city)
    return { country: c, cities: [...set].sort(sortZh) }
  })
}
```

**測試（7 條，加在 `group.test.ts`）**：`pickerCountries` 4 條（兩國都有→順序為
[目的地, 出發地]／出發地空→只回目的地／兩者相同→去重成一個／兩者皆空→`[]`）；
`citiesForCountries` 3 條（兩國分組且組內 zh-Hant 排序／`countries` 為空→單組全庫都市／
某國在景點庫無都市→該組 `cities: []`）。

### C. `src/components/AttractionPicker.tsx`

1. Props 加 **`originCountry?: string`**（optional，預設 `''`——不傳的呼叫端行為完全不變）。
2. 國家清單與都市選項改用新純函式：

```tsx
  const countries = useMemo(
    () => pickerCountries(country, originCountry ?? ''),
    [country, originCountry],
  )
  const cityGroups = useMemo(
    () => citiesForCountries(attractions, countries),
    [attractions, countries],
  )
  const cityOptions = useMemo(() => cityGroups.flatMap((g) => g.cities), [cityGroups])
```
   （`cityOptions` 只剩「`defaultCity` 初始化時判斷是否存在」這一個用途，維持既有 `useState`
   初值邏輯不變；原本那段 `country ? opts.citiesByCountry.get(country) : 全庫都市` 整段刪除，
   `getLocationOptions` 本身**不動**——景點庫頁還在用。）
3. 過濾條件：`(!country || a.country === country)` 改為
   **`(countries.length === 0 || countries.includes(a.country))`**（其餘 `fType`／`fCity` 不動）。
4. `citySelect` 改成可分組（**參考實作**）：

```tsx
  const multiGroup = cityGroups.filter((g) => g.cities.length > 0).length > 1
  const citySelect = (
    <Select value={fCity} onChange={setFCity}>
      <option value="">全部</option>
      {multiGroup
        ? cityGroups.map((g, i) =>
            g.cities.length === 0 ? null : (
              <optgroup key={g.country} label={`${i === 0 ? '目的地' : '出發地'}（${g.country}）`}>
                {g.cities.map((c) => (
                  <option key={`${g.country}-${c}`} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            ),
          )
        : cityGroups
            .flatMap((g) => g.cities)
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
    </Select>
  )
```
   （`i === 0` 就是目的地，因為 `pickerCountries` 的順序固定是 [目的地, 出發地]。）
5. `groupLabel` 判斷順序改為（**兩國時一律顯示完整 label，避免同名都市／區域混淆**）：

```tsx
  function groupLabel(g: LocationGroup): string {
    if (countries.length > 1) return g.label            // 國家 · 都市 · 區域
    if (fCity) return g.district || '未分區'
    if (countries.length === 1) return [g.city, g.district].filter(Boolean).join(' · ') || '未分類'
    return g.label
  }
```
6. `countryHasNothing` 改為
   `countries.length > 0 && !attractions.some((a) => countries.includes(a.country))`，
   disabled option 文字改「**景點庫尚無此旅程國家的景點**」。
7. `variant='cells'` 三個 `<Td>` 欄寬（T45 定的 `w-20`／`w-24`／`min-w-[12rem]`）與
   `variant='stack'` 版面**都不動**——都市下拉只是多了 optgroup 標題，寬度需求不變。

### D. `src/components/trip/ItineraryTab.tsx`

桌面 `renderRow` 與手機 `renderCard` 兩處 `<AttractionPicker ...>` 各加一個 prop：

```tsx
  originCountry={trip.originCountry ?? '台灣'}
```
其餘（`country`／`defaultCity`／`visitedIds`／`variant`）不動。

### E. `src/components/trip/OverviewTab.tsx`

1. 國家／都市那排 `grid grid-cols-1 gap-3 sm:grid-cols-2` 改 **`sm:grid-cols-3`**，
   第三欄新增（欄位順序：國家／都市／出發地國家）：

```tsx
        <Field label="出發地國家">
          <TextInput
            value={trip.originCountry ?? '台灣'}
            placeholder="例：台灣"
            list="ov-origin-countries"
            onChange={(v) => update({ originCountry: v })}
          />
          <datalist id="ov-origin-countries">
            {opts.countries.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
```
   **注意**：`onChange` 只寫 `originCountry`——**不要**呼叫 `onCountryChange` 那套幣別／
   匯率邏輯，也不要清空都市（已拍板決定 4）。
2. 該排下方（舊 `region` 灰字那段附近）加一行灰字說明：

```tsx
      <p className="-mt-2 text-xs text-gray-400">
        出發地國家的景點（例：桃園機場）也會出現在「行程」頁的景點下拉。留空＝只顯示目的地國家。
      </p>
```

### F. `src/pages/TripList.tsx`

`createTrip` 組 `Trip` 物件時加一欄（複製既有旅程時沿用來源的出發地）：

```ts
      originCountry: source?.originCountry ?? '台灣',
```

### 不要做

- 不把國家下拉加回 `AttractionPicker`（T16 的鎖死設計仍算數，只是從一國變兩國）。
- 不加「出發地都市」欄位（都市下拉已經能選）；不做「多個出發地／轉機國」清單。
- 不動 `getLocationOptions`／`groupByLocation`／`buildLocationTree`／景點庫頁（`Attractions.tsx`）。
- 不升 Dexie 版、不加索引、不改備份格式、不改 `exportItinerary.ts`。
- 不動幣別／匯率邏輯（`currency.ts`、`onCountryChange`）、不動花費／分帳／行李頁。
- 不改 T44／T45 定下的欄寬。

### 驗收

- `npm run test` 全綠（既有 155 ＋新增 7 條＝ **162**）、`npm run build` 全綠。
- 手動（桌面＋手機寬度各一輪）：
  1. 景點庫先建兩筆合成資料：`台灣／桃園／桃園機場（type: transport）`、`日本／大阪／大阪城`。
  2. 目的地日本、出發地留預設「台灣」的旅程 → 行程頁都市下拉出現
     **「目的地（日本）」「出發地（台灣）」兩組 optgroup**，選「桃園」能挑到桃園機場；
     都市選「全部」時景點下拉的 optgroup 顯示完整 `台灣 · 桃園`／`日本 · 大阪`。
  3. 總覽把「出發地國家」清空 → 行程頁回到只剩日本的都市、無 optgroup 分組（＝現況行為）。
  4. 匯入一份**舊備份**（trip 無 `originCountry`）→ 該旅程總覽顯示「台灣」、行程頁兩組都在。
  5. 改出發地國家**不會**改動外幣名稱／代碼／匯率，也不會清掉目的地都市。
  6. 手機（`variant='stack'`）卡片展開後的都市下拉同樣有兩組。

---

## T47 景點庫新增表單：按鈕移到最下方獨立一列＋手機兩欄順序重排（P2・★・依賴：無）✅ 2026-09-09

**背景／目標**：擁有者看桌面／手機截圖後回饋兩點（2026-09-09）——①「確定新增」按鈕目前擠在
九宮格第一排最右格（T44 第二輪的做法），視覺上像一個欄位、與其他輸入框混在一起；
②手機（`grid-cols-2`）下欄位配對順序不理想，且「網址」的名稱／連結兩框在半格寬度被迫上下堆疊
（Code review 那輪為了避免壓扁而改的），佔掉兩行。

**已拍板的版面（勿重新設計）**：

- **按鈕**：從 grid 裡拿出來，放在整個「新增景點」表單**下方獨立一列、靠右對齊**；
  `newName.trim()` 為空時的灰字提示「請先輸入景點名稱」放在按鈕**左邊**同一列（不再放按鈕下方）。
- **手機（`< sm`，兩欄）由上而下**：
  1. `國家` | `都市`
  2. `區域` | `類型`
  3. `景點名稱` | `詳細地址`
  4. `網址`（**整排寬**，內部「名稱」與「連結」**左右並排**，不再上下堆疊）
  5. `備註` | `優先度`
  6. `確定新增`（獨立一列、靠右）
- **桌面（`sm:grid-cols-5`）由上而下**（DOM 順序同上，靠 col-span 自然排成三排）：
  1. `國家`(1) `都市`(1) `區域`(1) `類型`(1) `景點名稱`(1)
  2. `詳細地址`(2) `網址`(3)
  3. `備註`(2) `優先度`(3)
  4. `確定新增`（grid 外、靠右）

### 實作步驟（`src/pages/Attractions.tsx`，只動「新增景點」表單那一段）

1. 把 `<div className="flex flex-col justify-end gap-1">`（含「確定新增」按鈕與提示 `<span>`）
   **整塊從 grid 內移除**，改放在 grid 容器 `</div>` 之後：

```tsx
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          {!newName.trim() && <span className="text-xs text-gray-400">請先輸入景點名稱</span>}
          <button
            onClick={addRow}
            disabled={!newName.trim()}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            確定新增
          </button>
        </div>
```
2. grid 內的 DOM 順序調整為：國家 → 都市 → 區域 → 類型 → **景點名稱** → 詳細地址 → 網址 →
   備註 → 優先度（就是把原本排在按鈕之後的「景點名稱」`<label>` 整塊往前搬到「類型」之後，
   其餘順序不變）。
3. col-span 調整（只有「網址」要改）：
   - `景點名稱`：無 span（手機 1 格、桌面 1/5）——不變。
   - `詳細地址`：`sm:col-span-2`——不變。
   - `網址`：`sm:col-span-2` → **`col-span-2 sm:col-span-3`**（手機整排、桌面 3/5）。
   - `備註`：`sm:col-span-2`／`優先度`：`sm:col-span-3`——不變。
4. 「網址」內層改回**永遠左右並排**（手機已是整排寬，不再需要堆疊）：

```tsx
            <div className="flex gap-2">
              <div className="w-24 shrink-0">
                <TextInput value={newUrlName} placeholder="名稱" onChange={setNewUrlName} />
              </div>
              <div className="min-w-0 flex-1">
                <TextInput value={newUrl} placeholder="https://" onChange={setNewUrl} />
              </div>
            </div>
```
   （原 `flex flex-col gap-2 sm:flex-row` 與 `sm:w-24 sm:shrink-0` 那組 Code review 修正
   可以退場——它是為了「半格寬」而存在，現在網址已佔整排。「連結留空時只有名稱不會儲存。」
   的琥珀色提示**保留**。）

**不要做**：不動 `addRow` 邏輯／必填驗證／datalist 級聯（`newCityOptions`／`newDistrictOptions`）／
`serializeLink` 編碼／成功後「保留國家都市區域、清空其餘」的行為；不動篩選列、樹狀列表、
`renderRows`（那是 T48）；不動 `cells.tsx`；無 schema／`src/lib`／備份變動。

**驗收**：`npm run test`（155 綠）與 `npm run build` 全綠；用 Playwright 於 **360／390px 手機寬**
與 **1400px 桌面**各截一次：
- 手機六列順序與上表完全一致；「網址」的名稱／連結左右並排且都可正常輸入（名稱 96px、
  連結填滿剩餘寬度）；整頁 `scrollWidth === clientWidth`（零橫向溢出）。
- 桌面三排 5 欄對齊、「確定新增」在表單右下自成一列；空名稱時按鈕 disabled＋左側灰字提示。
- 實際新增一筆（含網址名稱＋連結）確認寫入正確、成功後國家／都市／區域保留。

---

## T48 景點列表手機卡片式檢視（修「類型」欄被壓扁）（P1・★★★・依賴：無；建議 T47 之後做，同檔）

**背景／目標**：景點庫的景點列到現在仍是**單一表格**（`renderRows`），手機下靠
`overflow-x-auto` 橫向捲動觀看。擁有者截圖回報：「類型」表頭被壓成直排（一個字一行）、
該欄的 `<Select>` 被壓到只剩幾 px **無法正確顯示／操作**（截圖橘色框）。根因是 auto table-layout
在容器寬度不足時會壓縮彈性欄（同 T44 的技術發現）。已拍板**完整修**：比照行程（T31）／
花費（T32）／行李（T39）／分帳（T38）改成 `sm` 斷點雙渲染，手機一筆一張卡片、徹底不橫捲。

### 規格（`src/pages/Attractions.tsx`）

1. **頂層 state**（放在 component 頂層，不可放 `renderRows` 內——同一頁會呼叫多次）：

```tsx
  // 手機卡片預設收合；新增走上方表單（資料已填完整），故不做「新增即展開」。
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
```
2. **`renderRows(list)` 改雙容器**（桌面表格 markup **一字不動**，只換外層）：

```tsx
  function renderRows(list: Attraction[]) {
    return (
      <>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[42rem] text-sm">{/* 原內容完全不動 */}</table>
        </div>
        <div className="divide-y sm:hidden">{list.map(renderCard)}</div>
      </>
    )
  }
```
3. **`renderCard(a: Attraction)`**（新函式，放在 `renderRows` 之前）：
   - 摘要列**沒有任何互動元素** → 依共通守則用 `<button type="button" aria-expanded={expanded}
     onClick={() => toggleExpand(a.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">`。
   - 摘要內容（由左至右）：景點名（`a.name || '(未命名)'`，空值灰字，`flex-1 truncate`）→
     `visitedIds.has(a.id)` 時綠色 `✓`（`shrink-0 text-emerald-600`，`title="已排入行程（去過）"`）→
     `a.priority > 0` 時 `★`.repeat（`shrink-0 text-xs text-amber-500`，clamp 0–3 同 `PriorityStars`）→
     類型標籤（`ATTRACTION_TYPES.find((t) => t.value === a.type)?.label`，未設則整個不顯示；
     `shrink-0 text-xs text-gray-500`）→ `▼`／`▲`（`shrink-0 text-xs text-gray-400`）。
   - 展開區 `<div className="space-y-2 border-t bg-gray-50/50 px-3 py-3">`，欄位一律沿用
     `cells.tsx` 元件、handler 與桌面共用（`update(a.id, …)`）：
     景點名稱 `TextInput`／詳細地址 `TextInput`／網址 `LinkField`／備註 `TextInput`／
     優先度 `PriorityStars`／類型 `Select`（選項沿用 `ATTRACTION_TYPES` map，含「未設」）。
     每列包在檔尾新增的 local `CardField`（`w-14` 標籤＋`min-w-0 flex-1` 欄位，抄
     `ItineraryTab.tsx` 檔尾那個，`min-w-0` 不可省——見 Code review 那輪的溢出根因）。
   - 展開區底部一列：`<div className="flex justify-end gap-2 pt-1">`，內含
     「搬移」按鈕（`onClick={() => openMoveRow(a)}`，樣式抄桌面那顆
     `rounded px-2 py-1 text-xs text-gray-500 hover:bg-sky-50 hover:text-sky-700`）與
     「✕ 刪除這個景點」（`onClick={() => remove(a.id)}`，樣式抄 `ItineraryTab` 卡片刪除鈕
     `rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50`；`remove` 是既有 async 函式、
     含 T5 引用數防護，**不要改**）。
4. **空狀態**：`renderRows` 的呼叫端本來就只在 `cityNode.direct.length > 0` 與非空的
   `dn.list` 時呼叫，**不需要**空狀態雙容器（與 T31/T32 不同，別多做）。
5. 檔尾新增 local `CardField` 元件（若 T47 已加就共用一個，不要重複宣告）。
6. React import 視需要補 `useState`（檔案已有）與 `type ReactNode`。

**不要做**：不動桌面表格的欄位、欄寬、`min-w-[42rem]`；不動樹狀節點標頭／摺疊狀態／
「編輯國家／都市／區域」modal／DedupePanel／HealthPanel／篩選列／新增表單（T47 的範圍）；
不動 `update`／`remove`／`openMoveRow`／`PriorityStars`／`LinkField`；
無 schema／`src/lib` 純函式／備份變動（純 UI 任務，不新增測試）。

**驗收**：`npm run test`（155 綠）與 `npm run build` 全綠；用 Playwright 建 3–4 筆合成景點
（含一筆已排入行程的、一筆 priority 3 的、一筆類型「美食」的、一筆名稱留空的）後：
- **360／390px 手機寬**：景點庫整頁 `scrollWidth === clientWidth`（零橫向捲動）；卡片摘要顯示
  名稱＋✓＋★＋類型標籤且不重疊；點卡片展開後「類型」下拉**完整可見可操作**（原 bug 消失）、
  改類型後即時寫入並反映在摘要標籤；「搬移」開 modal 正常、「✕ 刪除這個景點」仍跳 T5 的
  引用數 confirm。
- **1400px 桌面**：表格版與現況完全一致（欄位、欄寬、行為都不變）。

---

## 觀察中／不做

- **先擱置（2026-09-09 討論，需求已提出但暫不排程）**：**行程列手動調整順序**——
  目前同日是 T11 定的「依 `time` 升冪自動排序（空 `time` 沉底）→ 同時間退回 `sort`」，
  與「手動排順序」天生衝突，必須先在下列三案中擇一拍板才能開工：
  (a) **手動優先**：同日排序鍵改回純 `sort`，每列加 ↑↓ 上下移，日期組標題放一顆
  「⇅ 依時間排序」按鈕（按一下把該日依時間重排一次）。需要一次性遷移：把現有列的 `sort`
  依「目前顯示順序」重寫，升級當下畫面順序才不會亂跳。附帶好處：改時間不再即時跳位。
  (b) **加模式開關**：`Trip` 多一個「行程排序：時間／手動」欄位，預設時間（舊行為零影響），
  切到手動才出現 ↑↓。代價是兩套模式都要測、使用者要先懂這個開關。
  (c) **拖曳排序**：手感最好，但要引入 dnd 套件或手寫 HTML5 drag，手機卡片式檢視的拖曳
  與捲動衝突不小，與本專案「純函式＋簡單 UI」的調性較不合。
- **觀察中（未排程）**：行程頁直接新增景點（picker 內開 modal）；當日景點串 Google Maps 路線；
  總覽頁旅程摘要卡；花費分類統計；T22「複製行程文字」輸出連結
  （T35 之後技術上可行——`linkDisplayText` 現成，擁有者尚未決定要不要加）。
- **不做**：備份提醒（擁有者評估不需要）；匯率 API 自動抓（牴觸離線優先、增加網路依賴）；
  連結欄自動抓網頁標題（前端跨域抓不到）。
- **凍結（保留功能與資料、暫停開發）**：分帳／成員、行李——T38／T39 的版面層修改除外（見共通守則）。
