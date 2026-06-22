import type { Member } from '../types'
import { Select } from './cells'

/** 付錢者下拉（空白 + 各成員）。 */
export default function MemberSelect({
  members,
  value,
  onChange,
  placeholder = '—',
}: {
  members: Member[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
}) {
  return (
    <Select value={value} onChange={onChange} className="min-w-[5rem]">
      <option value="">{placeholder}</option>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name || '(未命名)'}
        </option>
      ))}
    </Select>
  )
}
