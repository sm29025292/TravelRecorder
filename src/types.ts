// 資料模型 — 全部用程式邏輯計算，不再依賴試算表公式。

export type ID = string

/** 一次旅程（取代試算表的一個分頁）。 */
export interface Trip {
  id: ID
  name: string
  region: string // 例：日本 / 東京
  startDate: string // YYYY-MM-DD
  endDate: string
  currencyCode: string // 主要外幣代碼，例 JPY
  currencyLabel: string // 顯示名稱，例 日元
  exchangeRate: number // 對台幣匯率，例 0.21
  peopleCount: number // 用於計算平均
  createdAt: number
  updatedAt: number
}

/** 景點：全域可重複使用的參考資料，取代「景點」分頁，依 country 分組。 */
export interface Attraction {
  id: ID
  country: string // 分組鍵，例：大阪 / 英國倫敦
  name: string // 景點名稱
  address: string
  url: string
  notes: string
  priority: number // 1-3，0 表示未設定
}

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
  paidBy: string // 付錢的人
  paymentStatus: string // 付錢狀態備註
  notes: string
  sort: number
}

/** 行程。 */
export interface ItineraryItem {
  id: ID
  tripId: ID
  date: string
  time: string
  attractionId: ID // 對應景點；'' 表示未選
  activity: string // 行程 / 活動（自由文字）
  hours: number // 時間(HR)
  transportCost: number // 交通花費（旅程外幣）
  activityCost: number // 行程花費（旅程外幣）
  paidBy: string
  notes: string
  link: string // 備註(交通) 連結
  sort: number
}
