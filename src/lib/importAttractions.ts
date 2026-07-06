import { parseCSV } from './csv'
import { newId } from './id'
import type { Attraction } from '../types'

export type NewAttraction = Omit<Attraction, 'id'>

// 明顯非景點的雜項名稱／分組（小寫比對），匯入時略過。
const JUNK_NAMES = new Set(['早餐', '午餐', '晚餐', 'google map', 'google maps', '柯南景點列表'])
const JUNK_COUNTRIES = new Set(['google map', 'google maps'])

interface ColMap {
  country: number
  district: number
  name: number
  address: number
  url: number
  notes: number
  price: number
  priority: number
  isFood: boolean
}

const trim = (v: string | undefined) => (v ?? '').trim()
const cell = (row: string[], i: number) => (i < 0 || i >= row.length ? '' : trim(row[i]))

/** 若該列是表頭則回傳欄位對應，否則 null。 */
function detectHeader(row: string[]): ColMap | null {
  const find = (pred: (t: string) => boolean) => row.findIndex((c) => pred(trim(c)))
  const name = row.findIndex((c) => {
    const t = trim(c)
    return t === '景點' || t.startsWith('餐館') || t.startsWith('餐廳')
  })
  if (name === -1) return null
  const isFood = trim(row[name]).startsWith('餐館') || trim(row[name]).startsWith('餐廳')
  return {
    country: find((t) => t === '地點'),
    district: find((t) => t === '區域'),
    name,
    address: find((t) => t === '地址'),
    url: find((t) => t === '網址'),
    notes: find((t) => t.startsWith('備註')),
    price: find((t) => t.startsWith('價位') || t.startsWith('價格')),
    priority: find((t) => t.startsWith('優先度')),
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
  let currentDistrict = ''

  for (const row of rows) {
    if (row.every((c) => trim(c) === '')) continue

    const header = detectHeader(row)
    if (header) {
      col = header
      currentCountry = ''
      currentDistrict = ''
      continue
    }
    if (!col) continue

    const c = cell(row, col.country)
    if (c && c !== currentCountry) currentDistrict = ''
    if (c) currentCountry = c
    const d = col.district >= 0 ? cell(row, col.district) : ''
    if (d) currentDistrict = d

    const name = cell(row, col.name)
    if (!name) continue // 只更新地點或結構性空列

    if (JUNK_NAMES.has(name.toLowerCase()) || JUNK_COUNTRIES.has(currentCountry.toLowerCase())) {
      skipped++
      continue
    }

    const base = currentCountry || '未分類'
    // CSV 的「地點」對應到都市（city）；國家（country）匯入時留空待使用者補。
    // 若表頭含「區域」則額外落入 district；否則沿用舊版：餐館以「地點 美食」作為 city 標記。
    const hasDistrict = col.district >= 0
    const city = hasDistrict ? base : col.isFood ? `${base} 美食` : base
    const district = hasDistrict ? currentDistrict : ''

    // 備註：合併「備註欄起、非結構欄位」的所有非空格，再加價位。
    const exclude = new Set([
      col.country,
      col.district,
      col.name,
      col.address,
      col.url,
      col.price,
      col.priority,
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

    const key = `${city} ${district} ${name}`
    if (seen.has(key)) {
      skipped++
      continue
    }
    seen.add(key)

    items.push({
      country: '',
      city,
      district,
      name,
      address: cell(row, col.address),
      url: cell(row, col.url),
      notes: noteParts.join('・'),
      priority: Number.isFinite(priorityNum) ? priorityNum : 0,
      type: col.isFood ? 'food' : '',
    })
  }

  return { items, skipped }
}

/** 合併匯入：以 (country, city, district, name) 與現有景點去重後新增。 */
export async function mergeAttractions(
  items: NewAttraction[],
): Promise<{ added: number; duplicates: number }> {
  const { db } = await import('../db/db')
  const existing = await db.attractions.toArray()
  const have = new Set(existing.map((a) => `${a.country} ${a.city} ${a.district} ${a.name}`))
  const toAdd: Attraction[] = []
  let duplicates = 0
  for (const it of items) {
    const key = `${it.country} ${it.city} ${it.district} ${it.name}`
    if (have.has(key)) {
      duplicates++
      continue
    }
    have.add(key)
    toAdd.push({ ...it, id: newId() })
  }
  if (toAdd.length) await db.attractions.bulkAdd(toAdd)
  return { added: toAdd.length, duplicates }
}

/** 從 CSV 文字一次完成解析 → 合併匯入。 */
export async function importAttractionsFromCSV(
  text: string,
): Promise<{ added: number; duplicates: number; skipped: number }> {
  const { items, skipped } = rowsToAttractions(parseCSV(text))
  const { added, duplicates } = await mergeAttractions(items)
  return { added, duplicates, skipped }
}
