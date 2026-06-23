import type { Attraction } from '../types'

export interface LocationGroup {
  country: string
  city: string
  district: string
  label: string // 顯示用：國家 · 都市 · 區域（空層省略，全空則「未分類」）
  list: Attraction[]
}

export const SEP = String.fromCharCode(0) // 組 key 分隔字元（null char），避免與內容衝突

/** 依「國家＋都市＋區域」將景點分組，回傳排序後的群組（以中文排序）。 */
export function groupByLocation(attractions: Attraction[]): LocationGroup[] {
  const map = new Map<string, Attraction[]>()
  for (const a of attractions) {
    const key = `${a.country || ''}${SEP}${a.city || ''}${SEP}${a.district || ''}`
    const list = map.get(key)
    if (list) list.push(a)
    else map.set(key, [a])
  }
  return [...map.entries()]
    .map(([key, list]) => {
      const [country, city, district] = key.split(SEP)
      const label = [country, city, district].filter(Boolean).join(' · ') || '未分類'
      return { country, city, district, label, list }
    })
    .sort(
      (x, y) =>
        x.country.localeCompare(y.country, 'zh-Hant') ||
        x.city.localeCompare(y.city, 'zh-Hant') ||
        x.district.localeCompare(y.district, 'zh-Hant'),
    )
}

/** 衍生各層的唯一選項，供篩選下拉使用（cascading）。 */
export function getLocationOptions(attractions: Attraction[]): {
  countries: string[]
  citiesByCountry: Map<string, string[]>
  districtsByCityKey: Map<string, string[]>
} {
  const countriesSet = new Set<string>()
  const citiesByCountry = new Map<string, Set<string>>()
  const districtsByCityKey = new Map<string, Set<string>>()

  for (const a of attractions) {
    if (a.country) countriesSet.add(a.country)

    if (!citiesByCountry.has(a.country)) citiesByCountry.set(a.country, new Set())
    if (a.city) citiesByCountry.get(a.country)!.add(a.city)

    const cityKey = `${a.country}${SEP}${a.city}`
    if (!districtsByCityKey.has(cityKey)) districtsByCityKey.set(cityKey, new Set())
    if (a.district) districtsByCityKey.get(cityKey)!.add(a.district)
  }

  const sortZh = (a: string, b: string) => a.localeCompare(b, 'zh-Hant')

  return {
    countries: [...countriesSet].sort(sortZh),
    citiesByCountry: new Map(
      [...citiesByCountry.entries()].map(([k, v]) => [k, [...v].sort(sortZh)]),
    ),
    districtsByCityKey: new Map(
      [...districtsByCityKey.entries()].map(([k, v]) => [k, [...v].sort(sortZh)]),
    ),
  }
}
