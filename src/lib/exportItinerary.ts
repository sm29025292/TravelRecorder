import type { Trip, Attraction } from '../types'
import type { ItineraryDayGroup } from './itinerary'
import { weekdayLabel } from './itinerary'

/**
 * 將行程分組轉為易讀純文字（不含金額，供分享用）。
 * - 首行 `{name}（{startDate} ～ {endDate}）`；任一日期空 → 只輸出 `{name}`。
 * - 每組之間空一行；組標題 `■ {MM/DD}（{週X}）`（未排日期組標題 `■ 未排日期`）。
 * - 每列：`{時間段} {標題}`——時間段 `time`+`endTime` 皆有→`time–endTime`、只有 `time`→`time`、皆無省略；
 *   標題景點名與 `activity` 皆有→`名｜活動`、只有一者→該者、皆空→`(未填)`；
 *   `notes` 非空 → 次行 `　備註：{notes}`。
 * - 空日組（T13 補的）跳過不輸出。
 */
export function itineraryToText(
  trip: Pick<Trip, 'name' | 'startDate' | 'endDate'>,
  groups: ItineraryDayGroup[],
  attractions: Attraction[],
): string {
  const nameById = new Map(attractions.map((a) => [a.id, a.name]))
  const header =
    trip.startDate && trip.endDate
      ? `${trip.name}（${trip.startDate} ～ ${trip.endDate}）`
      : trip.name
  const sections: string[] = [header]
  for (const g of groups) {
    if (g.items.length === 0) continue
    const lines: string[] = []
    if (g.date) {
      const mmdd = `${g.date.slice(5, 7)}/${g.date.slice(8, 10)}`
      const wk = weekdayLabel(g.date)
      lines.push(`■ ${mmdd}${wk ? `（${wk}）` : ''}`)
    } else {
      lines.push('■ 未排日期')
    }
    for (const it of g.items) {
      const timeRange =
        it.time && it.endTime
          ? `${it.time}–${it.endTime}`
          : it.time
            ? it.time
            : ''
      const name = nameById.get(it.attractionId) ?? ''
      const activity = it.activity ?? ''
      let title: string
      if (name && activity) title = `${name}｜${activity}`
      else if (name) title = name
      else if (activity) title = activity
      else title = '(未填)'
      lines.push(timeRange ? `${timeRange} ${title}` : title)
      if (it.notes) lines.push(`　備註：${it.notes}`)
    }
    sections.push(lines.join('\n'))
  }
  return sections.join('\n\n')
}
