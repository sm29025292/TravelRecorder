import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import OverviewTab from '../components/trip/OverviewTab'
import ExpensesTab from '../components/trip/ExpensesTab'
import ItineraryTab from '../components/trip/ItineraryTab'
import ShoppingTab from '../components/trip/ShoppingTab'
import SettlementTab from '../components/trip/SettlementTab'
import PackingTab from '../components/trip/PackingTab'

type Tab = 'overview' | 'expenses' | 'itinerary' | 'shopping' | 'settlement' | 'packing'

const TABS: Array<[Tab, string]> = [
  ['overview', '總覽'],
  ['expenses', '花費'],
  ['itinerary', '行程'],
  ['shopping', '購物'],
  ['settlement', '分帳'],
  ['packing', '行李'],
]

export default function TripDetail() {
  const { id = '' } = useParams()
  const trip = useLiveQuery(async () => (await db.trips.get(id)) ?? null, [id])
  const [tab, setTab] = useState<Tab>('overview')

  if (trip === undefined) return <p className="text-gray-500">載入中…</p>
  if (trip === null)
    return (
      <p className="text-gray-500">
        找不到這個旅程。{' '}
        <Link to="/" className="text-sky-600 hover:underline">
          回旅程列表
        </Link>
      </p>
    )

  return (
    <div>
      <div className="mb-3">
        <Link to="/" className="text-sm text-sky-600 hover:underline">
          ← 旅程列表
        </Link>
        <h1 className="mt-1 text-xl font-bold">{trip.name || '(未命名旅程)'}</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === k
                ? 'border-b-2 border-sky-600 text-sky-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab trip={trip} />}
      {tab === 'expenses' && <ExpensesTab trip={trip} />}
      {tab === 'itinerary' && <ItineraryTab trip={trip} />}
      {tab === 'shopping' && <ShoppingTab trip={trip} />}
      {tab === 'settlement' && <SettlementTab trip={trip} />}
      {tab === 'packing' && <PackingTab trip={trip} />}
    </div>
  )
}
