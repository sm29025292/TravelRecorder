import { db } from '../db/db'
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
    version: 3,
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
  // 舊版（v2 以前）景點沒有 region：沿用 DB 遷移邏輯，把舊 country（其實是大地區）搬到 region。
  const attractions = (data.attractions ?? []).map((a) =>
    a.region === undefined ? { ...a, region: a.country ?? '', country: '' } : a,
  )
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
        db.expenses.bulkPut(data.expenses ?? []),
        db.itinerary.bulkPut(data.itinerary ?? []),
        db.members.bulkPut(data.members ?? []),
        db.shopping.bulkPut(data.shopping ?? []),
        db.packing.bulkPut(data.packing ?? []),
      ])
    },
  )
}
