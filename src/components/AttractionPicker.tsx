import type { Attraction } from '../types'
import { Select } from './cells'
import { groupByCountry } from '../lib/group'

export default function AttractionPicker({
  attractions,
  value,
  onChange,
}: {
  attractions: Attraction[]
  value: string
  onChange: (id: string) => void
}) {
  const groups = groupByCountry(attractions)
  return (
    <Select value={value} onChange={onChange} className="min-w-[8rem]">
      <option value="">—</option>
      {groups.map(([country, list]) => (
        <optgroup key={country} label={country || '未分類'}>
          {list.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name || '(未命名)'}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  )
}
