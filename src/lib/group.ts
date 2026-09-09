import type { Attraction } from '../types'

export interface LocationGroup {
  country: string
  city: string
  district: string
  label: string // 顯示用：國家 · 都市 · 區域（空層省略，全空則「未分類」）
  list: Attraction[]
}

export const SEP = String.fromCharCode(0) // 組 key 分隔字元（null char），避免與內容衝突

/** 組內排序：priority 降冪、平手依名稱 zh-Hant 升冪。 */
const byPriorityThenName = (a: Attraction, b: Attraction) =>
  b.priority - a.priority || a.name.localeCompare(b.name, 'zh-Hant')

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
      list.sort(byPriorityThenName)
      return { country, city, district, label, list }
    })
    .sort(
      (x, y) =>
        x.country.localeCompare(y.country, 'zh-Hant') ||
        x.city.localeCompare(y.city, 'zh-Hant') ||
        x.district.localeCompare(y.district, 'zh-Hant'),
    )
}

/** 樹狀節點：國家 → 都市 → 區域 → 景點列。 */
export interface DistrictNode {
  district: string
  list: Attraction[]
}
export interface CityNode {
  city: string
  count: number
  /** 該都市下 district 為空的景點列（顯示於區域節點之前）。 */
  direct: Attraction[]
  districts: DistrictNode[]
}
export interface CountryNode {
  country: string
  /** 該國家全部景點數（含未分類都市／區域）。 */
  count: number
  cities: CityNode[]
}

/** 建立三層樹狀結構（country → city → district）。country === '' 節點置頂顯示為「未分類」。 */
export function buildLocationTree(attractions: Attraction[]): CountryNode[] {
  const byCountry = new Map<string, Map<string, Map<string, Attraction[]>>>()
  for (const a of attractions) {
    const country = a.country ?? ''
    const city = a.city ?? ''
    const district = a.district ?? ''
    if (!byCountry.has(country)) byCountry.set(country, new Map())
    const byCity = byCountry.get(country)!
    if (!byCity.has(city)) byCity.set(city, new Map())
    const byDistrict = byCity.get(city)!
    if (!byDistrict.has(district)) byDistrict.set(district, [])
    byDistrict.get(district)!.push(a)
  }

  const sortZh = (a: string, b: string) => a.localeCompare(b, 'zh-Hant')

  const result: CountryNode[] = []
  for (const [country, cityMap] of byCountry) {
    const cities: CityNode[] = []
    let countryCount = 0
    for (const [city, districtMap] of cityMap) {
      const direct = (districtMap.get('') ?? []).slice().sort(byPriorityThenName)
      const districts: DistrictNode[] = []
      let cityCount = direct.length
      for (const [district, list] of districtMap) {
        if (district === '') continue
        districts.push({ district, list: list.slice().sort(byPriorityThenName) })
        cityCount += list.length
      }
      districts.sort((x, y) => sortZh(x.district, y.district))
      cities.push({ city, count: cityCount, direct, districts })
      countryCount += cityCount
    }
    cities.sort((x, y) => sortZh(x.city, y.city))
    result.push({ country, count: countryCount, cities })
  }
  result.sort((x, y) => {
    // 未分類（空字串）置頂；其餘依中文排序。
    if (x.country === '' && y.country !== '') return -1
    if (y.country === '' && x.country !== '') return 1
    return sortZh(x.country, y.country)
  })
  return result
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

/**
 * T46：AttractionPicker 要吃的國家清單——目的地優先、出發地次之，去空值與重複。
 * 兩者皆空回空陣列（＝不依國家過濾，維持 T16 `country=''` 的既有行為）。
 */
export function pickerCountries(country: string, originCountry: string): string[] {
  const out: string[] = []
  for (const c of [country, originCountry]) {
    if (c && !out.includes(c)) out.push(c)
  }
  return out
}

/**
 * T46：都市下拉選項，依 `countries` 順序**一國一組**（供 optgroup 使用）。
 * `countries` 為空 → 回單一組 `{ country: '', cities: 全庫都市 }`（沿用 T16 的 fallback）。
 * 各組 cities 去重＋zh-Hant 排序；該國沒有任何都市時仍回一組空陣列（呼叫端自行略過）。
 */
export function citiesForCountries(
  attractions: Pick<Attraction, 'country' | 'city'>[],
  countries: string[],
): { country: string; cities: string[] }[] {
  const sortZh = (a: string, b: string) => a.localeCompare(b, 'zh-Hant')
  if (countries.length === 0) {
    const set = new Set<string>()
    for (const a of attractions) if (a.city) set.add(a.city)
    return [{ country: '', cities: [...set].sort(sortZh) }]
  }
  return countries.map((c) => {
    const set = new Set<string>()
    for (const a of attractions) if (a.country === c && a.city) set.add(a.city)
    return { country: c, cities: [...set].sort(sortZh) }
  })
}
