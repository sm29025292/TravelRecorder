import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { newId, now } from '../lib/id'
import type { PackingItem, Trip } from '../types'

export default function TripList() {
  const navigate = useNavigate()
  const trips = useLiveQuery(() => db.trips.orderBy('updatedAt').reverse().toArray())

  async function addTrip() {
    const ts = now()
    const trip: Trip = {
      id: newId(),
      name: '新旅程',
      country: '',
      city: '',
      region: '',
      startDate: '',
      endDate: '',
      currencyCode: 'JPY',
      currencyLabel: '日元',
      exchangeRate: 0.21,
      peopleCount: 2,
      createdAt: ts,
      updatedAt: ts,
    }
    await db.transaction('rw', db.trips, db.packing, async () => {
      const prev = await db.trips.orderBy('updatedAt').last()
      await db.trips.add(trip)
      if (prev) {
        const prevPacking = await db.packing.where('tripId').equals(prev.id).sortBy('sort')
        if (prevPacking.length > 0) {
          const cloned: PackingItem[] = prevPacking.map((p) => ({
            ...p,
            id: newId(),
            tripId: trip.id,
            checked: false,
          }))
          await db.packing.bulkAdd(cloned)
        }
      }
    })
    navigate(`/trip/${trip.id}`)
  }

  async function removeTrip(id: string, name: string) {
    if (!confirm(`確定刪除旅程「${name || '未命名'}」？相關花費、行程、購物、人員、行李也會一併刪除。`)) return
    await db.transaction(
      'rw',
      [db.trips, db.expenses, db.itinerary, db.members, db.shopping, db.packing],
      async () => {
        await db.expenses.where('tripId').equals(id).delete()
        await db.itinerary.where('tripId').equals(id).delete()
        await db.members.where('tripId').equals(id).delete()
        await db.shopping.where('tripId').equals(id).delete()
        await db.packing.where('tripId').equals(id).delete()
        await db.trips.delete(id)
      },
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">我的旅程</h1>
        <button
          onClick={addTrip}
          className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          + 新增旅程
        </button>
      </div>

      {trips && trips.length === 0 && (
        <p className="rounded border border-dashed p-8 text-center text-gray-500">
          尚無旅程，點右上角「新增旅程」開始規劃。
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trips?.map((t) => (
          <div key={t.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/trip/${t.id}`}
                className="text-lg font-semibold text-sky-700 hover:underline"
              >
                {t.name || '(未命名旅程)'}
              </Link>
              <button
                onClick={() => removeTrip(t.id, t.name)}
                className="shrink-0 text-sm text-gray-400 hover:text-red-600"
              >
                刪除
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {[t.country, t.city].filter(Boolean).join(' ') || t.region || '—'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t.startDate || '?'} ～ {t.endDate || '?'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
