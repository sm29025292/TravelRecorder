import type { Trip, ExpenseItem, ItineraryItem } from '../types'

type RateCtx = Pick<Trip, 'currencyCode' | 'exchangeRate'>

/** 四捨五入到指定小數位，避免浮點誤差。預設 2 位。 */
export function round(value: number, digits = 2): number {
  if (!Number.isFinite(value)) return 0
  const f = 10 ** digits
  return Math.round((value + Number.EPSILON) * f) / f
}

/** 外幣金額換算成台幣。 */
export function toTWD(amount: number, rate: number): number {
  return round((amount || 0) * (rate || 0))
}

/** 取得某列花費實際使用的匯率（TWD 視為 1，其餘用旅程匯率）。 */
export function rateForCurrency(currency: string, trip: RateCtx): number {
  if (!currency || currency === 'TWD') return 1
  return trip.exchangeRate || 0
}

/** 單筆花費小計（台幣）＝ 金額換算台幣 ＋ 手續費。 */
export function expenseSubtotal(
  item: Pick<ExpenseItem, 'amount' | 'fee' | 'currency'>,
  trip: RateCtx,
): number {
  const rate = rateForCurrency(item.currency, trip)
  return round(toTWD(item.amount, rate) + (item.fee || 0))
}

/** 花費總計（台幣，未取整，保留小數）。 */
export function expensesTotal(
  items: Array<Pick<ExpenseItem, 'amount' | 'fee' | 'currency'>>,
  trip: RateCtx,
): number {
  return round(items.reduce((sum, it) => sum + expenseSubtotal(it, trip), 0))
}

/** 平均每人花費（由未取整的總計計算）。 */
export function expensesAverage(total: number, peopleCount: number): number {
  if (!peopleCount || peopleCount <= 0) return 0
  return round(total / peopleCount)
}

/** 單筆行程小計（台幣）＝（交通＋行程花費）換算台幣。 */
export function itinerarySubtotal(
  item: Pick<ItineraryItem, 'transportCost' | 'activityCost'>,
  trip: Pick<Trip, 'exchangeRate'>,
): number {
  return toTWD((item.transportCost || 0) + (item.activityCost || 0), trip.exchangeRate)
}

/** 行程花費總計（台幣）。 */
export function itineraryTotal(
  items: Array<Pick<ItineraryItem, 'transportCost' | 'activityCost'>>,
  trip: Pick<Trip, 'exchangeRate'>,
): number {
  return round(items.reduce((sum, it) => sum + itinerarySubtotal(it, trip), 0))
}

/** 顯示用數字格式（千分位、最多兩位小數）。 */
export function fmt(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString('zh-TW', {
    maximumFractionDigits: 2,
  })
}
