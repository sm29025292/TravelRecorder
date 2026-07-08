import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { newId } from '../lib/id'
import { ATTRACTION_TYPES, type Attraction, type ItineraryItem, type Trip } from '../types'
import { TextInput, IconButton, Th, Td, Select } from '../components/cells'
import {
  buildLocationTree,
  getLocationOptions,
  SEP,
  type CityNode,
  type CountryNode,
  type DistrictNode,
} from '../lib/group'
import { importAttractionsFromCSV } from '../lib/importAttractions'
import { applyMerge, findDuplicateGroups } from '../lib/dedupeAttractions'
import { findOrphanItinerary } from '../lib/orphanItinerary'
import { visitedAttractionIds } from '../lib/visited'

const inputCls =
  'rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

type EditKind = 'country' | 'city' | 'district' | 'row'

interface EditTarget {
  kind: EditKind
  ids: string[]
  country: string
  city: string
  district: string
  /** 目前位置的顯示標籤（供確認訊息使用） */
  label: string
}

function PriorityStars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const current = Math.min(3, Math.max(0, value | 0))
  return (
    <div className="flex items-center justify-end gap-0.5">
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          type="button"
          title={`優先度 ${n}${current === n ? '（再點清除）' : ''}`}
          onClick={() => onChange(current === n ? 0 : n)}
          className="rounded px-0.5 text-lg leading-none text-amber-500 hover:text-amber-600"
        >
          {n <= current ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

/** 「非空欄位數」計分，平手取 priority 較大者、再取原順序：作為預設保留者。 */
function pickDefaultSurvivorId(group: Attraction[]): string {
  const score = (a: Attraction) => {
    let s = 0
    if (a.country) s++
    if (a.city) s++
    if (a.district) s++
    if (a.address) s++
    if (a.url) s++
    if (a.notes) s++
    if (a.type) s++
    if (a.priority > 0) s++
    return s
  }
  let best = group[0]
  let bestScore = score(best)
  for (let i = 1; i < group.length; i++) {
    const g = group[i]
    const s = score(g)
    if (s > bestScore || (s === bestScore && g.priority > best.priority)) {
      best = g
      bestScore = s
    }
  }
  return best.id
}

/** 群組唯一 key：組內 id 排序後 join。 */
function dedupeGroupKey(group: Attraction[]): string {
  return group
    .map((a) => a.id)
    .slice()
    .sort()
    .join('|')
}

function allIdsUnderCountry(c: CountryNode): string[] {
  const ids: string[] = []
  for (const cn of c.cities) {
    for (const a of cn.direct) ids.push(a.id)
    for (const dn of cn.districts) for (const a of dn.list) ids.push(a.id)
  }
  return ids
}
function allIdsUnderCity(cn: CityNode): string[] {
  const ids = cn.direct.map((a) => a.id)
  for (const dn of cn.districts) for (const a of dn.list) ids.push(a.id)
  return ids
}

export default function Attractions() {
  const attractions = useLiveQuery(() => db.attractions.toArray(), [], [])
  const trips = useLiveQuery(() => db.trips.toArray(), [], [])
  const itinerary = useLiveQuery(() => db.itinerary.toArray(), [], [])
  const [newCountry, setNewCountry] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newDistrict, setNewDistrict] = useState('')
  const [newType, setNewType] = useState<Attraction['type']>('')
  const [msg, setMsg] = useState('')

  // 篩選狀態
  const [fCountry, setFCountry] = useState('')
  const [fCity, setFCity] = useState('')
  const [fDistrict, setFDistrict] = useState('')
  const [fType, setFType] = useState<Attraction['type']>('')
  const [fName, setFName] = useState('')

  // 樹狀摺疊狀態
  const [collapsedCountries, setCollapsedCountries] = useState<Set<string>>(new Set())
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<EditTarget | null>(null)

  // 整理重複景點面板
  const [dedupeOpen, setDedupeOpen] = useState(false)
  const [skippedGroups, setSkippedGroups] = useState<Set<string>>(new Set())
  const [survivorPick, setSurvivorPick] = useState<Record<string, string>>({})

  // 孤兒參照健檢面板
  const [healthOpen, setHealthOpen] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  async function handleCSV(file: File) {
    try {
      const { added, duplicates, skipped } = await importAttractionsFromCSV(await file.text())
      setMsg(`匯入完成：新增 ${added} 筆，略過 ${duplicates + skipped} 筆（重複或非景點）`)
      setTimeout(() => setMsg(''), 6000)
    } catch (e) {
      setMsg('匯入失敗：' + (e as Error).message)
    }
  }

  async function addRow() {
    const a: Attraction = {
      id: newId(),
      country: newCountry.trim(),
      city: newCity.trim(),
      district: newDistrict.trim(),
      name: '',
      address: '',
      url: '',
      notes: '',
      priority: 0,
      type: newType,
    }
    await db.attractions.add(a)
  }

  const update = (id: string, patch: Partial<Attraction>) => db.attractions.update(id, patch)
  const remove = async (id: string) => {
    const used = await db.itinerary.filter((r) => r.attractionId === id).count()
    const ok =
      used > 0
        ? window.confirm(`此景點被 ${used} 筆行程使用，刪除後那些行程列將顯示空白。仍要刪除？`)
        : window.confirm('確定刪除此景點？')
    if (!ok) return
    await db.attractions.delete(id)
  }

  const allAttractions = attractions ?? []
  const opts = getLocationOptions(allAttractions)
  const visitedIds = useMemo(
    () => visitedAttractionIds(itinerary ?? []),
    [itinerary],
  )

  // 篩選後建樹
  const fNameQ = fName.trim().toLowerCase()
  const filtered = allAttractions.filter(
    (a) =>
      (!fCountry || (a.country ?? '').toLowerCase().includes(fCountry.toLowerCase())) &&
      (!fCity || (a.city ?? '').toLowerCase().includes(fCity.toLowerCase())) &&
      (!fDistrict || (a.district ?? '').toLowerCase().includes(fDistrict.toLowerCase())) &&
      (!fType || a.type === fType) &&
      (!fNameQ ||
        a.name.toLowerCase().includes(fNameQ) ||
        a.address.toLowerCase().includes(fNameQ) ||
        a.notes.toLowerCase().includes(fNameQ)),
  )
  const tree = useMemo(() => buildLocationTree(filtered), [filtered])

  // 動態 datalist 選項（cascade）
  const cityOptions = fCountry
    ? (opts.citiesByCountry.get(fCountry) ?? [])
    : [...new Set(allAttractions.map((a) => a.city).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'zh-Hant'),
      )

  const districtOptions =
    fCountry || fCity
      ? (opts.districtsByCityKey.get(`${fCountry}${SEP}${fCity}`) ?? [])
      : [...new Set(allAttractions.map((a) => a.district).filter(Boolean))].sort((a, b) =>
          a.localeCompare(b, 'zh-Hant'),
        )

  const isCountryExpanded = (country: string) => !collapsedCountries.has(country)
  const cityKey = (country: string, city: string) => `${country}${SEP}${city}`
  const isCityExpanded = (country: string, city: string) =>
    expandedCities.has(cityKey(country, city))

  const toggleCountry = (country: string) => {
    setCollapsedCountries((prev) => {
      const next = new Set(prev)
      if (next.has(country)) next.delete(country)
      else next.add(country)
      return next
    })
  }
  const toggleCity = (country: string, city: string) => {
    setExpandedCities((prev) => {
      const next = new Set(prev)
      const k = cityKey(country, city)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  async function applyEdit() {
    if (!editing) return
    const country = editing.country.trim()
    const city = editing.city.trim()
    const district = editing.district.trim()
    const patch: Partial<Attraction> = {}
    if (editing.kind === 'country') patch.country = country
    else if (editing.kind === 'city') {
      patch.country = country
      patch.city = city
    } else {
      // 'district' 與 'row' 都會設完整三層
      patch.country = country
      patch.city = city
      patch.district = district
    }
    if (editing.kind !== 'row') {
      const ok = window.confirm(
        `將把 ${editing.ids.length} 筆景點的位置更新為：` +
          `${[patch.country, patch.city, patch.district].filter((v) => v !== undefined && v !== '').join(' · ') || '（未分類）'}` +
          `\n\n原位置：${editing.label}\n\n確定套用？`,
      )
      if (!ok) return
    }
    await db.attractions.where('id').anyOf(editing.ids).modify(patch)
    setEditing(null)
  }

  function openEditCountry(node: CountryNode) {
    const label = node.country || '未分類'
    setEditing({
      kind: 'country',
      ids: allIdsUnderCountry(node),
      country: node.country,
      city: '',
      district: '',
      label,
    })
  }
  function openEditCity(country: string, node: CityNode) {
    const label = `${country || '未分類'} · ${node.city || '（未分類都市）'}`
    setEditing({
      kind: 'city',
      ids: allIdsUnderCity(node),
      country,
      city: node.city,
      district: '',
      label,
    })
  }
  function openEditDistrict(country: string, city: string, node: DistrictNode) {
    const label = `${country || '未分類'} · ${city || '（未分類都市）'} · ${node.district}`
    setEditing({
      kind: 'district',
      ids: node.list.map((a) => a.id),
      country,
      city,
      district: node.district,
      label,
    })
  }
  function openMoveRow(a: Attraction) {
    const label = [a.country, a.city, a.district].filter(Boolean).join(' · ') || '（未分類）'
    setEditing({
      kind: 'row',
      ids: [a.id],
      country: a.country ?? '',
      city: a.city ?? '',
      district: a.district ?? '',
      label,
    })
  }

  // 表格：不含國家/都市/區域欄
  function renderRows(list: Attraction[]) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <Th>景點</Th>
              <Th>詳細地址</Th>
              <Th>網址</Th>
              <Th>備註</Th>
              <Th className="text-right">優先度</Th>
              <Th>類型</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-t">
                <Td className="min-w-[8rem]">
                  <div className="flex items-center gap-1">
                    <TextInput value={a.name} onChange={(v) => update(a.id, { name: v })} />
                    {visitedIds.has(a.id) && (
                      <span
                        title="已排入行程（去過）"
                        className="shrink-0 text-sm font-bold text-emerald-600"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                </Td>
                <Td className="min-w-[10rem]">
                  <TextInput value={a.address} onChange={(v) => update(a.id, { address: v })} />
                </Td>
                <Td className="min-w-[10rem]">
                  <div className="flex items-center gap-1">
                    <TextInput
                      value={a.url}
                      placeholder="https://"
                      onChange={(v) => update(a.id, { url: v })}
                    />
                    {a.url.trim() && (
                      <button
                        type="button"
                        title="開啟網址"
                        onClick={() => window.open(a.url, '_blank', 'noopener')}
                        className="shrink-0 rounded px-1.5 py-1 text-xs text-gray-500 hover:bg-sky-50 hover:text-sky-700"
                      >
                        ↗
                      </button>
                    )}
                  </div>
                </Td>
                <Td className="min-w-[8rem]">
                  <TextInput value={a.notes} onChange={(v) => update(a.id, { notes: v })} />
                </Td>
                <Td className="w-24">
                  <PriorityStars
                    value={a.priority}
                    onChange={(n) => update(a.id, { priority: n })}
                  />
                </Td>
                <Td className="w-24">
                  <Select
                    value={a.type ?? ''}
                    onChange={(v) => update(a.id, { type: v as Attraction['type'] })}
                  >
                    <option value="">未設</option>
                    {ATTRACTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td className="whitespace-nowrap">
                  <button
                    type="button"
                    title="搬移到其他國家／都市／區域"
                    onClick={() => openMoveRow(a)}
                    className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-sky-50 hover:text-sky-700"
                  >
                    搬移
                  </button>
                  <IconButton title="刪除這個景點" onClick={() => remove(a.id)}>
                    ✕
                  </IconButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 頁頭 + 新增工具列 */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-xl font-bold">景點庫</h1>
          <p className="text-sm text-gray-500">
            依國家／都市／區域三層樹狀分組，可摺疊；節點編輯可批次搬移子樹。
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">國家</span>
            <TextInput value={newCountry} placeholder="例：日本" onChange={setNewCountry} className="w-24" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">都市</span>
            <TextInput value={newCity} placeholder="例：大阪" onChange={setNewCity} className="w-24" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">區域</span>
            <TextInput value={newDistrict} placeholder="例：心齋橋" onChange={setNewDistrict} className="w-24" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">類型</span>
            <Select
              value={newType}
              onChange={(v) => setNewType(v as Attraction['type'])}
              className="w-24"
            >
              <option value="">未設</option>
              {ATTRACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </label>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            匯入 CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleCSV(f)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => setDedupeOpen(true)}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
            title="掃描名稱正規化後相同的景點，讓你挑一筆保留、其餘欄位擇優併入"
          >
            整理重複
          </button>
          <button
            onClick={() => setHealthOpen(true)}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
            title="掃描行程中指向已不存在景點的孤兒列，可清除參照或前往該旅程處理"
          >
            健檢
          </button>
          <button
            onClick={addRow}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            + 新增景點
          </button>
        </div>
      </div>

      {msg && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</p>}

      {/* 篩選列 */}
      <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-gray-50 px-3 py-2">
        <span className="text-xs font-medium text-gray-500 self-center">篩選：</span>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-500">國家</label>
          <input
            list="fl-countries"
            value={fCountry}
            placeholder="全部"
            className={`${inputCls} w-28`}
            onChange={(e) => {
              setFCountry(e.target.value)
              setFCity('')
              setFDistrict('')
            }}
          />
          <datalist id="fl-countries">
            {opts.countries.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-500">都市</label>
          <input
            list="fl-cities"
            value={fCity}
            placeholder="全部"
            className={`${inputCls} w-28`}
            onChange={(e) => {
              setFCity(e.target.value)
              setFDistrict('')
            }}
          />
          <datalist id="fl-cities">
            {cityOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-500">區域</label>
          <input
            list="fl-districts"
            value={fDistrict}
            placeholder="全部"
            className={`${inputCls} w-28`}
            onChange={(e) => setFDistrict(e.target.value)}
          />
          <datalist id="fl-districts">
            {districtOptions.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-500">類型</label>
          <Select
            value={fType}
            onChange={(v) => setFType(v as Attraction['type'])}
            className="w-24"
          >
            <option value="">全部</option>
            {ATTRACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-500">名稱</label>
          <input
            value={fName}
            placeholder="搜尋名稱／地址／備註"
            className={`${inputCls} w-44`}
            onChange={(e) => setFName(e.target.value)}
          />
        </div>
        {(fCountry || fCity || fDistrict || fType || fName) && (
          <button
            className="self-end rounded border px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            onClick={() => {
              setFCountry('')
              setFCity('')
              setFDistrict('')
              setFType('')
              setFName('')
            }}
          >
            清除篩選
          </button>
        )}
        <span className="ml-auto self-end text-xs text-gray-400">
          顯示 {filtered.length} / {allAttractions.length} 筆
        </span>
      </div>

      {allAttractions.length === 0 && (
        <p className="rounded border border-dashed p-8 text-center text-gray-500">
          尚無景點。在右上輸入國家／都市／區域後按「新增景點」。
        </p>
      )}

      {filtered.length === 0 && allAttractions.length > 0 && (
        <p className="rounded border border-dashed p-4 text-center text-gray-400 text-sm">
          目前篩選條件無符合景點。
        </p>
      )}

      {tree.map((countryNode) => {
        const expanded = isCountryExpanded(countryNode.country)
        return (
          <div
            key={countryNode.country || '__empty__'}
            className="overflow-hidden rounded-lg border bg-white"
          >
            {/* 國家節點標頭 */}
            <div className="flex items-center gap-2 border-b bg-gray-50 px-3 py-2">
              <button
                type="button"
                onClick={() => toggleCountry(countryNode.country)}
                className="w-5 text-gray-500 hover:text-gray-800"
                title={expanded ? '摺疊' : '展開'}
              >
                {expanded ? '▼' : '▶'}
              </button>
              <span className="font-semibold">{countryNode.country || '未分類'}</span>
              <span className="text-xs text-gray-500">（{countryNode.count}）</span>
              <button
                type="button"
                onClick={() => openEditCountry(countryNode)}
                className="ml-auto rounded border px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                title={countryNode.country ? '改國家名（會套用到整組）' : '批次補國家'}
              >
                {countryNode.country ? '編輯國家' : '批次補國家'}
              </button>
            </div>

            {expanded && (
              <div className="divide-y">
                {countryNode.cities.map((cityNode) => {
                  const cityOpen = isCityExpanded(countryNode.country, cityNode.city)
                  return (
                    <div key={cityNode.city || '__empty__'}>
                      {/* 都市節點標頭 */}
                      <div className="flex items-center gap-2 bg-gray-100/60 px-3 py-1.5">
                        <button
                          type="button"
                          onClick={() => toggleCity(countryNode.country, cityNode.city)}
                          className="w-5 text-gray-500 hover:text-gray-800"
                          title={cityOpen ? '摺疊' : '展開'}
                        >
                          {cityOpen ? '▾' : '▸'}
                        </button>
                        <span className="text-sm text-gray-800">
                          {cityNode.city || '（未分類都市）'}
                        </span>
                        <span className="text-xs text-gray-500">（{cityNode.count}）</span>
                        <button
                          type="button"
                          onClick={() => openEditCity(countryNode.country, cityNode)}
                          className="ml-auto rounded border px-2 py-0.5 text-xs text-gray-600 hover:bg-white"
                        >
                          編輯都市
                        </button>
                      </div>

                      {cityOpen && (
                        <div className="bg-white">
                          {cityNode.direct.length > 0 && renderRows(cityNode.direct)}
                          {cityNode.districts.map((dn) => (
                            <div key={dn.district}>
                              <div className="flex items-center gap-2 border-t bg-white px-4 py-1">
                                <span className="text-xs text-gray-600">▸ {dn.district}</span>
                                <span className="text-xs text-gray-400">
                                  （{dn.list.length}）
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditDistrict(countryNode.country, cityNode.city, dn)
                                  }
                                  className="ml-auto rounded border px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-50"
                                >
                                  編輯區域
                                </button>
                              </div>
                              {renderRows(dn.list)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* 整理重複景點 modal */}
      {dedupeOpen && (
        <DedupePanel
          all={allAttractions}
          skippedGroups={skippedGroups}
          setSkippedGroups={setSkippedGroups}
          survivorPick={survivorPick}
          setSurvivorPick={setSurvivorPick}
          onClose={() => setDedupeOpen(false)}
          setMsg={setMsg}
        />
      )}

      {/* 孤兒參照健檢 modal */}
      {healthOpen && (
        <HealthPanel
          itinerary={itinerary ?? []}
          attractions={allAttractions}
          trips={trips ?? []}
          onClose={() => setHealthOpen(false)}
          setMsg={setMsg}
        />
      )}

      {/* 節點編輯／單列搬移 modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">
              {editing.kind === 'row'
                ? '搬移景點'
                : editing.kind === 'country'
                  ? '編輯國家'
                  : editing.kind === 'city'
                    ? '編輯都市'
                    : '編輯區域'}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {editing.kind === 'row'
                ? `目前位置：${editing.label}`
                : `原位置：${editing.label}（${editing.ids.length} 筆將被更新）`}
            </p>

            <div className="mt-3 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">國家</span>
                <input
                  list="edit-lst-countries"
                  value={editing.country}
                  onChange={(e) =>
                    setEditing({ ...editing, country: e.target.value })
                  }
                  className={`${inputCls} w-full`}
                  placeholder="例：日本（可留空表示未分類）"
                />
                <datalist id="edit-lst-countries">
                  {opts.countries.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>

              {(editing.kind === 'city' ||
                editing.kind === 'district' ||
                editing.kind === 'row') && (
                <label className="block text-sm">
                  <span className="mb-1 block text-gray-600">都市</span>
                  <input
                    list="edit-lst-cities"
                    value={editing.city}
                    onChange={(e) =>
                      setEditing({ ...editing, city: e.target.value })
                    }
                    className={`${inputCls} w-full`}
                    placeholder="例：大阪"
                  />
                  <datalist id="edit-lst-cities">
                    {(opts.citiesByCountry.get(editing.country) ?? []).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </label>
              )}

              {(editing.kind === 'district' || editing.kind === 'row') && (
                <label className="block text-sm">
                  <span className="mb-1 block text-gray-600">區域</span>
                  <input
                    list="edit-lst-districts"
                    value={editing.district}
                    onChange={(e) =>
                      setEditing({ ...editing, district: e.target.value })
                    }
                    className={`${inputCls} w-full`}
                    placeholder="例：心齋橋（可留空）"
                  />
                  <datalist id="edit-lst-districts">
                    {(
                      opts.districtsByCityKey.get(
                        `${editing.country}${SEP}${editing.city}`,
                      ) ?? []
                    ).map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </label>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={applyEdit}
                className="rounded bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DedupePanel({
  all,
  skippedGroups,
  setSkippedGroups,
  survivorPick,
  setSurvivorPick,
  onClose,
  setMsg,
}: {
  all: Attraction[]
  skippedGroups: Set<string>
  setSkippedGroups: Dispatch<SetStateAction<Set<string>>>
  survivorPick: Record<string, string>
  setSurvivorPick: Dispatch<SetStateAction<Record<string, string>>>
  onClose: () => void
  setMsg: (s: string) => void
}) {
  const groups = useMemo(() => findDuplicateGroups(all), [all])
  const visibleGroups = groups.filter((g) => !skippedGroups.has(dedupeGroupKey(g)))

  async function handleMerge(group: Attraction[]) {
    const key = dedupeGroupKey(group)
    const survivorId = survivorPick[key] ?? pickDefaultSurvivorId(group)
    const loserIds = group.filter((a) => a.id !== survivorId).map((a) => a.id)
    if (loserIds.length === 0) return
    const ok = window.confirm(
      `合併後其他景點將被刪除，行程參照會改指向留下的景點。\n\n共合併 ${loserIds.length + 1} 筆為 1 筆。確定？`,
    )
    if (!ok) return
    try {
      await applyMerge(survivorId, loserIds)
      setMsg(`已合併「${group[0].name}」共 ${loserIds.length + 1} 筆為 1 筆`)
      setTimeout(() => setMsg(''), 6000)
    } catch (e) {
      setMsg('合併失敗：' + (e as Error).message)
    }
  }

  function skipGroup(group: Attraction[]) {
    setSkippedGroups((prev) => {
      const next = new Set(prev)
      next.add(dedupeGroupKey(group))
      return next
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">整理重複景點</h2>
          <span className="text-xs text-gray-500">
            以名稱正規化（去空白／大小寫）為 key 掃描
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded border px-2 py-1 text-xs hover:bg-gray-50"
          >
            關閉
          </button>
        </div>

        {visibleGroups.length === 0 ? (
          <p className="mt-4 rounded border border-dashed p-6 text-center text-sm text-gray-500">
            {groups.length === 0
              ? '沒有重複景點。'
              : '目前所有重複群組已略過；關閉後重開可再看到。'}
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            {visibleGroups.map((group) => {
              const key = dedupeGroupKey(group)
              const defaultId = pickDefaultSurvivorId(group)
              const selectedId = survivorPick[key] ?? defaultId
              return (
                <div key={key} className="rounded-lg border">
                  <div className="border-b bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                    共 {group.length} 筆・保留一筆合併其餘
                  </div>
                  <div className="divide-y">
                    {group.map((a) => {
                      const stars = '★'.repeat(Math.min(3, Math.max(0, a.priority | 0)))
                      const loc =
                        [a.country, a.city, a.district].filter(Boolean).join(' · ') || '（未分類）'
                      return (
                        <label
                          key={a.id}
                          className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-sky-50/40"
                        >
                          <input
                            type="radio"
                            name={`dedupe-${key}`}
                            className="mt-1"
                            checked={selectedId === a.id}
                            onChange={() =>
                              setSurvivorPick((prev) => ({ ...prev, [key]: a.id }))
                            }
                          />
                          <div className="min-w-0 flex-1 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-amber-500">{stars || '☆'}</span>
                              <span className="font-medium">{a.name || '(未命名)'}</span>
                              <span className="text-xs text-gray-500">{loc}</span>
                              {a.type && (
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                                  {ATTRACTION_TYPES.find((t) => t.value === a.type)?.label ?? '景點'}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-0.5 text-xs text-gray-500 sm:grid-cols-3">
                              <div>
                                <span className="text-gray-400">地址：</span>
                                {a.address || <span className="text-gray-300">—</span>}
                              </div>
                              <div className="truncate">
                                <span className="text-gray-400">網址：</span>
                                {a.url || <span className="text-gray-300">—</span>}
                              </div>
                              <div className="truncate">
                                <span className="text-gray-400">備註：</span>
                                {a.notes || <span className="text-gray-300">—</span>}
                              </div>
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                  <div className="flex justify-end gap-2 border-t bg-gray-50 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => skipGroup(group)}
                      className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      略過
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMerge(group)}
                      className="rounded bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-700"
                    >
                      合併
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function HealthPanel({
  itinerary,
  attractions,
  trips,
  onClose,
  setMsg,
}: {
  itinerary: ItineraryItem[]
  attractions: Attraction[]
  trips: Trip[]
  onClose: () => void
  setMsg: (s: string) => void
}) {
  const navigate = useNavigate()
  const orphans = useMemo(
    () => findOrphanItinerary(itinerary, attractions),
    [itinerary, attractions],
  )
  const tripById = useMemo(() => {
    const m = new Map<string, Trip>()
    for (const t of trips) m.set(t.id, t)
    return m
  }, [trips])

  // 依 tripId 分組（保留輸入順序）
  const grouped = useMemo(() => {
    const m = new Map<string, ItineraryItem[]>()
    for (const r of orphans) {
      const list = m.get(r.tripId)
      if (list) list.push(r)
      else m.set(r.tripId, [r])
    }
    return [...m.entries()]
  }, [orphans])

  async function clearRef(row: ItineraryItem) {
    const ok = window.confirm('清除此列的景點參照？該行程列會回到「未指定景點」。')
    if (!ok) return
    try {
      await db.itinerary.update(row.id, { attractionId: '' })
      setMsg('已清除 1 筆孤兒參照')
      setTimeout(() => setMsg(''), 6000)
    } catch (e) {
      setMsg('清除失敗：' + (e as Error).message)
    }
  }

  function goTrip(tripId: string) {
    navigate(`/trip/${tripId}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">孤兒參照健檢</h2>
          <span className="text-xs text-gray-500">
            掃描 attractionId 非空、卻在景點庫找不到對應景點的行程列
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded border px-2 py-1 text-xs hover:bg-gray-50"
          >
            關閉
          </button>
        </div>

        {orphans.length === 0 ? (
          <p className="mt-4 rounded border border-dashed p-6 text-center text-sm text-gray-500">
            無孤兒行程列，資料一致。
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            {grouped.map(([tripId, rows]) => {
              const trip = tripById.get(tripId)
              const hasTrip = !!trip
              return (
                <div key={tripId || '(no-trip)'} className="rounded-lg border">
                  <div className="flex items-center gap-2 border-b bg-gray-50 px-3 py-1.5 text-xs">
                    <span className="font-medium text-gray-700">
                      {hasTrip ? trip!.name || '(未命名旅程)' : '找不到旅程'}
                    </span>
                    <span className="text-gray-500">
                      {hasTrip ? `共 ${rows.length} 筆` : `${tripId} · ${rows.length} 筆`}
                    </span>
                    <button
                      type="button"
                      onClick={() => goTrip(tripId)}
                      disabled={!hasTrip}
                      className="ml-auto rounded border px-2 py-0.5 text-xs enabled:hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                      title={hasTrip ? '前往該旅程' : '旅程不存在，無法前往'}
                    >
                      前往旅程 ↗
                    </button>
                  </div>
                  <div className="divide-y">
                    {rows.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm"
                      >
                        <span className="text-gray-500">{r.date || '未排日期'}</span>
                        {r.time && <span className="text-gray-500">{r.time}</span>}
                        <span className="min-w-0 flex-1">
                          {r.activity || <span className="text-gray-300">(未填活動)</span>}
                        </span>
                        <span
                          className="text-xs text-gray-400"
                          title={`原參照 attractionId：${r.attractionId}`}
                        >
                          #{r.attractionId.slice(0, 8)}
                        </span>
                        <button
                          type="button"
                          onClick={() => clearRef(r)}
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                        >
                          清除參照
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
