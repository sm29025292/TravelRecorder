import { useMemo, useState } from 'react'
import { ATTRACTION_TYPES, type Attraction } from '../types'
import { Select, Td } from './cells'
import { groupByLocation, getLocationOptions, type LocationGroup } from '../lib/group'

/**
 * 行程頁景點三段式（類型 → 都市 → 景點），輸出三個 <Td> 作為表格橫向的獨立欄位。
 * 國家由 `country` prop 完全鎖死；未分類（country 為空）的景點在此不可選——
 * 需先到景點庫用「未分類」節點批次補國家（刻意的工作流）。
 */
export default function AttractionPicker({
  attractions,
  value,
  onChange,
  country,
  defaultCity,
  visitedIds,
}: {
  attractions: Attraction[]
  value: string
  onChange: (id: string) => void
  country: string
  defaultCity?: string
  visitedIds?: Set<string>
}) {
  const opts = getLocationOptions(attractions)

  const cityOptions = useMemo<string[]>(() => {
    if (country) return opts.citiesByCountry.get(country) ?? []
    const set = new Set<string>()
    for (const a of attractions) if (a.city) set.add(a.city)
    return [...set].sort((x, y) => x.localeCompare(y, 'zh-Hant'))
  }, [attractions, country, opts])

  const [fType, setFType] = useState<Attraction['type']>('')
  const [fCity, setFCity] = useState<string>(() => {
    if (value) {
      const found = attractions.find((a) => a.id === value)
      if (found) return found.city ?? ''
    }
    if (defaultCity && cityOptions.includes(defaultCity)) return defaultCity
    return ''
  })

  const filtered = attractions.filter(
    (a) =>
      (!country || a.country === country) &&
      (!fType || a.type === fType) &&
      (!fCity || a.city === fCity),
  )
  const groups = groupByLocation(filtered)

  const selectedInList = !!value && filtered.some((a) => a.id === value)
  const selectedAttraction = value ? attractions.find((a) => a.id === value) : undefined
  const showFallbackSelected = !!value && !selectedInList

  const countryHasNothing =
    country !== '' && !attractions.some((a) => a.country === country)

  function optionText(a: Attraction, suffixCity = false): string {
    const stars = '★'.repeat(Math.min(3, Math.max(0, a.priority | 0)))
    const visited = visitedIds?.has(a.id) ? ' ✓' : ''
    const name = a.name || '(未命名)'
    const suffix = suffixCity && a.city ? `（${a.city}）` : ''
    return (stars ? stars + ' ' : '') + name + suffix + visited
  }

  function groupLabel(g: LocationGroup): string {
    if (fCity) return g.district || '未分區'
    if (country) return [g.city, g.district].filter(Boolean).join(' · ') || '未分類'
    return g.label
  }

  return (
    <>
      <Td className="w-20">
        <Select value={fType} onChange={(v) => setFType(v as Attraction['type'])}>
          <option value="">全部</option>
          {ATTRACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </Td>
      <Td className="w-24">
        <Select value={fCity} onChange={setFCity}>
          <option value="">全部都市</option>
          {cityOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Td>
      <Td className="min-w-[14rem]">
        <Select value={value} onChange={onChange}>
          <option value="">—</option>
          {showFallbackSelected && (
            <optgroup label="目前選取">
              <option value={value}>
                {selectedAttraction ? optionText(selectedAttraction, true) : '(景點已刪除)'}
              </option>
            </optgroup>
          )}
          {countryHasNothing ? (
            <option value="__nolist__" disabled>
              景點庫尚無此國家的景點
            </option>
          ) : (
            groups.map((g) => (
              <optgroup key={g.label} label={groupLabel(g)}>
                {g.list.map((a) => (
                  <option key={a.id} value={a.id}>
                    {optionText(a)}
                  </option>
                ))}
              </optgroup>
            ))
          )}
        </Select>
      </Td>
    </>
  )
}
