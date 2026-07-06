import type { Attraction, ItineraryItem } from '../types'

/**
 * 找出「attractionId 非空、卻在景點庫找不到對應景點」的孤兒行程列。
 * attractionId === '' 視為未指定，不算孤兒。回傳保持輸入順序，
 * 呼叫端可自行分組或排序。
 */
export function findOrphanItinerary(
  itinerary: ItineraryItem[],
  attractions: Attraction[],
): ItineraryItem[] {
  const idSet = new Set<string>()
  for (const a of attractions) idSet.add(a.id)
  return itinerary.filter((r) => r.attractionId !== '' && !idSet.has(r.attractionId))
}
