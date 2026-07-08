// 資料模型 — 全部用程式邏輯計算，不再依賴試算表公式。

export type ID = string

/** 一次旅程（取代試算表的一個分頁）。 */
export interface Trip {
  id: ID
  name: string
  country: string // 國家（T2 起連動景點庫下拉；舊資料以 '' 容錯）
  city: string // 都市（T2 起連動景點庫下拉；舊資料以 '' 容錯）
  region: string // 舊自由文字欄，保留以相容舊備份／顯示參考
  startDate: string // YYYY-MM-DD
  endDate: string
  currencyCode: string // 主要外幣代碼，例 JPY
  currencyLabel: string // 顯示名稱，例 日元
  exchangeRate: number // 對台幣匯率，例 0.21
  peopleCount: number // 用於計算平均
  createdAt: number
  updatedAt: number
}

/** 景點：全域可重複使用的參考資料，取代「景點」分頁，依地理三層階層分組。 */
export interface Attraction {
  id: ID
  country: string // 國家，例：日本（分組鍵）
  city: string // 都市，例：大阪（分組鍵，原 region）
  district: string // 區域，例：心齋橋（分組鍵）
  name: string // 景點名稱
  address: string // 詳細地址，例：日本橋
  url: string
  notes: string
  priority: number // 1-3，0 表示未設定
  type: 'attraction' | 'food' | 'lodging' | 'transport' | '' // 類型：景點 / 美食 / 住宿 / 交通 / 未設
}

/** 景點類型下拉選項（共用常數，避免四處硬寫）。 */
export const ATTRACTION_TYPES = [
  { value: 'attraction', label: '景點' },
  { value: 'food', label: '美食' },
  { value: 'lodging', label: '住宿' },
  { value: 'transport', label: '交通' },
] as const

/** 花費（機票 / 飯店 / 保險等大項）。 */
export interface ExpenseItem {
  id: ID
  tripId: ID
  date: string
  time: string
  item: string // 項目
  currency: string // 該列幣別代碼；'TWD' 表示直接以台幣輸入
  amount: number // 以 currency 計的金額
  fee: number // 手續費（台幣）
  paid: boolean
  paidBy: string // 付錢的人（v1 自由文字，保留相容）
  payerId?: ID // 付錢的成員（分帳用）
  participantIds?: ID[] // 分攤成員；空/未設 = 全體均分
  paymentStatus: string // 付錢狀態備註
  notes: string
  sort: number
}

/** 行程。 */
export interface ItineraryItem {
  id: ID
  tripId: ID
  date: string
  time: string // 開始時間 HH:MM
  endTime?: string // 結束時間 HH:MM；optional 相容舊資料/舊備份
  attractionId: ID // 對應景點；'' 表示未選
  activity: string // 行程 / 活動（自由文字）
  hours: number // 時間(HR)
  transportCost: number // 交通花費（旅程外幣）
  activityCost: number // 行程花費（旅程外幣）
  paidBy: string // v1 自由文字，保留相容
  payerId?: ID // 付錢的成員（分帳用）
  participantIds?: ID[] // 分攤成員；空/未設 = 全體均分
  notes: string
  link: string // 備註(交通) 連結
  sort: number
}

/** 同行者（per trip），用於分帳。 */
export interface Member {
  id: ID
  tripId: ID
  name: string
  passportName: string
  passportNumber: string
  birthday: string
  sort: number
}

/** 購物記帳（per trip）。 */
export interface ShoppingItem {
  id: ID
  tripId: ID
  date: string
  time: string
  item: string
  currency: string // 該列幣別代碼；'TWD' 表示台幣
  amount: number
  fee: number
  payerId?: ID // 付錢的成員
  participantIds?: ID[] // 分攤成員；空/未設 = 全體均分
  notes: string
  sort: number
}

/** 行李 / 備註清單項目（per trip，可勾選）。 */
export interface PackingItem {
  id: ID
  tripId: ID
  item: string
  quantity: number // 份量(人)
  notes: string
  checked: boolean
  sort: number
}
