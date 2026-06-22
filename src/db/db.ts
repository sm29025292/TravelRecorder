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
            if (a.region === undefined) {
              a.region = a.country ?? ''
              a.country = ''
            }
          })
      })
  }
}

export const db = new TravelDB()
