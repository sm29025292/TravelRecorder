import { db } from '../db/db'
import { shoppingToExpense } from './migrate'
import type {
  Trip,
  Attraction,
  ExpenseItem,
  ItineraryItem,
  Member,
  ShoppingItem,
  PackingItem,
} from '../types'

export interface BackupData {
  app: 'travel-recorder'
  version: number
  exportedAt: string
  trips: Trip[]
  attractions: Attraction[]
  expenses: ExpenseItem[]
  itinerary: ItineraryItem[]
  members?: Member[]
  shopping?: ShoppingItem[]
  packing?: PackingItem[]
}

/** 匯出所有資料（旅程＋景點＋花費＋行程＋人員＋購物＋行李）。 */
export async function exportAll(): Promise<BackupData> {
  const [trips, attractions, expenses, itinerary, members, shopping, packing] = await Promise.all([
    db.trips.toArray(),
    db.attractions.toArray(),
    db.expenses.toArray(),
    db.itinerary.toArray(),
    db.members.toArray(),
    db.shopping.toArray(),
    db.packing.toArray(),
  ])
  return {
    app: 'travel-recorder',
    version: 4,
    exportedAt: new Date().toISOString(),
    trips,
    attractions,
    expenses,
    itinerary,
    members,
    shopping,
    packing,
  }
}

/** 觸發瀏覽器下載 JSON 備份檔。 */
export function downloadBackup(data: BackupData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `travel-recorder-backup-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** 解析備份檔文字。 */
export function parseBackup(text: string): BackupData {
  return JSON.parse(text) as BackupData
}

/** 匯入備份。mode='replace' 會先清空現有資料，'merge' 則覆蓋同 id 並保留其餘。 */
export async function importAll(data: BackupData, mode: 'replace' | 'merge' = 'replace'): Promise<void> {
  if (!data || data.app !== 'travel-recorder') {
    throw new Error('檔案格式不符，請選擇 TravelRecorder 匯出的備份檔。')
  }
  // 正規化舊版景點欄位，對應 DB v4 遷移邏輯：
  //   v2-：沒有 region，舊 country 其實是大地區 → city；country 清空。
  //   v3 ：有 region，無 city → region 改為 city。
  //   v4+：已有 city，補齊 district / type 預設值。
  const attractions = (data.attractions ?? []).map((raw: unknown) => {
    const a = raw as Record<string, unknown>
    if (a.city !== undefined) {
      // v4+
      return { district: '', type: '', ...a }
    }
    if (a.region !== undefined) {
      // v3
      const { region, ...rest } = a
      return { ...rest, city: region ?? '', district: '', type: '' }
    }
    // v2-
    return { ...a, city: a.country ?? '', country: '', district: '', type: '' }
  }) as Attraction[]
  // T1：舊備份的 shopping 全部轉成 expenses（id 沿用保冪等；shopping 表不再寫入）。
  // sort 接續：per tripId 以「原 expenses 最大 sort + 1..N」補在後面。
  const rawExpenses = data.expenses ?? []
  const rawShopping = data.shopping ?? []
  const convertedShopping: ExpenseItem[] = []
  if (rawShopping.length > 0) {
    const maxByTrip = new Map<string, number>()
    for (const e of rawExpenses) {
      const cur = maxByTrip.get(e.tripId) ?? 0
      if (e.sort > cur) maxByTrip.set(e.tripId, e.sort)
    }
    const byTrip = new Map<string, ShoppingItem[]>()
    for (const s of rawShopping) {
      const list = byTrip.get(s.tripId) ?? []
      list.push(s)
      byTrip.set(s.tripId, list)
    }
    for (const [tripId, list] of byTrip) {
      const base = maxByTrip.get(tripId) ?? 0
      list.sort((a, b) => a.sort - b.sort)
      list.forEach((s, i) => {
        convertedShopping.push(shoppingToExpense(s, base + i + 1))
      })
    }
  }
  const expensesToWrite = [...rawExpenses, ...convertedShopping]
  await db.transaction(
    'rw',
    [db.trips, db.attractions, db.expenses, db.itinerary, db.members, db.shopping, db.packing],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.trips.clear(),
          db.attractions.clear(),
          db.expenses.clear(),
          db.itinerary.clear(),
          db.members.clear(),
          db.shopping.clear(),
          db.packing.clear(),
        ])
      }
      await Promise.all([
        db.trips.bulkPut(data.trips ?? []),
        db.attractions.bulkPut(attractions),
        db.expenses.bulkPut(expensesToWrite),
        db.itinerary.bulkPut(data.itinerary ?? []),
        db.members.bulkPut(data.members ?? []),
        db.packing.bulkPut(data.packing ?? []),
      ])
    },
  )
}
