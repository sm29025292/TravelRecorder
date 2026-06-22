import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip, ShoppingItem } from '../../types'
import { db } from '../../db/db'
import { newId } from '../../lib/id'
import { TextInput, DateInput, TimeInput, NumberInput, Select, IconButton, Th, Td } from '../cells'
import MemberSelect from '../MemberSelect'
import ParticipantsPicker from '../ParticipantsPicker'
import { expenseSubtotal, expensesTotal, fmt } from '../../lib/money'

export default function ShoppingTab({ trip }: { trip: Trip }) {
  const items = useLiveQuery(
    () => db.shopping.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
  )
  const members = useLiveQuery(
    () => db.members.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
    [],
  )

  async function addRow() {
    const list = items ?? []
    const sort = (list.length ? list[list.length - 1].sort : 0) + 1
    const row: ShoppingItem = {
      id: newId(),
      tripId: trip.id,
      date: '',
      time: '',
      item: '',
      currency: trip.currencyCode,
      amount: 0,
      fee: 0,
      payerId: '',
      participantIds: [],
      notes: '',
      sort,
    }
    await db.shopping.add(row)
  }

  const update = (id: string, patch: Partial<ShoppingItem>) => db.shopping.update(id, patch)
  const remove = (id: string) => db.shopping.delete(id)

  const list = items ?? []
  const total = expensesTotal(list, trip)

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        購物預設全體均分；若是個人購買，把「分攤」改成只有自己即可（由「付錢」的人代墊）。
      </p>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[64rem] text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <Th>日期</Th>
              <Th>時間</Th>
              <Th>項目</Th>
              <Th>幣別</Th>
              <Th className="text-right">金額</Th>
              <Th className="text-right">手續費(元)</Th>
              <Th className="text-right">小計(元)</Th>
              <Th>付錢</Th>
              <Th>分攤</Th>
              <Th>備註</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {list.map((it) => (
              <tr key={it.id} className="border-t">
                <Td className="w-32">
                  <DateInput value={it.date} onChange={(v) => update(it.id, { date: v })} />
                </Td>
                <Td className="w-24">
                  <TimeInput value={it.time} onChange={(v) => update(it.id, { time: v })} />
                </Td>
                <Td className="min-w-[8rem]">
                  <TextInput value={it.item} onChange={(v) => update(it.id, { item: v })} />
                </Td>
                <Td className="w-24">
                  <Select value={it.currency} onChange={(v) => update(it.id, { currency: v })}>
                    <option value={trip.currencyCode}>{trip.currencyLabel || trip.currencyCode}</option>
                    <option value="TWD">台幣</option>
                  </Select>
                </Td>
                <Td className="w-28">
                  <NumberInput value={it.amount} onChange={(n) => update(it.id, { amount: n })} />
                </Td>
                <Td className="w-24">
                  <NumberInput value={it.fee} onChange={(n) => update(it.id, { fee: n })} />
                </Td>
                <Td className="w-28 text-right font-medium tabular-nums">
                  {fmt(expenseSubtotal(it, trip))}
                </Td>
                <Td className="w-24">
                  <MemberSelect
                    members={members ?? []}
                    value={it.payerId ?? ''}
                    onChange={(v) => update(it.id, { payerId: v })}
                  />
                </Td>
                <Td className="w-28">
                  <ParticipantsPicker
                    members={members ?? []}
                    value={it.participantIds ?? []}
                    onChange={(v) => update(it.id, { participantIds: v })}
                  />
                </Td>
                <Td className="min-w-[8rem]">
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
                <td colSpan={11} className="p-6 text-center text-gray-400">
                  尚無購物紀錄，點下方「新增一列」。
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
        <div className="ml-auto text-sm">
          購物總計：<b className="tabular-nums">{fmt(total)}</b> 元
        </div>
      </div>
    </div>
  )
}
