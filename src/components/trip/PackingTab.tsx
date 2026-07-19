import { useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip, PackingItem } from '../../types'
import { db } from '../../db/db'
import { newId } from '../../lib/id'
import { TextInput, NumberInput, IconButton, Th, Td } from '../cells'

export default function PackingTab({ trip }: { trip: Trip }) {
  const items = useLiveQuery(
    () => db.packing.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
  )

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  async function addRow() {
    const list = items ?? []
    const sort = (list.length ? list[list.length - 1].sort : 0) + 1
    const row: PackingItem = {
      id: newId(),
      tripId: trip.id,
      item: '',
      quantity: 0,
      notes: '',
      checked: false,
      sort,
    }
    await db.packing.add(row)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(row.id)
      return next
    })
  }

  const update = (id: string, patch: Partial<PackingItem>) => db.packing.update(id, patch)
  const remove = (id: string) => db.packing.delete(id)

  const list = items ?? []
  const done = list.filter((p) => p.checked).length

  function renderRow(it: PackingItem) {
    return (
      <tr key={it.id} className="border-t">
        <Td className="text-center">
          <input
            type="checkbox"
            className="h-4 w-4 accent-sky-600"
            checked={it.checked}
            onChange={(e) => update(it.id, { checked: e.target.checked })}
          />
        </Td>
        <Td className="min-w-[10rem]">
          <TextInput
            value={it.item}
            onChange={(v) => update(it.id, { item: v })}
            className={it.checked ? 'text-gray-400 line-through' : ''}
          />
        </Td>
        <Td className="w-24">
          <NumberInput value={it.quantity} onChange={(n) => update(it.id, { quantity: n })} />
        </Td>
        <Td className="min-w-[10rem]">
          <TextInput value={it.notes} onChange={(v) => update(it.id, { notes: v })} />
        </Td>
        <Td>
          <IconButton title="刪除這列" onClick={() => remove(it.id)}>
            ✕
          </IconButton>
        </Td>
      </tr>
    )
  }

  function renderCard(it: PackingItem) {
    const expanded = expandedIds.has(it.id)
    return (
      <div key={it.id}>
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={() => toggleExpand(it.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (e.key === ' ') e.preventDefault()
              toggleExpand(it.id)
            }
          }}
          className="cursor-pointer text-sm hover:bg-gray-50"
        >
          <div className="flex items-center gap-2 px-3 py-2">
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 accent-sky-600"
              checked={it.checked}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => update(it.id, { checked: e.target.checked })}
            />
            <span
              className={`flex-1 truncate ${it.checked ? 'text-gray-400 line-through' : ''}`}
            >
              {it.item || <span className="text-gray-400">(未填)</span>}
            </span>
            {it.quantity !== 0 && (
              <span className="shrink-0 text-xs text-gray-500">{it.quantity}</span>
            )}
            <span className="shrink-0 text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
          </div>
          {it.notes && (
            <div className="truncate px-3 pb-2 text-xs text-gray-400">{it.notes}</div>
          )}
        </div>
        {expanded && (
          <div className="space-y-2 border-t bg-gray-50/50 px-3 py-3">
            <CardField label="項目">
              <TextInput
                value={it.item}
                onChange={(v) => update(it.id, { item: v })}
                className={it.checked ? 'text-gray-400 line-through' : ''}
              />
            </CardField>
            <CardField label="份量(人)">
              <NumberInput
                value={it.quantity}
                onChange={(n) => update(it.id, { quantity: n })}
              />
            </CardField>
            <CardField label="備註">
              <TextInput value={it.notes} onChange={(v) => update(it.id, { notes: v })} />
            </CardField>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => remove(it.id)}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                ✕ 刪除這列
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-white">
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <Th className="w-12 text-center">✓</Th>
                <Th>項目</Th>
                <Th className="text-right">份量(人)</Th>
                <Th>備註</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {list.map(renderRow)}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    尚無項目，點下方「新增一列」。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="divide-y sm:hidden">
          {list.map(renderCard)}
          {list.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              尚無項目，點下方「新增一列」。
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={addRow}
          className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          + 新增一列
        </button>
        <div className="ml-auto text-sm text-gray-600">
          已勾選 <b>{done}</b> / {list.length}
        </div>
      </div>
    </div>
  )
}

function CardField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-14 shrink-0 text-xs text-gray-500">{label}</span>
      <span className="flex-1">{children}</span>
    </label>
  )
}
