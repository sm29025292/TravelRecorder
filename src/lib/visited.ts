import type { ItineraryItem } from '../types'

/**
 * 收集「所有旅程中被任何行程列參照過」的景點 id 為 Set。
 * `attractionId === ''` 視為未指定，不列入；重複的 id 自動去重。
 * 呼叫端傳入全庫 itinerary 即可作為「已去過」的判定依據（T15）。
 */
export function visitedAttractionIds(
  itinerary: Array<Pick<ItineraryItem, 'attractionId'>>,
): Set<string> {
  const s = new Set<string>()
  for (const r of itinerary) {
    if (r.attractionId) s.add(r.attractionId)
  }
  return s
}
