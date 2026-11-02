import { parseCSV } from './csv'
import { newId } from './id'
import { ATTRACTION_TYPES, type Attraction } from '../types'

export type NewAttraction = Omit<Attraction, 'id'>

// 明顯非景點的雜項名稱／分組（小寫比對），匯入時略過。
const JUNK_NAMES = new Set(['早餐', '午餐', '晚餐', 'google map', 'google maps', '柯南景點列表'])
const JUNK_COUNTRIES = new Set(['google map', 'google maps'])

interface ColMap {
  country: number
  city: number
  district: number
  name: number
  address: number
  url: number
  notes: number
  price: number
  priority: number
  type: number
  isFood: boolean
}

const trim = (v: string | undefined) => (v ?? '').trim()
const cell = (row: string[], i: number) => (i < 0 || i >= row.length ? '' : trim(row[i]))

/**
 * T49：「類型」欄文字 → `Attraction['type']`。接受中文標籤（景點／美食／住宿／交通）
 * 與英文值（attraction/food/lodging/transport，不分大小寫）；空字串或無法辨識回 `null`
 * （由呼叫端退回表頭推斷：餐館表＝food，其餘＝''）。
 */
export function parseAttractionType(raw: string): Attraction['type'] | null {
  const t = raw.trim().toLowerCase()
  if (!t) return null
  for (const opt of ATTRACTION_TYPES) {
    if (t === opt.value || t === opt.label) return opt.value
  }
  return null
}

/** 若該列是表頭則回傳欄位對應，否則 null。 */
function detectHeader(row: string[]): ColMap | null {
  const find = (pred: (t: string) => boolean) => row.findIndex((c) => pred(trim(c)))
  const name = row.findIndex((c) => {
    const t = trim(c)
    return t === '景點' || t.startsWith('餐館') || t.startsWith('餐廳')
  })
  if (name === -1) return null
  // T49：資料列的「類型」可能就是「景點」兩字，需再有至少一個其他表頭標籤才算表頭。
  const LABELS = new Set(['國家', '地點', '區域', '地址', '網址', '類型'])
  if (!row.some((c, i) => i !== name && LABELS.has(trim(c)))) return null
  const isFood = trim(row[name]).startsWith('餐館') || trim(row[name]).startsWith('餐廳')
  return {
    country: find((t) => t === '國家'),
    city: find((t) => t === '地點'),
    district: find((t) => t === '區域'),
    name,
    address: find((t) => t === '地址'),
    url: find((t) => t === '網址'),
    notes: find((t) => t.startsWith('備註')),
    price: find((t) => t.startsWith('價位') || t.startsWith('價格')),
    priority: find((t) => t.startsWith('優先度')),
    type: find((t) => t === '類型'),
    isFood,
  }
}

/**
 * 將 CSV 列轉成景點。處理：多表頭、地點向下填滿、餐館自成「美食」分組、
 * 開店時間／價位併入備註、略過雜項與空列、匯入內去重。
 */
export function rowsToAttractions(rows: string[][]): { items: NewAttraction[]; skipped: number } {
  const items: NewAttraction[] = []
  const seen = new Set<string>()
  let skipped = 0
  let col: ColMap | null = null
  let currentCountry = ''
  let currentCity = ''
  let currentDistrict = ''

  for (const row of rows) {
    if (row.every((c) => trim(c) === '')) continue

    const header = detectHeader(row)
    if (header) {
      col = header
      currentCountry = ''
      currentCity = ''
      currentDistrict = ''
      continue
    }
    if (!col) continue

    // 由高至低層層 fill-down / reset：國家換 → 都市＋區域清空；都市換 → 區域清空。
    const cCountry = col.country >= 0 ? cell(row, col.country) : ''
    if (cCountry && cCountry !== currentCountry) {
      currentCity = ''
      currentDistrict = ''
    }
    if (cCountry) currentCountry = cCountry
    const cCity = cell(row, col.city)
    if (cCity && cCity !== currentCity) currentDistrict = ''
    if (cCity) currentCity = cCity
    const cDistrict = col.district >= 0 ? cell(row, col.district) : ''
    // T49：該列有明寫「地點」時區域照該列字面值（空白＝無區域）；地點空白才向下填滿。
    if (cDistrict || cCity) currentDistrict = cDistrict

    const name = cell(row, col.name)
    if (!name) continue // 只更新地點或結構性空列

    if (JUNK_NAMES.has(name.toLowerCase()) || JUNK_COUNTRIES.has(currentCity.toLowerCase())) {
      skipped++
      continue
    }

    const base = currentCity || '未分類'
    // CSV 的「地點」對應到 city；「國家」欄若存在則落入 country（否則留空）。
    // 有「區域」欄時餐館不再加「地點 美食」後綴，僅以 type:'food' 區分。
    const hasDistrict = col.district >= 0
    const city = hasDistrict ? base : col.isFood ? `${base} 美食` : base
    const district = hasDistrict ? currentDistrict : ''

    // 備註：合併「備註欄起、非結構欄位」的所有非空格，再加價位。
    const exclude = new Set([
      col.country,
      col.city,
      col.district,
      col.name,
      col.address,
      col.url,
      col.price,
      col.priority,
      col.type,
    ])
    const noteParts: string[] = []
    const start = col.notes >= 0 ? col.notes : row.length
    for (let k = start; k < row.length; k++) {
      if (exclude.has(k)) continue
      const v = cell(row, k)
      if (v) noteParts.push(v)
    }
    const price = cell(row, col.price)
    if (price) noteParts.push(`價位：${price}`)

    const priorityNum = parseInt(cell(row, col.priority), 10)

    const key = `${currentCountry} ${city} ${district} ${name}`
    if (seen.has(key)) {
      skipped++
      continue
    }
    seen.add(key)

    items.push({
      country: currentCountry,
      city,
      district,
      name,
      address: cell(row, col.address),
      url: cell(row, col.url),
      notes: noteParts.join('・'),
      priority: Number.isFinite(priorityNum) ? priorityNum : 0,
      type: parseAttractionType(cell(row, col.type)) ?? (col.isFood ? 'food' : ''),
    })
  }

  return { items, skipped }
}

