import { useMemo, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip, ItineraryItem } from '../../types'
import { db } from '../../db/db'
import { newId } from '../../lib/id'
import { TextInput, DateInput, TimeInput, NumberInput, IconButton, Th, Td } from '../cells'
import AttractionPicker from '../AttractionPicker'
import LinkField from '../LinkField'
import { itinerarySubtotal, itineraryForeignSubtotal, fmt } from '../../lib/money'
import {
  groupItineraryByDate,
  itineraryDaySubtotal,
  weekdayLabel,
  hoursBetween,
} from '../../lib/itinerary'
import { visitedAttractionIds } from '../../lib/visited'
import { itineraryToText } from '../../lib/exportItinerary'
import { parseLink } from '../../lib/link'

export default function ItineraryTab({ trip }: { trip: Trip }) {
  const items = useLiveQuery(
    () => db.itinerary.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
  )
  const attractions = useLiveQuery(() => db.attractions.toArray(), [], [])
  const allItinerary = useLiveQuery(() => db.itinerary.toArray(), [], [])
  const visitedIds = useMemo(
    () => visitedAttractionIds(allItinerary ?? []),
    [allItinerary],
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

  async function addRow(prefillDate = '') {
    const list = items ?? []
    const sort = (list.length ? list[list.length - 1].sort : 0) + 1
    const row: ItineraryItem = {
      id: newId(),
      tripId: trip.id,
      date: prefillDate,
      time: '',
      endTime: '',
      attractionId: '',
      activity: '',
      hours: 0,
      transportCost: 0,
      activityCost: 0,
      paidBy: '',
      payerId: '',
      participantIds: [],
      notes: '',
      link: '',
      sort,
    }
    await db.itinerary.add(row)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(row.id)
      return next
    })
  }

  const update = (id: string, patch: Partial<ItineraryItem>) => db.itinerary.update(id, patch)
  const remove = (id: string) => db.itinerary.delete(id)

  function updateStart(it: ItineraryItem, v: string) {
    const h = hoursBetween(v, it.endTime ?? '')
    if (h !== null) update(it.id, { time: v, hours: h })
    else update(it.id, { time: v })
  }
  function updateEnd(it: ItineraryItem, v: string) {
    const h = hoursBetween(it.time, v)
    if (h !== null) update(it.id, { endTime: v, hours: h })
    else update(it.id, { endTime: v })
  }

  const list = items ?? []
  const cur = trip.currencyLabel || trip.currencyCode
  const groups = groupItineraryByDate(list, {
    startDate: trip.startDate,
    endDate: trip.endDate,
  })
  const grandSub = itineraryDaySubtotal(list, trip)
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        itineraryToText(trip, groups, attractions ?? []),
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('複製失敗，請改用匯出備份')
    }
  }

  function attractionName(id: string): string | null {
    if (!id) return null
    const a = (attractions ?? []).find((x) => x.id === id)
    return a?.name ?? '(景點已刪除)'
  }

  function timeSummary(it: ItineraryItem): { text: string; muted: boolean } {
    const s = it.time
    const e = it.endTime ?? ''
    if (!s && !e) return { text: '--:--', muted: true }
    if (s && e) return { text: `${s}–${e}`, muted: false }
    return { text: s || e, muted: false }
  }

  function renderRow(it: ItineraryItem) {
    return (
      <tr key={it.id} className="border-t">
        <Td className="w-32">
          <DateInput value={it.date} onChange={(v) => update(it.id, { date: v })} />
        </Td>
        <Td className="w-20">
          <TimeInput value={it.time} onChange={(v) => updateStart(it, v)} />
        </Td>
        <Td className="w-20">
          <TimeInput value={it.endTime ?? ''} onChange={(v) => updateEnd(it, v)} />
        </Td>
        <AttractionPicker
          attractions={attractions ?? []}
          value={it.attractionId}
          onChange={(id) => update(it.id, { attractionId: id })}
          country={trip.country ?? ''}
          defaultCity={trip.city ?? ''}
          visitedIds={visitedIds}
        />
        <Td className="w-20">
          <NumberInput value={it.hours} onChange={(n) => update(it.id, { hours: n })} />
        </Td>
        <Td className="w-24">
          <NumberInput
            value={it.transportCost}
            onChange={(n) => update(it.id, { transportCost: n })}
          />
        </Td>
        <Td className="w-24">
          <NumberInput
            value={it.activityCost}
            onChange={(n) => update(it.id, { activityCost: n })}
          />
        </Td>
        <Td className="w-24 text-right font-medium tabular-nums">
          <div>{fmt(itineraryForeignSubtotal(it))}</div>
          <div className="text-xs font-normal text-gray-400">
            {fmt(itinerarySubtotal(it, trip))}
          </div>
        </Td>
        <Td className="min-w-[8rem]">
          <TextInput value={it.notes} onChange={(v) => update(it.id, { notes: v })} />
        </Td>
        <Td className="w-40">
          <LinkField value={it.link} onChange={(v) => update(it.id, { link: v })} />
        </Td>
        <Td>
          <IconButton title="刪除這列" onClick={() => remove(it.id)}>
            ✕
          </IconButton>
        </Td>
      </tr>
    )
  }

  function renderHead() {
    return (
      <thead className="bg-gray-50 text-left text-xs text-gray-500">
        <tr>
          <Th>日期</Th>
          <Th>開始</Th>
          <Th>結束</Th>
          <Th>類型</Th>
          <Th>都市</Th>
          <Th>景點</Th>
          <Th className="text-right">時數</Th>
          <Th className="text-right">交通({cur})</Th>
          <Th className="text-right">花費({cur})</Th>
          <Th className="text-right">小計({cur})</Th>
          <Th>備註</Th>
          <Th>連結</Th>
          <Th></Th>
        </tr>
      </thead>
    )
  }

  function renderCard(it: ItineraryItem) {
    const expanded = expandedIds.has(it.id)
    const name = attractionName(it.attractionId)
    const t = timeSummary(it)
    const foreign = itineraryForeignSubtotal(it)
    const p = parseLink(it.link)
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
            <span
              className={`shrink-0 tabular-nums ${t.muted ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {t.text}
            </span>
            <span className="flex-1 truncate">
              {name === null ? (
                <span className="text-gray-400">(未選景點)</span>
              ) : (
                name
              )}
            </span>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="max-w-[7.5rem] shrink-0 truncate text-xs text-sky-600 underline decoration-sky-300 underline-offset-2"
              >
                {p.text || p.url}
              </a>
            )}
            <span className="shrink-0 text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
          </div>
          {it.notes && (
            <div className="truncate px-3 pb-2 text-xs text-gray-400">
              {it.notes}
            </div>
          )}
        </div>
        {expanded && (
          <div className="space-y-2 border-t bg-gray-50/50 px-3 py-3">
            <CardField label="日期">
              <DateInput value={it.date} onChange={(v) => update(it.id, { date: v })} />
            </CardField>
            <div className="grid grid-cols-2 gap-2">
              <CardField label="開始">
                <TimeInput value={it.time} onChange={(v) => updateStart(it, v)} />
              </CardField>
              <CardField label="結束">
                <TimeInput
                  value={it.endTime ?? ''}
                  onChange={(v) => updateEnd(it, v)}
                />
              </CardField>
            </div>
            <AttractionPicker
              attractions={attractions ?? []}
              value={it.attractionId}
              onChange={(id) => update(it.id, { attractionId: id })}
              country={trip.country ?? ''}
              defaultCity={trip.city ?? ''}
              visitedIds={visitedIds}
              variant="stack"
            />
            <CardField label="時數">
              <NumberInput value={it.hours} onChange={(n) => update(it.id, { hours: n })} />
            </CardField>
            <div className="grid grid-cols-2 gap-2">
              <CardField label={`交通(${cur})`}>
                <NumberInput
                  value={it.transportCost}
                  onChange={(n) => update(it.id, { transportCost: n })}
                />
              </CardField>
              <CardField label={`花費(${cur})`}>
                <NumberInput
                  value={it.activityCost}
                  onChange={(n) => update(it.id, { activityCost: n })}
                />
              </CardField>
            </div>
            <div className="text-right text-xs text-gray-600">
              小計 {cur}{' '}
              <b className="tabular-nums text-sm text-gray-800">{fmt(foreign)}</b>
              <span className="ml-2 text-gray-400">
                （台幣 {fmt(itinerarySubtotal(it, trip))}）
              </span>
            </div>
            <CardField label="備註">
              <TextInput value={it.notes} onChange={(v) => update(it.id, { notes: v })} />
            </CardField>
            <CardField label="連結">
              <LinkField value={it.link} onChange={(v) => update(it.id, { link: v })} />
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
      {groups.length === 0 ? (
        <div className="rounded-lg border bg-white">
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[76rem] text-sm">
              {renderHead()}
              <tbody>
                <tr>
                  <td colSpan={13} className="p-6 text-center text-gray-400">
                    尚無行程，點下方「新增一列」。先到「景點庫」加景點，這裡的「景點」欄就能下拉選取。
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-6 text-center text-sm text-gray-400 sm:hidden">
            尚無行程，點下方「新增一列」。先到「景點庫」加景點，這裡的「景點」欄就能下拉選取。
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g) => {
            const wk = weekdayLabel(g.date)
            const title = g.date ? `${g.date}${wk ? ` (${wk})` : ''}` : '未排日期'
            if (g.items.length === 0) {
              return (
                <div
                  key={g.date || '__undated__'}
                  className="overflow-hidden rounded-lg border bg-white"
                >
                  <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50 px-3 py-2 text-sm">
                    <div className="font-medium">{title}</div>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 text-sm">
                    <button
                      onClick={() => addRow(g.date)}
                      className="text-sky-600 hover:text-sky-700"
                    >
                      + 在{g.date ? '這天' : '未排日期'}新增一列
                    </button>
                  </div>
                </div>
              )
            }
            const sub = itineraryDaySubtotal(g.items, trip)
            return (
              <div
                key={g.date || '__undated__'}
                className="overflow-hidden rounded-lg border bg-white"
              >
                <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50 px-3 py-2 text-sm">
                  <div className="font-medium">{title}</div>
                  <div className="ml-auto text-xs text-gray-600">
                    當日 <b className="tabular-nums">{fmt(sub.hours)}</b> 小時 ·{' '}
                    {cur} <b className="tabular-nums">{fmt(sub.foreign)}</b> · 台幣{' '}
                    <b className="tabular-nums">{fmt(sub.twd)}</b>
                  </div>
                </div>
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[76rem] text-sm">
                    {renderHead()}
                    <tbody>{g.items.map(renderRow)}</tbody>
                  </table>
                </div>
                <div className="divide-y sm:hidden">
                  {g.items.map(renderCard)}
                </div>
                <div className="border-t bg-gray-50 px-3 py-2 text-sm">
                  <button
                    onClick={() => addRow(g.date)}
                    className="text-sky-600 hover:text-sky-700"
                  >
                    + 在{g.date ? '這天' : '未排日期'}新增一列
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => addRow('')}
          className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          + 新增一列
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="text-sm text-gray-600">
            總計 <b className="tabular-nums">{fmt(grandSub.hours)}</b> 小時 ·{' '}
            {cur} <b className="tabular-nums">{fmt(grandSub.foreign)}</b> · 台幣{' '}
            <b className="tabular-nums">{fmt(grandSub.twd)}</b>
          </div>
          <button
            onClick={handleCopy}
            className="rounded border px-2.5 py-1.5 text-sm hover:bg-gray-50"
          >
            {copied ? '已複製 ✓' : '複製行程文字'}
          </button>
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
