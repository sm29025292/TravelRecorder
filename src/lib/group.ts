import type { Attraction } from '../types'

/** 依 country 將景點分組，回傳 [country, list] 陣列（country 以中文排序）。 */
export function groupByCountry(attractions: Attraction[]): Array<[string, Attraction[]]> {
  const map = new Map<string, Attraction[]>()
  for (const a of attractions) {
    const key = a.country || ''
    const list = map.get(key)
    if (list) list.push(a)
    else map.set(key, [a])
  }
  return [...map.entries()].sort((x, y) => x[0].localeCompare(y[0], 'zh-Hant'))
}