/** 匯入去重鍵：國家＋都市＋區域＋名稱。 */
const importKey = (a: Pick<Attraction, 'country' | 'city' | 'district' | 'name'>) =>
  `${a.country} ${a.city} ${a.district} ${a.name}`

/** T49：已存在景點可被補上的欄位（只補「本機空白、匯入有值」者；priority 以 0 視為空白）。 */
const FILLABLE = ['address', 'url', 'notes', 'type', 'priority'] as const
export type FillableField = (typeof FILLABLE)[number]

export interface ImportUpdate {
  id: string
  name: string
  patch: Partial<Pick<Attraction, FillableField>>
}

export interface ImportPlan {
  toAdd: NewAttraction[]
  toUpdate: ImportUpdate[]
  /** 已存在且沒有可補欄位（或為同批次重複）的筆數 */
  unchanged: number
}

/**
 * T49 純函式：比對匯入清單與現有景點。
 * - 鍵不存在 → 新增；
 * - 鍵已存在 → 只把「現有為空、匯入有值」的欄位放進 patch（不覆蓋已有內容）；無可補 → unchanged。
 * 同一鍵在匯入清單出現多次時，僅第一筆生效、其餘算 unchanged。
 */
export function planAttractionImport(
  items: NewAttraction[],
  existing: Attraction[],
): ImportPlan {
  const byKey = new Map(existing.map((a) => [importKey(a), a]))
  const used = new Set<string>()
  const toAdd: NewAttraction[] = []
  const toUpdate: ImportUpdate[] = []
  let unchanged = 0
  for (const it of items) {
    const key = importKey(it)
    if (used.has(key)) {
      unchanged++
      continue
    }
    used.add(key)
    const cur = byKey.get(key)
    if (!cur) {
      toAdd.push(it)
      continue
    }
    const patch: ImportUpdate['patch'] = {}
    for (const f of FILLABLE) {
      if (f === 'priority') {
        if (!cur.priority && it.priority) patch.priority = it.priority
      } else if (f === 'type') {
        if (!cur.type && it.type) patch.type = it.type
      } else if (!cur[f].trim() && it[f].trim()) {
        patch[f] = it[f]
      }
    }
    if (Object.keys(patch).length) toUpdate.push({ id: cur.id, name: cur.name, patch })
    else unchanged++
  }
  return { toAdd, toUpdate, unchanged }
}

/** T49：CSV 文字 → 預覽用的解析結果（尚未比對 DB）。 */
export function parseAttractionsCSV(text: string): { items: NewAttraction[]; skipped: number } {
  return rowsToAttractions(parseCSV(text))
}

/**
 * T49：套用匯入。於單一 transaction 內以最新 DB 內容重新規劃（避免預覽後資料已變動），
 * 新增 toAdd、對 toUpdate 逐筆 update（只補空白欄位）。
 */
export async function applyAttractionImport(
  items: NewAttraction[],
): Promise<{ added: number; updated: number; unchanged: number }> {
  const { db } = await import('../db/db')
  return db.transaction('rw', db.attractions, async () => {
    const plan = planAttractionImport(items, await db.attractions.toArray())
    if (plan.toAdd.length) await db.attractions.bulkAdd(plan.toAdd.map((it) => ({ ...it, id: newId() })))
    for (const u of plan.toUpdate) await db.attractions.update(u.id, u.patch)
    return { added: plan.toAdd.length, updated: plan.toUpdate.length, unchanged: plan.unchanged }
  })
}
