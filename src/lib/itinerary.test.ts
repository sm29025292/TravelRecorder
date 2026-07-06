import { describe, it, expect } from 'vitest'
import { groupItineraryByDate, weekdayLabel, itineraryDaySubtotal } from './itinerary'
import { itineraryTotal } from './money'
import type { ItineraryItem, Trip } from '../types'

const trip: Pick<Trip, 'exchangeRate'> = { exchangeRate: 0.21 }

function row(over: Partial<ItineraryItem>): ItineraryItem {
  return {
    id: over.id ?? Math.random().toString(),
    tripId: 't1',
    date: '',
    time: '',
    attractionId: '',
    activity: '',
    hours: 0,
    transportCost: 0,
    activityCost: 0,
    paidBy: '',
    payerId: '',
    participantIds: [],
    notes: '',
    link: '',
    sort: 0,
    ...over,
  }
}

describe('groupItineraryByDate', () => {
  it('依日期升冪分組，組內依 sort 升冪', () => {
    const items = [
      row({ id: 'b', date: '2026-07-07', sort: 2 }),
      row({ id: 'a', date: '2026-07-06', sort: 1 }),
      row({ id: 'd', date: '2026-07-07', sort: 1 }),
      row({ id: 'c', date: '2026-07-06', sort: 2 }),
    ]
    const groups = groupItineraryByDate(items)
    expect(groups.map((g) => g.date)).toEqual(['2026-07-06', '2026-07-07'])
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'c'])
    expect(groups[1].items.map((i) => i.id)).toEqual(['d', 'b'])
  })

  it('空 date 組置底', () => {
    const items = [
      row({ id: 'u', date: '', sort: 1 }),
      row({ id: 'x', date: '2026-07-06', sort: 1 }),
    ]
    const groups = groupItineraryByDate(items)
    expect(groups.map((g) => g.date)).toEqual(['2026-07-06', ''])
  })

  it('全空輸入回空陣列', () => {
    expect(groupItineraryByDate([])).toEqual([])
  })

  it('全空 date 只回一組「未排日期」', () => {
    const items = [row({ id: 'a', date: '', sort: 1 }), row({ id: 'b', date: '', sort: 2 })]
    const groups = groupItineraryByDate(items)
    expect(groups).toHaveLength(1)
    expect(groups[0].date).toBe('')
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'b'])
  })
})

describe('weekdayLabel', () => {
  it('2026-07-06 為週一', () => {
    expect(weekdayLabel('2026-07-06')).toBe('週一')
  })
  it('2026-07-05 為週日', () => {
    expect(weekdayLabel('2026-07-05')).toBe('週日')
  })
  it('空字串與格式錯誤回空字串', () => {
    expect(weekdayLabel('')).toBe('')
    expect(weekdayLabel('2026/07/06')).toBe('')
    expect(weekdayLabel('2026-13-01')).toBe('')
    expect(weekdayLabel('2026-02-30')).toBe('')
  })
})

describe('itineraryDaySubtotal', () => {
  it('時數/外幣/台幣合計，台幣與 itineraryTotal 一致', () => {
    const items = [
      row({ hours: 2, transportCost: 500, activityCost: 1500 }),
      row({ hours: 1.5, transportCost: 0, activityCost: 1000 }),
    ]
    const sub = itineraryDaySubtotal(items, trip)
    expect(sub.hours).toBe(3.5)
    expect(sub.foreign).toBe(3000)
    expect(sub.twd).toBe(itineraryTotal(items, trip))
    expect(sub.twd).toBe(630)
  })

  it('空 items 回 0', () => {
    expect(itineraryDaySubtotal([], trip)).toEqual({ hours: 0, foreign: 0, twd: 0 })
  })
})
