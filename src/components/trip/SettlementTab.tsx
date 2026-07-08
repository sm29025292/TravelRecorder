import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip, Member } from '../../types'
import { db } from '../../db/db'
import { newId } from '../../lib/id'
import { TextInput, DateInput, IconButton, Th, Td } from '../cells'
import { expenseSubtotal, settle, fmt } from '../../lib/money'
import type { SettleEntry } from '../../lib/money'

export default function SettlementTab({ trip }: { trip: Trip }) {
  const members = useLiveQuery(
    () => db.members.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
    [],
  )
  const expenses = useLiveQuery(
    () => db.expenses.where('tripId').equals(trip.id).toArray(),
    [trip.id],
    [],
  )

  async function addMember() {
    const list = members ?? []
    const sort = (list.length ? list[list.length - 1].sort : 0) + 1
    const m: Member = {
      id: newId(),
      tripId: trip.id,
      name: '',
      passportName: '',
      passportNumber: '',
      birthday: '',
      sort,
    }
    await db.members.add(m)
  }
  const updateM = (id: string, patch: Partial<Member>) => db.members.update(id, patch)
  const removeM = (id: string) => db.members.delete(id)

  const ms = members ?? []
  const memberIds = ms.map((m) => m.id)
  const nameOf = (id: string) => ms.find((m) => m.id === id)?.name || '(未命名)'

  const entries: SettleEntry[] = []
  for (const e of expenses ?? []) {
    if (e.paymentStatus === '已結清') continue // T19：已私下處理的債務，付錢與分攤都不計入
    entries.push({ payerId: e.payerId ?? '', amount: expenseSubtotal(e, trip), beneficiaryIds: e.participantIds ?? [] })
  }

  const { balances, transfers } = settle(memberIds, entries)
  const balOf = (id: string) => balances.find((b) => b.id === id)

  return (
    <div className="space-y-6">
      {/* 同行者 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">同行者</h2>
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <Th>姓名</Th>
                <Th>護照名</Th>
                <Th>護照號碼</Th>
                <Th>生日</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {ms.map((m) => (
                <tr key={m.id} className="border-t">
                  <Td className="min-w-[7rem]">
                    <TextInput value={m.name} onChange={(v) => updateM(m.id, { name: v })} />
                  </Td>
                  <Td className="min-w-[8rem]">
                    <TextInput
                      value={m.passportName}
                      placeholder="LIN,LIWEN"
                      onChange={(v) => updateM(m.id, { passportName: v })}
                    />
                  </Td>
                  <Td className="min-w-[8rem]">
                    <TextInput
                      value={m.passportNumber}
                      onChange={(v) => updateM(m.id, { passportNumber: v })}
                    />
                  </Td>
                  <Td className="w-40">
                    <DateInput value={m.birthday} onChange={(v) => updateM(m.id, { birthday: v })} />
                  </Td>
                  <Td>
                    <IconButton title="刪除這位成員" onClick={() => removeM(m.id)}>
                      ✕
                    </IconButton>
                  </Td>
                </tr>
              ))}
              {ms.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    尚無同行者，點下方「新增同行者」。加了成員後，花費／行程／購物的「付錢」「分攤」才能選人。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={addMember}
          className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          + 新增同行者
        </button>
      </section>

      {/* 分帳結算 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">分帳結算</h2>
        <p className="text-sm text-gray-500">
          彙整花費：每筆依「付錢」與「分攤」計算，預設全體均分；「付錢」未指定或標「已結清」的列不列入結算。
        </p>

        {ms.length === 0 ? (
          <p className="rounded border border-dashed p-6 text-center text-gray-400">先新增同行者才能結算。</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full min-w-[32rem] text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-500">
                  <tr>
                    <Th>成員</Th>
                    <Th className="text-right">已付(元)</Th>
                    <Th className="text-right">應分攤(元)</Th>
                    <Th className="text-right">結餘(元)</Th>
                  </tr>
                </thead>
                <tbody>
                  {ms.map((m) => {
                    const b = balOf(m.id)
                    const bal = b?.balance ?? 0
                    return (
                      <tr key={m.id} className="border-t">
                        <Td>{m.name || '(未命名)'}</Td>
                        <Td className="text-right tabular-nums">{fmt(b?.paid ?? 0)}</Td>
                        <Td className="text-right tabular-nums">{fmt(b?.share ?? 0)}</Td>
                        <Td
                          className={`text-right font-medium tabular-nums ${
                            bal > 0 ? 'text-green-600' : bal < 0 ? 'text-red-600' : ''
                          }`}
                        >
                          {bal > 0 ? `應收 +${fmt(bal)}` : bal < 0 ? `應付 ${fmt(bal)}` : '0'}
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold">結算建議</h3>
              {transfers.length === 0 ? (
                <p className="text-sm text-gray-500">已結清，無需轉帳。</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {transfers.map((t, i) => (
                    <li key={i}>
                      <span className="font-medium text-red-600">{nameOf(t.from)}</span> 應付給{' '}
                      <span className="font-medium text-green-600">{nameOf(t.to)}</span>{' '}
                      <b className="tabular-nums">{fmt(t.amount)}</b> 元
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
