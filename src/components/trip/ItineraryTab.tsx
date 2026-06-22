import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip, ItineraryItem } from '../../types'
import { db } from '../../db/db'
import { newId } from '../../lib/id'
import { TextInput, DateInput, TimeInput, NumberInput, IconButton, Th, Td } from '../cells'
import AttractionPicker from '../AttractionPicker'
import MemberSelect from '../MemberSelect'
import ParticipantsPicker from '../ParticipantsPicker'
import { itinerarySubtotal, itineraryTotal, fmt } from '../../lib/money'

export default function ItineraryTab({ trip }: { trip: Trip }) {
  const items = useLiveQuery(
    () => db.itinerary.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
  )
  const attractions = useLiveQuery(() => db.attractions.toArray(), [], [])
  const members = useLiveQuery(
    () => db.members.where('tripId').equals(trip.id).sortBy('sort'),
    [trip.id],
    [],
  )

  async function addRow() {
    const list = items ?? []
    const sort = (list.length ? list[list.length - 1].sort : 0) + 1
    const row: ItineraryItem = {
      id: newId(),
      tripId: trip.id,
      date: '',
      time: '',
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

  const list = items ?? []
  const cur = trip.currencyLabel || trip.currencyCode
  const total = itineraryTotal(list, trip)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[78rem] text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <Th>日期</Th>
              <Th>時間</Th>
              <Th>景點</Th>
              <Th>行程／活動</Th>
              <Th className="text-right">時數</Th>
              <Th className="text-right">交通({cur})</Th>
              <Th className="text-right">花費({cur})</Th>
              <Th className="text-right">小計(元)</Th>
              <Th>付錢</Th>
              <Th>分攤</Th>
              <Th>備註</Th>
              <Th>連結</Th>
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
                <Td>
                  <AttractionPicker
                    attractions={attractions ?? []}
                    value={it.attractionId}
                    onChange={(id) => update(it.id, { attractionId: id })}
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
                  {fmt(itinerarySubtotal(it, trip))}
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
                <Td className="w-40">
                  <TextInput
                    value={it.link}
                    placeholder="https://"
                    onChange={(v) => update(it.id, { link: v })}
                  />
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
                <td colSpan={13} className="p-6 text-center text-gray-400">
                  尚無行程，點下方「新增一列」。先到「景點庫」加景點，這裡的「景點」欄就能下拉選取。
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
          交通＋花費小計：<b className="tabular-nums">{fmt(total)}</b> 元
        </div>
      </div>
    </div>
  )
}
