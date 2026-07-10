import { describe, it, expect } from 'vitest'
import { itineraryToText } from './exportItinerary'
import { groupItineraryByDate } from './itinerary'
import type { ItineraryItem, Attraction, Trip } from '../types'

function row(over: Partial<ItineraryItem>): ItineraryItem {
  return {
    id: over.id ?? Math.random().toString(),
    tripId: 't1',
    date: '',
    time: '',
    endTime: '',
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

function att(id: string, name: string): Attraction {
  return {
    id,
    country: '',
    city: '',
    district: '',
    name,
    address: '',
    url: '',
    notes: '',
    priority: 0,
    type: '',
  }
}

const trip: Pick<Trip, 'name' | 'startDate' | 'endDate'> = {
  name: '大阪五日',
  startDate: '2026-07-06',
  endDate: '2026-07-08',
}

describe('itineraryToText', () => {
  it('完整旅程：首行含日期範圍、每日一組、時間段＋景點｜活動＋備註', () => {
    const items = [
      row({
        id: 'a',
        date: '2026-07-06',
        time: '09:00',
        endTime: '11:00',
        attractionId: 'osaka-castle',
        activity: '爬天守閣',
        notes: '早鳥票',
        sort: 1,
      }),
      row({
        id: 'b',
        date: '2026-07-06',
        time: '12:00',
        attractionId: '',
        activity: '午餐',
        sort: 2,
      }),
      row({
        id: 'c',
        date: '2026-07-07',
        time: '',
        endTime: '',
        attractionId: 'usj',
        activity: '',
        sort: 1,
      }),
    ]
    const attractions = [att('osaka-castle', '大阪城'), att('usj', '環球影城')]
    const groups = groupItineraryByDate(items, {
      startDate: trip.startDate,
      endDate: trip.endDate,
    })
    const text = itineraryToText(trip, groups, attractions)
    // 空日組 2026-07-08 應被跳過（items.length === 0）
    expect(text).toBe(
      [
        '大阪五日（2026-07-06 ～ 2026-07-08）',
        '',
        '■ 07/06（週一）',
        '09:00–11:00 大阪城｜爬天守閣',
        '　備註：早鳥票',
        '12:00 午餐',
        '',
        '■ 07/07（週二）',
        '環球影城',
      ].join('\n'),
    )
  })

  it('任一日期空：首行只輸出旅程名', () => {
    const t: Pick<Trip, 'name' | 'startDate' | 'endDate'> = {
      name: '未定行程',
      startDate: '',
      endDate: '',
    }
    const items = [row({ id: 'a', date: '2026-07-06', activity: '待定' })]
    const groups = groupItineraryByDate(items)
    const text = itineraryToText(t, groups, [])
    expect(text.split('\n')[0]).toBe('未定行程')
    expect(text).not.toContain('～')
  })

  it('startDate 有、endDate 空 → 只輸出旅程名', () => {
    const t: Pick<Trip, 'name' | 'startDate' | 'endDate'> = {
      name: 'X',
      startDate: '2026-07-06',
      endDate: '',
    }
    const text = itineraryToText(t, [], [])
    expect(text).toBe('X')
  })

  it('時間/名稱各種缺漏組合', () => {
    const items = [
      // 只有 time：`09:00 {title}`
      row({ id: 'a', date: '2026-07-06', time: '09:00', activity: '早餐', sort: 1 }),
      // time+endTime：`09:00–10:00`
      row({ id: 'b', date: '2026-07-06', time: '09:00', endTime: '10:00', activity: '會議', sort: 2 }),
      // 皆無時間：只輸出 title
      row({ id: 'c', date: '2026-07-06', activity: '自由活動', sort: 3 }),
      // 皆無時間、皆無名稱與活動：`(未填)`
      row({ id: 'd', date: '2026-07-06', sort: 4 }),
      // 只有景點名（無 activity）
      row({ id: 'e', date: '2026-07-06', attractionId: 'x', sort: 5 }),
      // endTime 有但 time 空 → 時間段省略（規格：time+endTime 皆有→區間，只有 time→time，其餘省略）
      row({ id: 'f', date: '2026-07-06', endTime: '18:00', activity: '晚會', sort: 6 }),
    ]
    const attractions = [att('x', '某景點')]
    const groups = groupItineraryByDate(items)
    const text = itineraryToText(trip, groups, attractions)
    expect(text).toBe(
      [
        '大阪五日（2026-07-06 ～ 2026-07-08）',
        '',
        '■ 07/06（週一）',
        '09:00 早餐',
        '09:00–10:00 會議',
        '自由活動',
        '(未填)',
        '某景點',
        '晚會',
      ].join('\n'),
    )
  })

  it('未排日期組標題為「■ 未排日期」', () => {
    const items = [row({ id: 'a', date: '', activity: '待定' })]
    const groups = groupItineraryByDate(items)
    const text = itineraryToText(trip, groups, [])
    expect(text).toContain('■ 未排日期')
  })

  it('孤兒 attractionId（庫內查無）視同無景點名', () => {
    const items = [row({ id: 'a', date: '2026-07-06', attractionId: 'ghost', activity: '未知' })]
    const groups = groupItineraryByDate(items)
    const text = itineraryToText(trip, groups, [])
    // 只剩 activity
    expect(text).toContain('未知')
    expect(text).not.toContain('｜')
  })
})
