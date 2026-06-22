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
  }

  const update = (id: string, patch: Partial<PackingItem>) => db.packing.update(id, patch)
  const remove = (id: string) => db.packing.delete(id)

  const list = items ?? []
  const done = list.filter((p) => p.checked).length

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border bg-white">
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
            {list.map((it) => (
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
            ))}
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
