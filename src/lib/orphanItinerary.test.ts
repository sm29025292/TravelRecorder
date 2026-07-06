import { describe, it, expect } from 'vitest'
import { findOrphanItinerary } from './orphanItinerary'
import type { Attraction, ItineraryItem } from '../types'

function a(over: Partial<Attraction>): Attraction {
  return {
    id: over.id ?? Math.random().toString(),
    country: '',
    city: '',
    district: '',
    name: '',
    address: '',
    url: '',
    notes: '',
    priority: 0,
    type: '',
    ...over,
  }
}

function it_(over: Partial<ItineraryItem>): ItineraryItem {
  return {
    id: over.id ?? Math.random().toString(),
    tripId: '',
    date: '',
    time: '',
    attractionId: '',
    activity: '',
    hours: 0,
    transportCost: 0,
    activityCost: 0,
    paidBy: '',
    notes: '',
    link: '',
    sort: 0,
    ...over,
  }
}

describe('findOrphanItinerary', () => {
  it('空 itinerary 回空陣列', () => {
    expect(findOrphanItinerary([], [a({ id: 'A1' })])).toEqual([])
  })

  it('全部有對應景點 → 沒有孤兒', () => {
    const orphans = findOrphanItinerary(
      [
        it_({ id: 'I1', attractionId: 'A1' }),
        it_({ id: 'I2', attractionId: 'A2' }),
      ],
      [a({ id: 'A1' }), a({ id: 'A2' })],
    )
    expect(orphans).toEqual([])
  })

  it('attractionId 為空字串（未指定）不算孤兒', () => {
    const orphans = findOrphanItinerary(
      [it_({ id: 'I1', attractionId: '' }), it_({ id: 'I2', attractionId: '' })],
      [],
    )
    expect(orphans).toEqual([])
  })

  it('回傳孤兒列且保持輸入順序', () => {
    const rows = [
      it_({ id: 'I1', attractionId: 'A1' }), // 有對應
      it_({ id: 'I2', attractionId: 'GHOST-1' }), // 孤兒
      it_({ id: 'I3', attractionId: '' }), // 未指定
      it_({ id: 'I4', attractionId: 'GHOST-2' }), // 孤兒
      it_({ id: 'I5', attractionId: 'A1' }), // 有對應
    ]
    const orphans = findOrphanItinerary(rows, [a({ id: 'A1' })])
    expect(orphans.map((r) => r.id)).toEqual(['I2', 'I4'])
  })

  it('attractions 空表時，所有非空 attractionId 皆為孤兒', () => {
    const rows = [
      it_({ id: 'I1', attractionId: 'A1' }),
      it_({ id: 'I2', attractionId: '' }),
      it_({ id: 'I3', attractionId: 'A2' }),
    ]
    const orphans = findOrphanItinerary(rows, [])
    expect(orphans.map((r) => r.id)).toEqual(['I1', 'I3'])
  })
})
