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

### 進行中（T34–T39，表列順序＝建議施工順序）

| # | 任務 | 優先 | 難度 | 依賴 | 狀態 |
|---|------|------|------|------|------|
| T34 | 電腦版時間欄寬修正（w-16 → w-20） | P1 | ★ | 無 | ✅ 2026-07-17 |
| T35 | 連結超連結化：`[名稱](網址)` 解析＋LinkField 元件＋行程頁套用 | P1 | ★★ | 建議 T34 後（同檔 ItineraryTab） | ✅ 2026-07-17 |
| T36 | 景點庫網址欄比照 LinkField | P2 | ★ | T35 | ⬜ |
| T37 | 行程手機卡片摘要改版（金額→備註＋連結） | P1 | ★★ | T35（同檔＋用到連結顯示） | ⬜ |
| T38 | 分帳頁：同行者手機卡片＋結餘表壓縮＋護照名 placeholder 移除 | P2 | ★★ | 無（凍結區局部解凍） | ⬜ |
| T39 | 行李頁手機卡片 | P2 | ★★ | 無（凍結區局部解凍） | ⬜ |

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

## 觀察中／不做

- **觀察中（未排程）**：行程頁直接新增景點（picker 內開 modal）；當日景點串 Google Maps 路線；
  總覽頁旅程摘要卡；花費分類統計；T22「複製行程文字」輸出連結
  （T35 之後技術上可行——`linkDisplayText` 現成，擁有者尚未決定要不要加）。
- **不做**：備份提醒（擁有者評估不需要）；匯率 API 自動抓（牴觸離線優先、增加網路依賴）；
  連結欄自動抓網頁標題（前端跨域抓不到）。
- **凍結（保留功能與資料、暫停開發）**：分帳／成員、行李——T38／T39 的版面層修改除外（見共通守則）。
