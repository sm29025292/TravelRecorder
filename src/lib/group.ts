import type { Attraction } from '../types'

export interface LocationGroup {
  country: string
  region: string
  label: string // 顯示用：國家 · 大地區（皆空則「未分類」）
  list: Attraction[]
}

const SEP = String.fromCharCode(0) // 組 key 分隔字元（null char），避免與內容（可能含空白）衝突

/** 依「國家＋大地區」將景點分組，回傳排序後的群組（以中文排序）。 */
export function groupByLocation(attractions: Attraction[]): LocationGroup[] {
  const map = new Map<string, Attraction[]>()
  for (const a of attractions) {
    const key = `${a.country || ''}${SEP}${a.region || ''}`
    const list = map.get(key)
    if (list) list.push(a)
    else map.set(key, [a])
  }
  return [...map.entries()]
    .map(([key, list]) => {
      const [country, region] = key.split(SEP)
      const label = [country, region].filter(Boolean).join(' · ') || '未分類'
      return { country, region, label, list }
    })
    .sort(
      (x, y) =>
        x.country.localeCompare(y.country, 'zh-Hant') ||
        x.region.localeCompare(y.region, 'zh-Hant'),
    )
}
