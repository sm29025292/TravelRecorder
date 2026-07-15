import { useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip, ExpenseItem } from '../../types'
import { db } from '../../db/db'
import { newId } from '../../lib/id'
import { TextInput, DateInput, TimeInput, NumberInput, Select, IconButton, Th, Td } from '../cells'
import MemberSelect from '../MemberSelect'
import ParticipantsPicker from '../ParticipantsPicker'
import { expenseSubtotal, expensesTotal, expensesAverage, fmt } from '../../lib/money'

export default function ExpensesTab({ trip }: { trip: Trip }) {
  const items = useLiveQuery(
    () => db.expenses.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
  )
  const members = useLiveQuery(
    () => db.members.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
    [],
  )

  // 手機卡片預設收合；新增列後自動展開該卡片。
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
    const row: ExpenseItem = {
      id: newId(),
      tripId: trip.id,
      date: '',
      time: '',
      item: '',
      currency: trip.currencyCode,
      amount: 0,
      fee: 0,
      paid: false,
      paidBy: '',
      payerId: '',
      participantIds: [],
      paymentStatus: '',
      notes: '',
      sort,
    }
    await db.expenses.add(row)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(row.id)
      return next
    })
  }

  const update = (id: string, patch: Partial<ExpenseItem>) => db.expenses.update(id, patch)
  const remove = (id: string) => db.expenses.delete(id)

  const list = items ?? []
  const total = expensesTotal(list, trip)
  // T20：平均分母統一用分帳頁的成員數（trip.peopleCount 已無 UI，欄位保留僅為備份相容）
  const avg = expensesAverage(total, members.length)

  function renderRow(it: ExpenseItem) {
    return (
      <tr key={it.id} className="border-t">
        <Td className="w-32">
          <DateInput value={it.date} onChange={(v) => update(it.id, { date: v })} />
        </Td>
        <Td className="w-16">
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
        <Td className="w-28">
          <Select
            value={it.paymentStatus}
            onChange={(v) => update(it.id, { paymentStatus: v })}
          >
            <option value="">—</option>
            <option value="已付">已付</option>
            <option value="未付">未付</option>
            <option value="已結清">已結清</option>
          </Select>
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
    )
  }

  function renderCard(it: ExpenseItem) {
    const expanded = expandedIds.has(it.id)
    const dateMuted = !it.date
    const itemMuted = !it.item
    const amountText = it.amount ? `${it.currency} ${fmt(it.amount)}` : ''
    return (
      <div key={it.id}>
        <button
          type="button"
          onClick={() => toggleExpand(it.id)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          <span
            className={`shrink-0 tabular-nums ${dateMuted ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {it.date || '--'}
          </span>
          <span
            className={`flex-1 truncate ${itemMuted ? 'text-gray-400' : ''}`}
          >
            {it.item || '(未填)'}
          </span>
          <span className="shrink-0 text-right text-xs tabular-nums text-gray-500">
            {amountText}
          </span>
          <span className="shrink-0 text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
        </button>
        {expanded && (
          <div className="space-y-2 border-t bg-gray-50/50 px-3 py-3">
            <div className="grid grid-cols-2 gap-2">
              <CardField label="日期">
                <DateInput value={it.date} onChange={(v) => update(it.id, { date: v })} />
              </CardField>
              <CardField label="時間">
                <TimeInput value={it.time} onChange={(v) => update(it.id, { time: v })} />
              </CardField>
            </div>
            <CardField label="項目">
              <TextInput value={it.item} onChange={(v) => update(it.id, { item: v })} />
            </CardField>
            <div className="grid grid-cols-2 gap-2">
              <CardField label="幣別">
                <Select value={it.currency} onChange={(v) => update(it.id, { currency: v })}>
                  <option value={trip.currencyCode}>
                    {trip.currencyLabel || trip.currencyCode}
                  </option>
                  <option value="TWD">台幣</option>
                </Select>
              </CardField>
              <CardField label="金額">
                <NumberInput value={it.amount} onChange={(n) => update(it.id, { amount: n })} />
              </CardField>
            </div>
            <CardField label="手續費(元)">
              <NumberInput value={it.fee} onChange={(n) => update(it.id, { fee: n })} />
            </CardField>
            <div className="text-right text-xs text-gray-600">
              小計{' '}
              <b className="tabular-nums text-sm text-gray-800">
                {fmt(expenseSubtotal(it, trip))}
              </b>{' '}
              元
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CardField label="付錢">
                <MemberSelect
                  members={members ?? []}
                  value={it.payerId ?? ''}
                  onChange={(v) => update(it.id, { payerId: v })}
                />
              </CardField>
              <CardField label="分攤">
                <ParticipantsPicker
                  members={members ?? []}
                  value={it.participantIds ?? []}
                  onChange={(v) => update(it.id, { participantIds: v })}
                />
              </CardField>
            </div>
            <CardField label="狀態">
              <Select
                value={it.paymentStatus}
                onChange={(v) => update(it.id, { paymentStatus: v })}
              >
                <option value="">—</option>
                <option value="已付">已付</option>
                <option value="未付">未付</option>
                <option value="已結清">已結清</option>
              </Select>
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
          <table className="w-full min-w-[68rem] text-sm">
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
                <Th>
                  <span title="標「已結清」的列不列入分帳結算">狀態</span>
                </Th>
                <Th>備註</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {list.map(renderRow)}
              {list.length === 0 && (
                <tr>
                  <td colSpan={12} className="p-6 text-center text-gray-400">
                    尚無花費，點下方「新增一列」。
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
              尚無花費，點下方「新增一列」。
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
        <div className="ml-auto flex gap-6 text-sm">
          <span>
            總計：<b className="tabular-nums">{fmt(total)}</b> 元
          </span>
          {members.length > 0 && (
            <span>
              平均（{members.length} 人）：<b className="tabular-nums">{fmt(avg)}</b> 元
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function CardField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-16 shrink-0 text-xs text-gray-500">{label}</span>
      <span className="flex-1">{children}</span>
    </label>
  )
}
