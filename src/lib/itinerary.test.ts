import { describe, it, expect } from 'vitest'
import {
  groupItineraryByDate,
  weekdayLabel,
  itineraryDaySubtotal,
  datesInRange,
} from './itinerary'
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

  it('同日依 time 升冪、空 time 沉底', () => {
    const items = [
      row({ id: 'late', date: '2026-07-06', time: '10:00', sort: 1 }),
      row({ id: 'blank', date: '2026-07-06', time: '', sort: 2 }),
      row({ id: 'early', date: '2026-07-06', time: '09:00', sort: 3 }),
    ]
    const groups = groupItineraryByDate(items)
    expect(groups).toHaveLength(1)
    expect(groups[0].items.map((i) => i.id)).toEqual(['early', 'late', 'blank'])
  })

  it('同 time 以 sort 為 tie-breaker', () => {
    const items = [
      row({ id: 'b', date: '2026-07-06', time: '10:00', sort: 2 }),
      row({ id: 'a', date: '2026-07-06', time: '10:00', sort: 1 }),
    ]
    const groups = groupItineraryByDate(items)
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'b'])
  })

  it('全空 time 時退回依 sort 升冪', () => {
    const items = [
      row({ id: 'c', date: '2026-07-06', time: '', sort: 3 }),
      row({ id: 'a', date: '2026-07-06', time: '', sort: 1 }),
      row({ id: 'b', date: '2026-07-06', time: '', sort: 2 }),
    ]
    const groups = groupItineraryByDate(items)
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('groupItineraryByDate + range', () => {
  it('補區間內沒行程列的空日組', () => {
    const items = [row({ id: 'a', date: '2026-07-07', sort: 1 })]
    const groups = groupItineraryByDate(items, {
      startDate: '2026-07-06',
      endDate: '2026-07-08',
    })
    expect(groups.map((g) => g.date)).toEqual(['2026-07-06', '2026-07-07', '2026-07-08'])
    expect(groups[0].items).toEqual([])
    expect(groups[1].items.map((i) => i.id)).toEqual(['a'])
    expect(groups[2].items).toEqual([])
  })

  it('跨月補空日、區間外日期組仍存在', () => {
    const items = [
      row({ id: 'x', date: '2026-06-30', sort: 1 }),
      row({ id: 'y', date: '2026-08-15', sort: 1 }),
    ]
    const groups = groupItineraryByDate(items, {
      startDate: '2026-07-30',
      endDate: '2026-08-02',
    })
    expect(groups.map((g) => g.date)).toEqual([
      '2026-06-30',
      '2026-07-30',
      '2026-07-31',
      '2026-08-01',
      '2026-08-02',
      '2026-08-15',
    ])
    expect(groups[1].items).toEqual([])
    expect(groups[2].items).toEqual([])
    expect(groups[3].items).toEqual([])
    expect(groups[4].items).toEqual([])
  })

  it('未排日期組仍置底', () => {
    const items = [row({ id: 'u', date: '', sort: 1 })]
    const groups = groupItineraryByDate(items, {
      startDate: '2026-07-06',
      endDate: '2026-07-07',
    })
    expect(groups.map((g) => g.date)).toEqual(['2026-07-06', '2026-07-07', ''])
  })

  it('endDate < startDate 不補', () => {
    const groups = groupItineraryByDate([], {
      startDate: '2026-07-10',
      endDate: '2026-07-06',
    })
    expect(groups).toEqual([])
  })

  it('日期格式不合不補', () => {
    const groups = groupItineraryByDate([], {
      startDate: '2026/07/06',
      endDate: '2026-07-07',
    })
    expect(groups).toEqual([])
  })

  it('區間天數 > 90 不補', () => {
    const groups = groupItineraryByDate([], {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    })
    expect(groups).toEqual([])
  })

  it('不傳 range 行為與原本相同', () => {
    const items = [row({ id: 'a', date: '2026-07-07', sort: 1 })]
    const groups = groupItineraryByDate(items)
    expect(groups.map((g) => g.date)).toEqual(['2026-07-07'])
  })
})

describe('datesInRange', () => {
  it('單日回單元素', () => {
    expect(datesInRange('2026-07-06', '2026-07-06')).toEqual(['2026-07-06'])
  })
  it('跨月列日期', () => {
    expect(datesInRange('2026-07-30', '2026-08-02')).toEqual([
      '2026-07-30',
      '2026-07-31',
      '2026-08-01',
      '2026-08-02',
    ])
  })
  it('倒序回空', () => {
    expect(datesInRange('2026-07-10', '2026-07-06')).toEqual([])
  })
  it('90 天上限（含端點）', () => {
    // 2026-01-01 ~ 2026-03-31 為 90 天，允許
    expect(datesInRange('2026-01-01', '2026-03-31')).toHaveLength(90)
    // 2026-01-01 ~ 2026-04-01 為 91 天，超過
    expect(datesInRange('2026-01-01', '2026-04-01')).toEqual([])
  })
  it('非法日期回空', () => {
    expect(datesInRange('2026-02-30', '2026-03-01')).toEqual([])
    expect(datesInRange('2026/07/06', '2026-07-07')).toEqual([])
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
