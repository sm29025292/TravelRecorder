import type { ReactNode } from 'react'
import type { Trip } from '../../types'
import { db } from '../../db/db'
import { now } from '../../lib/id'
import { TextInput, DateInput, NumberInput } from '../cells'

export default function OverviewTab({ trip }: { trip: Trip }) {
  const update = (patch: Partial<Trip>) => db.trips.update(trip.id, { ...patch, updatedAt: now() })

  return (
    <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-4">
      <Field label="旅程名稱">
        <TextInput value={trip.name} onChange={(v) => update({ name: v })} />
      </Field>
      <Field label="地點 / 地區">
        <TextInput
          value={trip.region}
          placeholder="例：日本 大阪・京都"
          onChange={(v) => update({ region: v })}
        />
      </Field>
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
