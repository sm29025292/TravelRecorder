import { useMemo, useState, type ReactNode } from 'react'
import { ATTRACTION_TYPES, type Attraction } from '../types'
import { Select, Td } from './cells'
import {
  citiesForCountries,
  groupByLocation,
  pickerCountries,
  type LocationGroup,
} from '../lib/group'

/**
 * 行程頁景點三段式（類型 → 都市 → 景點）。
 * 透過 `variant` 切換最外層版面容器：
 *   - `'cells'`（預設）＝T29 的三個 `<Td>`，供桌面表格橫向排列。
 *   - `'stack'`＝三個附標籤的 select 直向排列，供 T31 的手機卡片式檢視。
 * 內部 state、過濾邏輯、optgroup label 自組、「目前選取」保底、★／✓ 前綴等只有一份。
 * 國家由 `country`（目的地）＋ `originCountry`（出發地，T46）兩個 prop 鎖死；
 * 未分類（country 為空）的景點在此不可選——需先到景點庫用「未分類」節點批次補國家（刻意的工作流）。
 */
export default function AttractionPicker({
  attractions,
  value,
  onChange,
  country,
  originCountry,
  defaultCity,
  visitedIds,
  variant = 'cells',
}: {
  attractions: Attraction[]
  value: string
  onChange: (id: string) => void
  country: string
  originCountry?: string
  defaultCity?: string
  visitedIds?: Set<string>
  variant?: 'cells' | 'stack'
}) {
  // T46：目的地＋出發地兩國都可挑（順序固定 [目的地, 出發地]）。
  const countries = useMemo(
    () => pickerCountries(country, originCountry ?? ''),
    [country, originCountry],
  )
  const cityGroups = useMemo(
    () => citiesForCountries(attractions, countries),
    [attractions, countries],
  )
  // 只用於 `defaultCity` 初始化時判斷該都市是否存在於選項中。
  const cityOptions = useMemo(() => cityGroups.flatMap((g) => g.cities), [cityGroups])

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
      (countries.length === 0 || countries.includes(a.country)) &&
      (!fType || a.type === fType) &&
      (!fCity || a.city === fCity),
  )
  const groups = groupByLocation(filtered)

  const selectedInList = !!value && filtered.some((a) => a.id === value)
  const selectedAttraction = value ? attractions.find((a) => a.id === value) : undefined
  const showFallbackSelected = !!value && !selectedInList

  const countryHasNothing =
    countries.length > 0 && !attractions.some((a) => countries.includes(a.country))

  function optionText(a: Attraction, suffixCity = false): string {
    const stars = '★'.repeat(Math.min(3, Math.max(0, a.priority | 0)))
    const visited = visitedIds?.has(a.id) ? ' ✓' : ''
    const name = a.name || '(未命名)'
    const suffix = suffixCity && a.city ? `（${a.city}）` : ''
    return (stars ? stars + ' ' : '') + name + suffix + visited
  }

  function groupLabel(g: LocationGroup): string {
    // 兩國時一律顯示完整 label（國家 · 都市 · 區域），避免同名都市／區域混淆。
    if (countries.length > 1) return g.label
    if (fCity) return g.district || '未分區'
    if (countries.length === 1) return [g.city, g.district].filter(Boolean).join(' · ') || '未分類'
    return g.label
  }

  const typeSelect = (
    <Select value={fType} onChange={(v) => setFType(v as Attraction['type'])}>
      <option value="">全部</option>
      {ATTRACTION_TYPES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </Select>
  )
  const multiGroup = cityGroups.filter((g) => g.cities.length > 0).length > 1
  const citySelect = (
    <Select value={fCity} onChange={setFCity}>
      <option value="">全部</option>
      {multiGroup
        ? cityGroups.map((g, i) =>
            g.cities.length === 0 ? null : (
              <optgroup key={g.country} label={`${i === 0 ? '目的地' : '出發地'}（${g.country}）`}>
                {g.cities.map((c) => (
                  <option key={`${g.country}-${c}`} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            ),
          )
        : cityGroups
            .flatMap((g) => g.cities)
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
    </Select>
  )
  const attractionSelect = (
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
          景點庫尚無此旅程國家的景點
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
  )

  if (variant === 'stack') {
    return (
      <div className="space-y-1.5">
        <StackField label="類型">{typeSelect}</StackField>
        <StackField label="都市">{citySelect}</StackField>
        <StackField label="景點">{attractionSelect}</StackField>
      </div>
    )
  }

  return (
    <>
      <Td className="w-20">{typeSelect}</Td>
      <Td className="w-24">{citySelect}</Td>
      <Td className="min-w-[12rem]">{attractionSelect}</Td>
    </>
  )
}

function StackField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-14 shrink-0 text-xs text-gray-500">{label}</span>
      <span className="flex-1">{children}</span>
    </label>
  )
}
