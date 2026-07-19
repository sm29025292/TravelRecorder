import { useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip, Member } from '../../types'
import { db } from '../../db/db'
import { newId } from '../../lib/id'
import { TextInput, DateInput, IconButton, Th, Td } from '../cells'
import { settleByCurrency, fmt } from '../../lib/money'
import type { CurrencySettleEntry } from '../../lib/money'

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

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

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
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(m.id)
      return next
    })
  }
  const updateM = (id: string, patch: Partial<Member>) => db.members.update(id, patch)
  const removeM = (id: string) => db.members.delete(id)

  const ms = members ?? []
  const memberIds = ms.map((m) => m.id)
  const nameOf = (id: string) => ms.find((m) => m.id === id)?.name || '(未命名)'

  const entries: CurrencySettleEntry[] = []
  for (const e of expenses ?? []) {
    if (e.paymentStatus === '已結清') continue // T19：已私下處理的債務，付錢與分攤都不計入
    const payerId = e.payerId ?? ''
    const beneficiaryIds = e.participantIds ?? []
    // T24：金額入該列幣別的桶（不換匯）；「手續費(元)」是台幣，另計一筆入 TWD 桶
    entries.push({ payerId, currency: e.currency, amount: e.amount || 0, beneficiaryIds })
    if (e.fee) entries.push({ payerId, currency: 'TWD', amount: e.fee, beneficiaryIds })
  }

  const settlements = settleByCurrency(memberIds, entries)

  return (
    <div className="space-y-6">
      {/* 同行者 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">同行者</h2>
        <div className="rounded-lg border bg-white">
          <div className="hidden overflow-x-auto sm:block">
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
          <div className="divide-y sm:hidden">
            {ms.map((m) => {
              const expanded = expandedIds.has(m.id)
              return (
                <div key={m.id}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggleExpand(m.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <span className="flex-1 truncate">
                      {m.name || <span className="text-gray-400">(未命名)</span>}
                    </span>
                    {m.passportName && (
                      <span className="shrink-0 text-xs text-gray-500">{m.passportName}</span>
                    )}
                    <span className="shrink-0 text-xs text-gray-400">
                      {expanded ? '▲' : '▼'}
                    </span>
                  </button>
                  {expanded && (
                    <div className="space-y-2 border-t bg-gray-50/50 px-3 py-3">
                      <CardField label="姓名">
                        <TextInput value={m.name} onChange={(v) => updateM(m.id, { name: v })} />
                      </CardField>
                      <CardField label="護照名">
                        <TextInput
                          value={m.passportName}
                          onChange={(v) => updateM(m.id, { passportName: v })}
                        />
                      </CardField>
                      <CardField label="護照號碼">
                        <TextInput
                          value={m.passportNumber}
                          onChange={(v) => updateM(m.id, { passportNumber: v })}
                        />
                      </CardField>
                      <CardField label="生日">
                        <DateInput
                          value={m.birthday}
                          onChange={(v) => updateM(m.id, { birthday: v })}
                        />
                      </CardField>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => removeM(m.id)}
                          className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          ✕ 刪除這位成員
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {ms.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                尚無同行者，點下方「新增同行者」。加了成員後，花費／行程／購物的「付錢」「分攤」才能選人。
              </div>
            )}
          </div>
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
          彙整花費：每筆依「付錢」與「分攤」計算，預設全體均分；台幣與外幣各自結算、不換匯（外幣列的手續費以台幣計）；「付錢」未指定或標「已結清」的列不列入結算。
        </p>

        {ms.length === 0 ? (
          <p className="rounded border border-dashed p-6 text-center text-gray-400">先新增同行者才能結算。</p>
        ) : settlements.length === 0 ? (
          <p className="rounded border border-dashed p-6 text-center text-gray-400">尚無可結算的花費。</p>
        ) : (
          settlements.map(({ currency, balances, transfers }) => {
            const unit = currency === 'TWD' ? '元' : currency
            const title =
              currency === 'TWD'
                ? '台幣'
                : currency === trip.currencyCode && trip.currencyLabel
                  ? `${trip.currencyLabel}（${currency}）`
                  : currency
            const balOf = (id: string) => balances.find((b) => b.id === id)
            return (
              <div key={currency} className="space-y-3">
                <h3 className="text-base font-semibold">{title}</h3>
                <div className="overflow-x-auto rounded-lg border bg-white">
                  <table className="w-full text-sm sm:min-w-[32rem]">
                    <thead className="bg-gray-50 text-left text-xs text-gray-500">
                      <tr>
                        <Th>成員</Th>
                        <Th className="text-right">已付({unit})</Th>
                        <Th className="text-right">應分攤({unit})</Th>
                        <Th className="text-right">結餘({unit})</Th>
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
                          <b className="tabular-nums">{fmt(t.amount)}</b> {unit}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })
        )}
      </section>
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
