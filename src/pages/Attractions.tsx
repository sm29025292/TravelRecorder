import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { newId } from '../lib/id'
import type { Attraction } from '../types'
import { TextInput, NumberInput, IconButton, Th, Td, Select } from '../components/cells'
import {
  buildLocationTree,
  getLocationOptions,
  SEP,
  type CityNode,
  type CountryNode,
  type DistrictNode,
} from '../lib/group'
import { importAttractionsFromCSV } from '../lib/importAttractions'

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
  const [newCountry, setNewCountry] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newDistrict, setNewDistrict] = useState('')
  const [newType, setNewType] = useState<'' | 'attraction' | 'food'>('')
  const [msg, setMsg] = useState('')

  // 篩選狀態
  const [fCountry, setFCountry] = useState('')
  const [fCity, setFCity] = useState('')
  const [fDistrict, setFDistrict] = useState('')
  const [fType, setFType] = useState<'' | 'attraction' | 'food'>('')

  // 樹狀摺疊狀態
  const [collapsedCountries, setCollapsedCountries] = useState<Set<string>>(new Set())
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<EditTarget | null>(null)

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

  // 篩選後建樹
  const filtered = allAttractions.filter(
    (a) =>
      (!fCountry || (a.country ?? '').toLowerCase().includes(fCountry.toLowerCase())) &&
      (!fCity || (a.city ?? '').toLowerCase().includes(fCity.toLowerCase())) &&
      (!fDistrict || (a.district ?? '').toLowerCase().includes(fDistrict.toLowerCase())) &&
      (!fType || a.type === fType),
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
                  <TextInput value={a.name} onChange={(v) => update(a.id, { name: v })} />
                </Td>
                <Td className="min-w-[10rem]">
                  <TextInput value={a.address} onChange={(v) => update(a.id, { address: v })} />
                </Td>
                <Td className="min-w-[10rem]">
                  <TextInput
                    value={a.url}
                    placeholder="https://"
                    onChange={(v) => update(a.id, { url: v })}
                  />
                </Td>
                <Td className="min-w-[8rem]">
                  <TextInput value={a.notes} onChange={(v) => update(a.id, { notes: v })} />
                </Td>
                <Td className="w-20">
                  <NumberInput value={a.priority} onChange={(n) => update(a.id, { priority: n })} />
                </Td>
                <Td className="w-24">
                  <Select
                    value={a.type ?? ''}
                    onChange={(v) => update(a.id, { type: v as '' | 'attraction' | 'food' })}
                  >
                    <option value="">未設</option>
                    <option value="attraction">景點</option>
                    <option value="food">美食</option>
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
              onChange={(v) => setNewType(v as '' | 'attraction' | 'food')}
              className="w-24"
            >
              <option value="">未設</option>
              <option value="attraction">景點</option>
              <option value="food">美食</option>
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
            onChange={(v) => setFType(v as '' | 'attraction' | 'food')}
            className="w-24"
          >
            <option value="">全部</option>
            <option value="attraction">景點</option>
            <option value="food">美食</option>
          </Select>
        </div>
        {(fCountry || fCity || fDistrict || fType) && (
          <button
            className="self-end rounded border px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            onClick={() => { setFCountry(''); setFCity(''); setFDistrict(''); setFType('') }}
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
