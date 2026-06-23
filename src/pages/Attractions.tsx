import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { newId } from '../lib/id'
import type { Attraction } from '../types'
import { TextInput, NumberInput, IconButton, Th, Td, Select } from '../components/cells'
import { groupByLocation, getLocationOptions, SEP } from '../lib/group'
import { importAttractionsFromCSV } from '../lib/importAttractions'

const inputCls =
  'rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

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
  const remove = (id: string) => db.attractions.delete(id)

  const allAttractions = attractions ?? []
  const opts = getLocationOptions(allAttractions)

  // 篩選後分組
  const filtered = allAttractions.filter(
    (a) =>
      (!fCountry || a.country.toLowerCase().includes(fCountry.toLowerCase())) &&
      (!fCity || a.city.toLowerCase().includes(fCity.toLowerCase())) &&
      (!fDistrict || a.district.toLowerCase().includes(fDistrict.toLowerCase())) &&
      (!fType || a.type === fType),
  )
  const groups = groupByLocation(filtered)

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

  return (
    <div className="space-y-4">
      {/* 頁頭 + 新增工具列 */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-xl font-bold">景點庫</h1>
          <p className="text-sm text-gray-500">依國家／都市／區域三層分組，可重複用於各旅程行程下拉。</p>
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

      {groups.map((g) => (
        <div key={g.label} className="overflow-x-auto rounded-lg border bg-white">
          <div className="border-b bg-gray-50 px-3 py-2 text-sm font-semibold">
            {g.label}（{g.list.length}）
          </div>
          <table className="w-full min-w-[60rem] text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <Th>景點</Th>
                <Th>詳細地址</Th>
                <Th>網址</Th>
                <Th>備註</Th>
                <Th className="text-right">優先度</Th>
                <Th>國家</Th>
                <Th>都市</Th>
                <Th>區域</Th>
                <Th>類型</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {g.list.map((a) => (
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
                    <TextInput value={a.country} onChange={(v) => update(a.id, { country: v })} />
                  </Td>
                  <Td className="w-24">
                    <TextInput value={a.city ?? ''} onChange={(v) => update(a.id, { city: v })} />
                  </Td>
                  <Td className="w-24">
                    <TextInput value={a.district ?? ''} onChange={(v) => update(a.id, { district: v })} />
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
                  <Td>
                    <IconButton title="刪除這個景點" onClick={() => remove(a.id)}>
                      ✕
                    </IconButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
