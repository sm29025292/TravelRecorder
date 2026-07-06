import { useState } from 'react'
import type { Attraction } from '../types'
import { Select } from './cells'
import { groupByLocation, getLocationOptions } from '../lib/group'

export default function AttractionPicker({
  attractions,
  value,
  onChange,
  defaultCountry,
}: {
  attractions: Attraction[]
  value: string
  onChange: (id: string) => void
  defaultCountry?: string
}) {
  const [fCountry, setFCountry] = useState(defaultCountry ?? '')
  const [fType, setFType] = useState<'' | 'attraction' | 'food'>('')

  const opts = getLocationOptions(attractions)

  const filtered = attractions.filter(
    (a) =>
      (!fCountry || a.country === fCountry) &&
      (!fType || a.type === fType),
  )
  const groups = groupByLocation(filtered)

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <Select value={fCountry} onChange={setFCountry} className="flex-1 min-w-0 text-xs py-0.5">
          <option value="">全部國家</option>
          {opts.countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={fType} onChange={(v) => setFType(v as '' | 'attraction' | 'food')} className="w-20 text-xs py-0.5">
          <option value="">全部</option>
          <option value="attraction">景點</option>
          <option value="food">美食</option>
        </Select>
      </div>
      <Select value={value} onChange={onChange} className="min-w-[8rem]">
        <option value="">—</option>
        {groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.list.map((a) => {
              const stars = '★'.repeat(Math.min(3, Math.max(0, a.priority | 0)))
              return (
                <option key={a.id} value={a.id}>
                  {(stars ? stars + ' ' : '') + (a.name || '(未命名)')}
                </option>
              )
            })}
          </optgroup>
        ))}
      </Select>
    </div>
  )
}
