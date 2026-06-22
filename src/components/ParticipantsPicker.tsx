import { useEffect, useRef, useState } from 'react'
import type { Member } from '../types'

/**
 * 分攤對象選擇。value 為成員 id 陣列；**空陣列 = 全部均分**。
 * 按鈕顯示「全部」或「N 人」，點開為勾選清單，點外面關閉。
 */
export default function ParticipantsPicker({
  members,
  value,
  onChange,
}: {
  members: Member[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const all = value.length === 0
  const selected = new Set(value)
  const allIds = members.map((m) => m.id)

  function toggleMember(id: string) {
    const base = all ? new Set(allIds) : new Set(value)
    if (base.has(id)) base.delete(id)
    else base.add(id)
    const next = allIds.filter((mid) => base.has(mid))
    onChange(next.length === allIds.length ? [] : next) // 全選 → 存空陣列代表「全部」
  }

  if (members.length === 0) {
    return (
      <span className="block px-2 py-1 text-xs text-gray-400" title="請先到「分帳」分頁新增成員">
        —
      </span>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-left text-sm hover:bg-gray-50"
        title="選擇分攤對象"
      >
        {all ? '全部' : `${value.length} 人`} ▾
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-44 overflow-auto rounded border bg-white p-1 shadow-lg">
          <label className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50">
            <input type="checkbox" checked={all} onChange={() => onChange([])} />
            <span className="font-medium">全部均分</span>
          </label>
          <div className="my-1 border-t" />
          {members.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={all || selected.has(m.id)}
                onChange={() => toggleMember(m.id)}
              />
              <span>{m.name || '(未命名)'}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
