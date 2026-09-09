import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { newId, now } from '../lib/id'
import type { ExpenseItem, Member, PackingItem, Trip } from '../types'

/** T42：新旅程可選帶入的常用花費項目（品項名，金額留空、一律台幣）。 */
const DEFAULT_EXPENSE_ITEMS = [
  '機票（去程）',
  '機票（回程）',
  '飯店',
  '交通（機場接駁）',
  '換匯',
  '保險',
] as const

export default function TripList() {
  const navigate = useNavigate()
  const trips = useLiveQuery(() => db.trips.orderBy('updatedAt').reverse().toArray())

  // 新增旅程對話框狀態
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [copyFromId, setCopyFromId] = useState('') // '' = 全新空白
  const [seedExpenses, setSeedExpenses] = useState(true)

  function openAdd() {
    setName('')
    setStartDate('')
    setEndDate('')
    setCopyFromId('')
    setSeedExpenses(true)
    setAdding(true)
  }

  // 切換來源只記住選擇，名稱一律由使用者在對話框自行輸入（不論全新空白或複製皆同）。
  function onSourceChange(id: string) {
    setCopyFromId(id)
  }

  const dateInvalid = !!startDate && !!endDate && endDate < startDate
  const canCreate = !!name.trim() && !!startDate && !!endDate && !dateInvalid

  /**
   * 建立新旅程。名稱／日期由使用者輸入（T41 必填）；來源為某 Trip 時複製其
   * 「基本設定＋同行者＋行李」（不含逐日行程與花費）；withExpenses 為 true 時
   * 另外帶入 T42 常用花費項目（一律台幣、金額留空）。
   */
  async function createTrip() {
    if (!canCreate) return
    const source = copyFromId ? (trips?.find((t) => t.id === copyFromId) ?? null) : null
    const ts = now()
    const trip: Trip = {
      id: newId(),
      name: name.trim(),
      country: source?.country ?? '',
      city: source?.city ?? '',
      originCountry: source?.originCountry ?? '台灣',
      region: source?.region ?? '',
      startDate,
      endDate,
      currencyCode: source?.currencyCode ?? 'JPY',
      currencyLabel: source?.currencyLabel ?? '日元',
      exchangeRate: source?.exchangeRate ?? 0.21,
      peopleCount: source?.peopleCount ?? 2,
      createdAt: ts,
      updatedAt: ts,
    }
    setAdding(false)
    await db.transaction('rw', db.trips, db.members, db.packing, db.expenses, async () => {
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
      if (seedExpenses) {
        const seeded: ExpenseItem[] = DEFAULT_EXPENSE_ITEMS.map((item, i) => ({
          id: newId(),
          tripId: trip.id,
          date: '',
          time: '',
          item,
          currency: 'TWD',
          amount: 0,
          fee: 0,
          paid: false,
          paidBy: '',
          payerId: '',
          participantIds: [],
          paymentStatus: '',
          notes: '',
          sort: i + 1,
        }))
        await db.expenses.bulkAdd(seeded)
      }
    })
    navigate(`/trip/${trip.id}`)
  }

  async function removeTrip(id: string, tripName: string) {
    if (!confirm(`確定刪除旅程「${tripName || '未命名'}」？相關花費、行程、購物、人員、行李也會一併刪除。`))
      return
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

  const inputCls = 'w-full rounded border px-2 py-1.5 text-sm'

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

      {/* 新增旅程對話框：名稱/日期必填（T41）＋來源選擇＋常用花費勾選（T42） */}
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

            <div className="mt-3 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">
                  旅程名稱 <span className="text-red-500">*</span>
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="例：2026 關西自由行"
                  autoFocus
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block text-gray-600">
                    出發日期 <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-gray-600">
                    回程日期 <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputCls}
                  />
                </label>
              </div>
              <p className={`text-xs ${dateInvalid ? 'text-red-500' : 'text-gray-400'}`}>
                回程需晚於或等於出發。
              </p>

              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">來源</span>
                <select
                  value={copyFromId}
                  onChange={(e) => onSourceChange(e.target.value)}
                  className={inputCls}
                >
                  <option value="">全新空白旅程</option>
                  {trips?.map((t) => (
                    <option key={t.id} value={t.id}>
                      複製：{t.name || '(未命名旅程)'}
                      {t.startDate ? `（${t.startDate}）` : ''}
                    </option>
                  ))}
                </select>
                {copyFromId && (
                  <span className="mt-1 block text-xs text-gray-500">
                    將複製基本設定（國家／都市／幣別／匯率）、同行者、行李清單（勾選歸零）；不含行程與花費。
                  </span>
                )}
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={seedExpenses}
                  onChange={(e) => setSeedExpenses(e.target.checked)}
                  className="h-4 w-4 accent-sky-600"
                />
                <span>帶入常用花費項目（機票×2／飯店／接駁／換匯／保險）</span>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setAdding(false)}
                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={createTrip}
                disabled={!canCreate}
                className="rounded bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-40"
              >
                建立旅程
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
