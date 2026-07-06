import type { ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Trip } from '../../types'
import { db } from '../../db/db'
import { now } from '../../lib/id'
import { TextInput, DateInput, NumberInput } from '../cells'
import { getLocationOptions, SEP } from '../../lib/group'
import { COUNTRY_CURRENCY, pickExchangeRate } from '../../lib/currency'

export default function OverviewTab({ trip }: { trip: Trip }) {
  const attractions = useLiveQuery(() => db.attractions.toArray(), [], [])
  const allTrips = useLiveQuery(() => db.trips.toArray(), [], [])
  const opts = getLocationOptions(attractions)

  const update = (patch: Partial<Trip>) => db.trips.update(trip.id, { ...patch, updatedAt: now() })

  const country = trip.country ?? ''
  const city = trip.city ?? ''

  // 選了國家後、都市選項連動；沒選國家則列出全庫都市。
  const cityOptions = country
    ? (opts.citiesByCountry.get(country) ?? [])
    : [...new Set(attractions.map((a) => a.city).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'zh-Hant'),
      )

  function onCountryChange(next: string) {
    const patch: Partial<Trip> = { country: next }
    // 換國家時清空都市（避免不合的組合），除非國家一樣則保留。
    if (next !== country) patch.city = ''
    const cc = COUNTRY_CURRENCY[next]
    if (cc) {
      patch.currencyCode = cc.code
      patch.currencyLabel = cc.label
      if (cc.code === 'TWD') {
        patch.exchangeRate = 1
      } else {
        const rate = pickExchangeRate(allTrips, cc.code, trip.id)
        if (rate !== undefined) patch.exchangeRate = rate
      }
    }
    update(patch)
  }

  return (
    <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-4">
      <Field label="旅程名稱">
        <TextInput value={trip.name} onChange={(v) => update({ name: v })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="國家">
          <TextInput
            value={country}
            placeholder="例：日本"
            list="ov-countries"
            onChange={onCountryChange}
          />
          <datalist id="ov-countries">
            {opts.countries.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="都市">
          <TextInput
            value={city}
            placeholder="例：大阪"
            list={`ov-cities-${country || 'all'}`}
            onChange={(v) => update({ city: v })}
          />
          <datalist id={`ov-cities-${country || 'all'}`}>
            {cityOptions.map((c) => (
              <option key={`${country}${SEP}${c}`} value={c} />
            ))}
          </datalist>
        </Field>
      </div>
      {trip.region && !country && (
        <p className="-mt-2 text-xs text-gray-400">舊地區欄：{trip.region}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="出發日期">
          <DateInput value={trip.startDate} onChange={(v) => update({ startDate: v })} />
        </Field>
        <Field label="回程日期">
          <DateInput value={trip.endDate} onChange={(v) => update({ endDate: v })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="外幣名稱">
          <TextInput
            value={trip.currencyLabel}
            placeholder="日元"
            onChange={(v) => update({ currencyLabel: v })}
          />
        </Field>
        <Field label="外幣代碼">
          <TextInput
            value={trip.currencyCode}
            placeholder="JPY"
            onChange={(v) => update({ currencyCode: v.toUpperCase() })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="匯率（對台幣）">
          <NumberInput value={trip.exchangeRate} step="0.0001" onChange={(n) => update({ exchangeRate: n })} />
        </Field>
        <Field label="人數（算平均用）">
          <NumberInput value={trip.peopleCount} step="1" onChange={(n) => update({ peopleCount: n })} />
        </Field>
      </div>
      <p className="text-xs text-gray-400">
        1 {trip.currencyLabel || '外幣'} = {trip.exchangeRate || 0} 台幣。花費與行程會用這個匯率自動換算，改匯率時所有金額即時更新。
      </p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-600">{label}</span>
      {children}
    </label>
  )
}
