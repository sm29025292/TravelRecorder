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
 * 計算分帳：每位成員的已付/應分攤/結餘，並以「成對淨額」產生結算轉帳
 * （兩兩互欠對沖；每筆轉帳都對應實際債務關係、可追溯，筆數可能多於全域最少筆數）。
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
  const debt = new Map<string, number>() // `${from}|${to}` → from 累計欠 to 多少

  for (const e of entries) {
    if (!valid.has(e.payerId)) continue
    const filtered = e.beneficiaryIds.filter((b) => valid.has(b))
    const bens = filtered.length ? filtered : memberIds
    if (bens.length === 0) continue
    paid.set(e.payerId, (paid.get(e.payerId) ?? 0) + e.amount)
    const per = e.amount / bens.length
    for (const b of bens) {
      share.set(b, (share.get(b) ?? 0) + per)
      if (b !== e.payerId) {
        const key = `${b}|${e.payerId}`
        debt.set(key, (debt.get(key) ?? 0) + per)
      }
    }
  }

  const balances: MemberBalance[] = memberIds.map((id) => ({
    id,
    paid: round(paid.get(id) ?? 0),
    share: round(share.get(id) ?? 0),
    balance: round((paid.get(id) ?? 0) - (share.get(id) ?? 0)),
  }))

  // 成對淨額：每一對成員互欠對沖，淨額非零者輸出一筆轉帳（依 memberIds 順序）
  const transfers: Transfer[] = []
  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const a = memberIds[i]
      const b = memberIds[j]
      const net = round((debt.get(`${a}|${b}`) ?? 0) - (debt.get(`${b}|${a}`) ?? 0))
      if (net > 0.005) transfers.push({ from: a, to: b, amount: net })
      else if (net < -0.005) transfers.push({ from: b, to: a, amount: -net })
    }
  }

  return { balances, transfers }
}

export interface CurrencySettleEntry extends SettleEntry {
  currency: string // 'TWD' 或外幣代碼；空字串視為 TWD
}

export interface CurrencySettlement {
  currency: string
  balances: MemberBalance[]
  transfers: Transfer[]
}

/**
 * 按幣別分桶結算：各幣別獨立跑 `settle`，互不換匯、不跨幣別對沖。
 * TWD 桶排最前、其餘依 entries 出現順序；全零桶（無任何有效付錢列）不回傳。
 */
export function settleByCurrency(
  memberIds: string[],
  entries: CurrencySettleEntry[],
): CurrencySettlement[] {
  const buckets = new Map<string, SettleEntry[]>()
  for (const e of entries) {
    const cur = e.currency || 'TWD'
    const list = buckets.get(cur)
    if (list) list.push(e)
    else buckets.set(cur, [e])
  }

  const currencies = [...buckets.keys()].sort(
    (a, b) => (a === 'TWD' ? 0 : 1) - (b === 'TWD' ? 0 : 1),
  )

  const out: CurrencySettlement[] = []
  for (const cur of currencies) {
    const { balances, transfers } = settle(memberIds, buckets.get(cur) ?? [])
    const hasActivity = transfers.length > 0 || balances.some((b) => b.paid !== 0 || b.share !== 0)
    if (hasActivity) out.push({ currency: cur, balances, transfers })
  }
  return out
}
