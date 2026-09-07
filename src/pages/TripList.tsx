import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { newId, now } from '../lib/id'
import type { Member, PackingItem, Trip } from '../types'

export default function TripList() {
  const navigate = useNavigate()
  const trips = useLiveQuery(() => db.trips.orderBy('updatedAt').reverse().toArray())
  const [adding, setAdding] = useState(false)
  const [copyFromId, setCopyFromId] = useState('')

  /**
   * 建立新旅程。
   * source 為 null → 全新空白旅程；為某 Trip → 複製其「旅程基本設定＋同行者＋行李清單」
   * （不含逐日行程與花費；日期一律留空待填、行李勾選狀態歸零、成員/行李 id 皆換發）。
   */
  async function createTrip(source: Trip | null) {
    const ts = now()
    const trip: Trip = source
      ? {
          id: newId(),
          name: `${source.name || '旅程'}（複製）`,
          country: source.country,
          city: source.city,
          region: source.region,
          startDate: '', // 日期留空待填
          endDate: '',
          currencyCode: source.currencyCode,
          currencyLabel: source.currencyLabel,
          exchangeRate: source.exchangeRate,
          peopleCount: source.peopleCount,
          createdAt: ts,
          updatedAt: ts,
        }
      : {
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
    await db.transaction('rw', db.trips, db.members, db.packing, async () => {
      await db.trips.add(trip)
      if (source) {
        const srcMembers = await db.members.where('tripId').equals(source.id).sortBy('sort')
        if (srcMembers.length > 0) {
          const clonedMembers: Member[] = srcMembers.map((m) => ({
            ...m,
            id: newId(),
            tripId: trip.id,
          }))
          await db.members.bulkAdd(clonedMembers)
        }
        const srcPacking = await db.packing.where('tripId').equals(source.id).sortBy('sort')
        if (srcPacking.length > 0) {
          const clonedPacking: PackingItem[] = srcPacking.map((p) => ({
            ...p,
            id: newId(),
            tripId: trip.id,
            checked: false, // 勾選狀態歸零
          }))
          await db.packing.bulkAdd(clonedPacking)
        }
      }
    })
    navigate(`/trip/${trip.id}`)
  }

  function openAdd() {
    // 沒有既有旅程可複製時，直接建立空白旅程、不必跳對話框
    if (!trips || trips.length === 0) {
      void createTrip(null)
      return
    }
    setCopyFromId('')
    setAdding(true)
  }

  async function confirmCopy() {
    const source = trips?.find((t) => t.id === copyFromId)
    if (!source) return
    setAdding(false)
    await createTrip(source)
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
          onClick={openAdd}
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

      {/* 新增旅程對話框：選擇全空或從既有旅程複製 */}
      {adding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setAdding(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">新增旅程</h2>

            <button
              onClick={() => {
                setAdding(false)
                void createTrip(null)
              }}
              className="mt-3 w-full rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              建立全新空白旅程
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              或從既有旅程複製
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <label className="block text-sm">
              <span className="mb-1 block text-gray-600">來源旅程</span>
              <select
                value={copyFromId}
                onChange={(e) => setCopyFromId(e.target.value)}
                className="w-full rounded border px-2 py-1.5 text-sm"
              >
                <option value="">— 請選擇 —</option>
                {trips?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || '(未命名旅程)'}
                    {t.startDate ? `（${t.startDate}）` : ''}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-2 text-xs text-gray-500">
              將複製：旅程基本設定（國家／都市／幣別／匯率）、同行者名單、行李清單（勾選狀態歸零）。
              <br />
              不複製逐日行程與花費；日期留空待填。
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setAdding(false)}
                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmCopy}
                disabled={!copyFromId}
                className="rounded bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-40"
              >
                複製並建立
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
