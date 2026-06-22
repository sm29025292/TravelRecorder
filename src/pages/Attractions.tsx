import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { newId } from '../lib/id'
import type { Attraction } from '../types'
import { TextInput, NumberInput, IconButton, Th, Td } from '../components/cells'
import { groupByCountry } from '../lib/group'

export default function Attractions() {
  const attractions = useLiveQuery(() => db.attractions.toArray(), [], [])
  const [newCountry, setNewCountry] = useState('')

  async function addRow() {
    const a: Attraction = {
      id: newId(),
      country: newCountry.trim(),
      name: '',
      address: '',
      url: '',
      notes: '',
      priority: 0,
    }
    await db.attractions.add(a)
  }

  const update = (id: string, patch: Partial<Attraction>) => db.attractions.update(id, patch)
  const remove = (id: string) => db.attractions.delete(id)

  const groups = groupByCountry(attractions ?? [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-xl font-bold">景點庫</h1>
          <p className="text-sm text-gray-500">依國家／地區分組，可重複用於各旅程行程的下拉選單。</p>
        </div>
        <div className="ml-auto flex items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">國家／地區</span>
            <TextInput
              value={newCountry}
              placeholder="例：大阪"
              onChange={setNewCountry}
              className="w-40"
            />
          </label>
          <button
            onClick={addRow}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            + 新增景點
          </button>
        </div>
      </div>

      {groups.length === 0 && (
        <p className="rounded border border-dashed p-8 text-center text-gray-500">
          尚無景點。在右上輸入國家／地區後按「新增景點」。
        </p>
      )}

      {groups.map(([country, list]) => (
        <div key={country} className="overflow-x-auto rounded-lg border bg-white">
          <div className="border-b bg-gray-50 px-3 py-2 text-sm font-semibold">
            {country || '未分類'}（{list.length}）
          </div>
          <table className="w-full min-w-[50rem] text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <Th>景點</Th>
                <Th>地址</Th>
                <Th>網址</Th>
                <Th>備註</Th>
                <Th className="text-right">優先度</Th>
                <Th>地區</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-t">
                  <Td className="min-w-[8rem]">
                    <TextInput value={a.name} onChange={(v) => update(a.id, { name: v })} />
                  </Td>
                  <Td className="min-w-[10rem]">
                    <TextInput value={a.address} onChange={(v) => update(a.id, { address: v })} />
                  </Td>
                  <Td className="min-w-[10rem]">
                    <TextInput
                      value={a.url}
                      placeholder="https://"
                      onChange={(v) => update(a.id, { url: v })}
                    />
                  </Td>
                  <Td className="min-w-[8rem]">
                    <TextInput value={a.notes} onChange={(v) => update(a.id, { notes: v })} />
                  </Td>
                  <Td className="w-20">
                    <NumberInput value={a.priority} onChange={(n) => update(a.id, { priority: n })} />
                  </Td>
                  <Td className="w-28">
                    <TextInput value={a.country} onChange={(v) => update(a.id, { country: v })} />
                  </Td>
                  <Td>
                    <IconButton title="刪除這個景點" onClick={() => remove(a.id)}>
                      ✕
                    </IconButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
