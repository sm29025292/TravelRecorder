import type { Attraction } from '../types'

/** 名稱正規化：去除半形／全形空白＋轉小寫，供重複偵測 key 使用。 */
export function normalizeName(name: string): string {
  return name.replace(/[\s　]+/g, '').toLowerCase()
}

/**
 * 找出「名稱正規化後相同」的景點群組（每組 ≥ 2 筆）。
 * 名稱正規化為空字串者（未命名）略過；組內依 priority 降冪穩定排序；
 * 組間依組內第一筆 name 以 zh-Hant 升冪排序。
 */
export function findDuplicateGroups(attractions: Attraction[]): Attraction[][] {
  const buckets = new Map<string, Attraction[]>()
  for (const a of attractions) {
    const key = normalizeName(a.name)
    if (!key) continue
    const list = buckets.get(key)
    if (list) list.push(a)
    else buckets.set(key, [a])
  }
  const groups = [...buckets.values()].filter((list) => list.length >= 2)
  for (const g of groups) g.sort((x, y) => y.priority - x.priority)
  groups.sort((x, y) => x[0].name.localeCompare(y[0].name, 'zh-Hant'))
  return groups
}

const STRING_FIELDS: Array<
  Extract<keyof Attraction, 'country' | 'city' | 'district' | 'name' | 'address' | 'url' | 'type'>
> = ['country', 'city', 'district', 'name', 'address', 'url', 'type']

/**
 * 合併欄位：survivor 非空優先，否則取 losers 中第一個非空值；
 * notes 依 ・ split → trim → 過濾空片 → 保序去重 → join；priority 取最大；id 沿用 survivor.id。
 */
export function mergeAttractionFields(survivor: Attraction, losers: Attraction[]): Attraction {
  const pick = (field: (typeof STRING_FIELDS)[number]): string => {
    const sv = (survivor[field] as string) ?? ''
    if (sv) return sv
    for (const l of losers) {
      const lv = (l[field] as string) ?? ''
      if (lv) return lv
    }
    return ''
  }

  const allNoteParts = [survivor, ...losers]
    .flatMap((a) => (a.notes ?? '').split('・'))
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const seen = new Set<string>()
  const notes: string[] = []
  for (const n of allNoteParts) {
    if (seen.has(n)) continue
    seen.add(n)
    notes.push(n)
  }

  const priority = Math.max(survivor.priority, ...losers.map((l) => l.priority))

  return {
    id: survivor.id,
    country: pick('country'),
    city: pick('city'),
    district: pick('district'),
    name: pick('name'),
    address: pick('address'),
    url: pick('url'),
    notes: notes.join('・'),
    priority,
    type: pick('type') as Attraction['type'],
  }
}

/**
 * 合併重複景點：單一 transaction 內
 * ① 以 mergeAttractionFields 更新 survivor
 * ② 把行程列的 attractionId 從 losers 改指向 survivor（沿用 T5 全表 filter）
 * ③ 刪除 losers。
 * 命名避開 importAttractions.ts 既有的 mergeAttractions。
 */
export async function applyMerge(survivorId: string, loserIds: string[]): Promise<void> {
  const { db } = await import('../db/db')
  await db.transaction('rw', db.attractions, db.itinerary, async () => {
    const survivor = await db.attractions.get(survivorId)
    if (!survivor) throw new Error(`找不到保留景點：${survivorId}`)
    const losersMaybe = await db.attractions.bulkGet(loserIds)
    const losers: Attraction[] = []
    for (let i = 0; i < loserIds.length; i++) {
      const l = losersMaybe[i]
      if (!l) throw new Error(`找不到欲合併景點：${loserIds[i]}`)
      losers.push(l)
    }
    const merged = mergeAttractionFields(survivor, losers)
    await db.attractions.put(merged)
    await db.itinerary
      .filter((r) => loserIds.includes(r.attractionId))
      .modify((r) => {
        r.attractionId = survivorId
      })
    await db.attractions.bulkDelete(loserIds)
  })
}
