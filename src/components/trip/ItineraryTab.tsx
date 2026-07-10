import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip, ItineraryItem } from '../../types'
import { db } from '../../db/db'
import { newId } from '../../lib/id'
import { TextInput, DateInput, TimeInput, NumberInput, IconButton, Th, Td } from '../cells'
import AttractionPicker from '../AttractionPicker'
import { itinerarySubtotal, itineraryForeignSubtotal, fmt } from '../../lib/money'
import {
  groupItineraryByDate,
  itineraryDaySubtotal,
  weekdayLabel,
  hoursBetween,
} from '../../lib/itinerary'
import { visitedAttractionIds } from '../../lib/visited'

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

  function renderRow(it: ItineraryItem) {
    return (
      <tr key={it.id} className="border-t">
        <Td className="w-32">
          <DateInput value={it.date} onChange={(v) => update(it.id, { date: v })} />
        </Td>
        <Td className="w-24">
          <TimeInput value={it.time} onChange={(v) => updateStart(it, v)} />
        </Td>
        <Td className="w-24">
          <TimeInput value={it.endTime ?? ''} onChange={(v) => updateEnd(it, v)} />
        </Td>
        <Td>
          <AttractionPicker
            attractions={attractions ?? []}
            value={it.attractionId}
            onChange={(id) => update(it.id, { attractionId: id })}
            country={trip.country ?? ''}
            defaultCity={trip.city ?? ''}
            visitedIds={visitedIds}
          />
        </Td>
        <Td className="min-w-[10rem]">
          <TextInput value={it.activity} onChange={(v) => update(it.id, { activity: v })} />
        </Td>
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
          <div className="flex items-center gap-1">
            <TextInput
              value={it.link}
              placeholder="https://"
              onChange={(v) => update(it.id, { link: v })}
            />
            {it.link.trim() && (
              <button
                type="button"
                title="開啟連結"
                onClick={() => window.open(it.link, '_blank', 'noopener')}
                className="shrink-0 rounded px-1.5 py-1 text-xs text-gray-500 hover:bg-sky-50 hover:text-sky-700"
              >
                ↗
              </button>
            )}
          </div>
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
          <Th>景點</Th>
          <Th>行程／活動</Th>
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

  return (
    <div className="space-y-3">
      {groups.length === 0 ? (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full min-w-[72rem] text-sm">
            {renderHead()}
            <tbody>
              <tr>
                <td colSpan={12} className="p-6 text-center text-gray-400">
                  尚無行程，點下方「新增一列」。先到「景點庫」加景點，這裡的「景點」欄就能下拉選取。
                </td>
              </tr>
            </tbody>
          </table>
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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[72rem] text-sm">
                    {renderHead()}
                    <tbody>{g.items.map(renderRow)}</tbody>
                  </table>
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
        <div className="ml-auto text-sm text-gray-600">
          總計 <b className="tabular-nums">{fmt(grandSub.hours)}</b> 小時 ·{' '}
          {cur} <b className="tabular-nums">{fmt(grandSub.foreign)}</b> · 台幣{' '}
          <b className="tabular-nums">{fmt(grandSub.twd)}</b>
        </div>
      </div>
    </div>
  )
}
