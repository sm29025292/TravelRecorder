import type { ItineraryItem, Trip } from '../types'
import { itineraryTotal, round } from './money'

export interface ItineraryDayGroup {
  date: string
  items: ItineraryItem[]
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * 依本地時區列出 `startDate` 到 `endDate` 之間（含端點）的所有 `YYYY-MM-DD`。
 * 只吃 `^\d{4}-\d{2}-\d{2}$`、`startDate <= endDate`、且區間天數 <= 90（防呆）；
 * 其餘一律回空陣列。用 `new Date(y, m-1, d)` 而非 `new Date('YYYY-MM-DD')`（UTC 時區陷阱）。
 */
export function datesInRange(startDate: string, endDate: string): string[] {
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) return []
  if (startDate.localeCompare(endDate) > 0) return []
  const [sy, sm, sd] = startDate.split('-').map(Number)
  const [ey, em, ed] = endDate.split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  if (
    start.getFullYear() !== sy ||
    start.getMonth() !== sm - 1 ||
    start.getDate() !== sd ||
    end.getFullYear() !== ey ||
    end.getMonth() !== em - 1 ||
    end.getDate() !== ed
  ) {
    return []
  }
  const out: string[] = []
  const cur = new Date(start)
  while (cur.getTime() <= end.getTime()) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    out.push(`${y}-${m}-${d}`)
    if (out.length > 90) return []
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

/**
 * 依日期分組行程；空 date 歸「未排日期」組並置底。
 * 非空 date 以字串升冪排序（YYYY-MM-DD 字串序＝時間序）；
 * 組內以 `time`（`HH:MM` 字串序）升冪，空 `time` 置底；同 `time` 或皆空以 `sort` 升冪（穩定）。
 * 傳入 `range` 時，對區間內所有沒有行程列的日期補入 `{ date, items: [] }` 空日組；
 * 區間外的日期組照常顯示；「未排日期」組照舊置底。
 */
export function groupItineraryByDate(
  items: ItineraryItem[],
  range?: { startDate: string; endDate: string },
): ItineraryDayGroup[] {
  const map = new Map<string, ItineraryItem[]>()
  for (const it of items) {
    const key = it.date ?? ''
    const list = map.get(key)
    if (list) list.push(it)
    else map.set(key, [it])
  }

  if (range) {
    for (const d of datesInRange(range.startDate, range.endDate)) {
      if (!map.has(d)) map.set(d, [])
    }
  }

  const dated: ItineraryDayGroup[] = []
  let undated: ItineraryDayGroup | null = null
  for (const [date, list] of map) {
    const sorted = [...list].sort((a, b) => {
      const at = a.time ?? ''
      const bt = b.time ?? ''
      if (at && bt) {
        const c = at.localeCompare(bt)
        if (c !== 0) return c
      } else if (at && !bt) {
        return -1
      } else if (!at && bt) {
        return 1
      }
      return a.sort - b.sort
    })
    const group = { date, items: sorted }
    if (date === '') undated = group
    else dated.push(group)
  }
  dated.sort((a, b) => a.date.localeCompare(b.date))
  return undated ? [...dated, undated] : dated
}

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六']

/**
 * 將 YYYY-MM-DD 轉為中文週幾標籤（例：'週一'）。
 * 用本地時區組 Date 避免 `new Date('YYYY-MM-DD')` 被當 UTC 造成時區偏移。
 * 格式不合或非法日期回空字串。
 */
export function weekdayLabel(dateStr: string): string {
  if (!dateStr) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!m) return ''
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return ''
  const dt = new Date(y, mo - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return ''
  return `週${WEEKDAY_ZH[dt.getDay()]}`
}

/**
 * 當日小計：時數合計、外幣（交通＋活動）合計、台幣換算合計。
 * 台幣換算沿用 money.ts 的 itineraryTotal，不重複實作換算邏輯。
 */
export function itineraryDaySubtotal(
  items: ItineraryItem[],
  trip: Pick<Trip, 'exchangeRate'>,
): { hours: number; foreign: number; twd: number } {
  const hours = round(items.reduce((s, it) => s + (it.hours || 0), 0))
  const foreign = round(
    items.reduce((s, it) => s + (it.transportCost || 0) + (it.activityCost || 0), 0),
  )
  const twd = itineraryTotal(items, trip)
  return { hours, foreign, twd }
}
