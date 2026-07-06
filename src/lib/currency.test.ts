import { describe, it, expect } from 'vitest'
import { pickExchangeRate, DEFAULT_RATES } from './currency'
import type { Trip } from '../types'

function mkTrip(patch: Partial<Trip> & Pick<Trip, 'id'>): Trip {
  return {
    id: patch.id,
    name: patch.name ?? '',
    country: patch.country ?? '',
    city: patch.city ?? '',
    region: patch.region ?? '',
    startDate: '',
    endDate: '',
    currencyCode: patch.currencyCode ?? '',
    currencyLabel: patch.currencyLabel ?? '',
    exchangeRate: patch.exchangeRate ?? 0,
    peopleCount: 2,
    createdAt: 0,
    updatedAt: patch.updatedAt ?? 0,
  }
}

describe('pickExchangeRate', () => {
  it('回傳同幣別旅程中 updatedAt 最新者的匯率', () => {
    const trips: Trip[] = [
      mkTrip({ id: 'a', currencyCode: 'JPY', exchangeRate: 0.19, updatedAt: 100 }),
      mkTrip({ id: 'b', currencyCode: 'JPY', exchangeRate: 0.23, updatedAt: 300 }),
      mkTrip({ id: 'c', currencyCode: 'JPY', exchangeRate: 0.22, updatedAt: 200 }),
    ]
    expect(pickExchangeRate(trips, 'JPY', 'zz')).toBe(0.23)
  })

  it('排除自身旅程', () => {
    const trips: Trip[] = [
      mkTrip({ id: 'self', currencyCode: 'JPY', exchangeRate: 0.99, updatedAt: 999 }),
      mkTrip({ id: 'other', currencyCode: 'JPY', exchangeRate: 0.21, updatedAt: 100 }),
    ]
    expect(pickExchangeRate(trips, 'JPY', 'self')).toBe(0.21)
  })

  it('沒有其他旅程用該幣別時 fallback 到 DEFAULT_RATES', () => {
    const trips: Trip[] = [
      mkTrip({ id: 'a', currencyCode: 'USD', exchangeRate: 30, updatedAt: 100 }),
    ]
    expect(pickExchangeRate(trips, 'JPY', 'zz')).toBe(DEFAULT_RATES.JPY)
  })

  it('exchangeRate 非正數的其他旅程視為無效，改用 DEFAULT_RATES', () => {
    const trips: Trip[] = [
      mkTrip({ id: 'a', currencyCode: 'JPY', exchangeRate: 0, updatedAt: 500 }),
    ]
    expect(pickExchangeRate(trips, 'JPY', 'zz')).toBe(DEFAULT_RATES.JPY)
  })

  it('查無此幣別（DEFAULT_RATES 也沒有）回傳 undefined', () => {
    expect(pickExchangeRate([], 'ZZZ', 'zz')).toBeUndefined()
  })
})
