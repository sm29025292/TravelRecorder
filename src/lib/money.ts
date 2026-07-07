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

/** 單筆行程小計（外幣）＝ 交通 + 花費，未換匯。 */
export function itineraryForeignSubtotal(
  item: Pick<ItineraryItem, 'transportCost' | 'activityCost'>,
): number {
  return round((item.transportCost || 0) + (item.activityCost || 0))
}

/** 顯示用數字格式（千分位、最多兩位小數）。 */
export function fmt(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString('zh-TW', {
    maximumFractionDigits: 2,
  })
}

// ── 分帳 settlement ───────────────────────────────────────────────

export interface SettleEntry {
  payerId: string // 付錢的成員
  amount: number // 金額（台幣）
  beneficiaryIds: string[] // 分攤成員；空陣列 = 全體均分
}

export interface MemberBalance {
  id: string
  paid: number // 已付
  share: number // 應分攤
  balance: number // 結餘 = paid - share（>0 應收回、<0 應支付）
}

export interface Transfer {
  from: string // 應支付的人
  to: string // 應收款的人
  amount: number
}

/**
 * 計算分帳：每位成員的已付/應分攤/結餘，並用貪婪法產生最少筆數的結算轉帳。
 * - `beneficiaryIds` 空、或過濾後為空 → 全體均分。
 * - `payerId` 非現有成員的 entry 直接略過（未設付錢者的列不納入結算）。
 */
export function settle(
  memberIds: string[],
  entries: SettleEntry[],
): { balances: MemberBalance[]; transfers: Transfer[] } {
  const valid = new Set(memberIds)
  const paid = new Map<string, number>(memberIds.map((id) => [id, 0]))
  const share = new Map<string, number>(memberIds.map((id) => [id, 0]))

  for (const e of entries) {
    if (!valid.has(e.payerId)) continue
    const filtered = e.beneficiaryIds.filter((b) => valid.has(b))
    const bens = filtered.length ? filtered : memberIds
    if (bens.length === 0) continue
    paid.set(e.payerId, (paid.get(e.payerId) ?? 0) + e.amount)
    const per = e.amount / bens.length
    for (const b of bens) share.set(b, (share.get(b) ?? 0) + per)
  }

  const balances: MemberBalance[] = memberIds.map((id) => ({
    id,
    paid: round(paid.get(id) ?? 0),
    share: round(share.get(id) ?? 0),
    balance: round((paid.get(id) ?? 0) - (share.get(id) ?? 0)),
  }))

  // 貪婪結算：最大債權人 ↔ 最大債務人
  const creditors = balances
    .filter((b) => b.balance > 0)
    .map((b) => ({ id: b.id, amt: b.balance }))
    .sort((a, b) => b.amt - a.amt)
  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ id: b.id, amt: -b.balance }))
    .sort((a, b) => b.amt - a.amt)

  const transfers: Transfer[] = []
  let ci = 0
  let di = 0
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci]
    const d = debtors[di]
    const amt = round(Math.min(c.amt, d.amt))
    if (amt > 0) transfers.push({ from: d.id, to: c.id, amount: amt })
    c.amt = round(c.amt - amt)
    d.amt = round(d.amt - amt)
    if (c.amt <= 0.005) ci++
    if (d.amt <= 0.005) di++
  }

  return { balances, transfers }
}
