import Dexie, { type Table } from 'dexie'
import type {
  Trip,
  Attraction,
  ExpenseItem,
  ItineraryItem,
  Member,
  ShoppingItem,
  PackingItem,
} from '../types'
import { shoppingToExpense } from '../lib/migrate'

// 本機資料庫（IndexedDB）。資料只存在使用者的瀏覽器，用匯出/匯入做備份。
export class TravelDB extends Dexie {
  trips!: Table<Trip, string>
  attractions!: Table<Attraction, string>
  expenses!: Table<ExpenseItem, string>
  itinerary!: Table<ItineraryItem, string>
  members!: Table<Member, string>
  shopping!: Table<ShoppingItem, string>
  packing!: Table<PackingItem, string>

  constructor() {
    super('travel-recorder')
    this.version(1).stores({
      trips: 'id, updatedAt, name',
      attractions: 'id, country, name',
      expenses: 'id, tripId, sort',
      itinerary: 'id, tripId, sort',
    })
    // v2：第二版新增人員/購物/行李清單（新欄位 payerId/participantIds 無索引、免遷移）。
    this.version(2).stores({
      trips: 'id, updatedAt, name',
      attractions: 'id, country, name',
      expenses: 'id, tripId, sort',
      itinerary: 'id, tripId, sort',
      members: 'id, tripId, sort',
      shopping: 'id, tripId, sort',
      packing: 'id, tripId, sort',
    })
    // v3：景點地點拆成「國家／大地區／詳細地址」三欄（新增 region 欄並遷移舊資料）。
    this.version(3)
      .stores({
        trips: 'id, updatedAt, name',
        attractions: 'id, country, region, name',
        expenses: 'id, tripId, sort',
        itinerary: 'id, tripId, sort',
        members: 'id, tripId, sort',
        shopping: 'id, tripId, sort',
        packing: 'id, tripId, sort',
      })
      .upgrade(async (tx) => {
        // 舊版單一 country 欄其實當「大地區」用（例：大阪），搬到 region；國家留空待使用者補。
        await tx
          .table('attractions')
          .toCollection()
          .modify((a: Attraction) => {
            const rec = a as unknown as Record<string, unknown>
            if (rec.region === undefined) {
              rec.region = a.country ?? ''
              a.country = ''
            }
          })
      })
    // v4：景點地點升級為三層（國家／都市／區域），新增類型欄（景點／美食）。
    // region → city（都市）；新增 district（區域）與 type（類型）欄位。
    this.version(4)
      .stores({
        trips: 'id, updatedAt, name',
        attractions: 'id, country, city, name',
        expenses: 'id, tripId, sort',
        itinerary: 'id, tripId, sort',
        members: 'id, tripId, sort',
        shopping: 'id, tripId, sort',
        packing: 'id, tripId, sort',
      })
      .upgrade(async (tx) => {
        await tx
          .table('attractions')
          .toCollection()
          .modify((a: Attraction) => {
            const rec = a as unknown as Record<string, unknown>
            if ('region' in rec) {
              rec.city = rec.region ?? ''
              delete rec.region
            } else if (rec.city === undefined) {
              rec.city = ''
            }
            if (rec.district === undefined) rec.district = ''
            if (rec.type === undefined) rec.type = ''
          })
      })
    // v5：購物併入花費（T1）。stores 與 v4 相同（保留 shopping 表宣告以相容備份／凍結區程式碼）。
    // upgrade 將 shopping 全表以 shoppingToExpense 轉入 expenses（sort 接續在既有 expenses 之後），
    // 完成後清空 shopping。id 沿用確保重跑不會產生重複列。
    this.version(5)
      .stores({
        trips: 'id, updatedAt, name',
        attractions: 'id, country, city, name',
        expenses: 'id, tripId, sort',
        itinerary: 'id, tripId, sort',
        members: 'id, tripId, sort',
        shopping: 'id, tripId, sort',
        packing: 'id, tripId, sort',
      })
      .upgrade(async (tx) => {
        const shopping = (await tx.table('shopping').toArray()) as ShoppingItem[]
        if (shopping.length === 0) return
        const byTrip = new Map<string, ShoppingItem[]>()
        for (const s of shopping) {
          const list = byTrip.get(s.tripId) ?? []
          list.push(s)
          byTrip.set(s.tripId, list)
        }
        const converted: ExpenseItem[] = []
        for (const [tripId, list] of byTrip) {
          const existing = (await tx
            .table('expenses')
            .where('tripId')
            .equals(tripId)
            .toArray()) as ExpenseItem[]
          const base = existing.reduce((m, e) => (e.sort > m ? e.sort : m), 0)
          list.sort((a, b) => a.sort - b.sort)
          list.forEach((s, i) => {
            converted.push(shoppingToExpense(s, base + i + 1))
          })
        }
        await tx.table('expenses').bulkPut(converted)
        await tx.table('shopping').clear()
      })
  }
}

export const db = new TravelDB()
