import { describe, it, expect } from 'vitest'
import { findOrphanMemberRefs } from './orphanMembers'
import type { ExpenseItem, Member } from '../types'

function m(over: Partial<Member>): Member {
  return {
    id: over.id ?? Math.random().toString(),
    tripId: '',
    name: '',
    passportName: '',
    passportNumber: '',
    birthday: '',
    sort: 0,
    ...over,
  }
}

function e(over: Partial<ExpenseItem>): ExpenseItem {
  return {
    id: over.id ?? Math.random().toString(),
    tripId: '',
    date: '',
    time: '',
    item: '',
    currency: 'TWD',
    amount: 0,
    fee: 0,
    paid: false,
    paidBy: '',
    paymentStatus: '',
    notes: '',
    sort: 0,
    ...over,
  }
}

describe('findOrphanMemberRefs', () => {
  it('無孤兒回空陣列', () => {
    const members = [m({ id: 'M1' }), m({ id: 'M2' })]
    const expenses = [
      e({ id: 'E1', payerId: 'M1', participantIds: ['M1', 'M2'] }),
      e({ id: 'E2', payerId: '', participantIds: [] }),
      e({ id: 'E3' }), // payerId 未設 (undefined)
    ]
    expect(findOrphanMemberRefs(expenses, members)).toEqual([])
  })

  it('payerId 孤兒', () => {
    const members = [m({ id: 'M1' })]
    const expenses = [
      e({ id: 'E1', payerId: 'GHOST', participantIds: ['M1'] }),
    ]
    const out = findOrphanMemberRefs(expenses, members)
    expect(out).toHaveLength(1)
    expect(out[0].expense.id).toBe('E1')
    expect(out[0].orphanPayer).toBe(true)
    expect(out[0].orphanParticipantIds).toEqual([])
  })

  it('participantIds 部分孤兒（只列出孤兒 id，保持順序）', () => {
    const members = [m({ id: 'M1' }), m({ id: 'M2' })]
    const expenses = [
      e({ id: 'E1', payerId: 'M1', participantIds: ['M1', 'GHOST-A', 'M2', 'GHOST-B'] }),
    ]
    const out = findOrphanMemberRefs(expenses, members)
    expect(out).toHaveLength(1)
    expect(out[0].orphanPayer).toBe(false)
    expect(out[0].orphanParticipantIds).toEqual(['GHOST-A', 'GHOST-B'])
  })

  it('payerId 空字串不算孤兒', () => {
    const members = [m({ id: 'M1' })]
    const expenses = [e({ id: 'E1', payerId: '', participantIds: ['M1'] })]
    expect(findOrphanMemberRefs(expenses, members)).toEqual([])
  })

  it('participantIds 未設（undefined）視為全體均分、不算孤兒', () => {
    const members = [m({ id: 'M1' })]
    const expenses = [e({ id: 'E1', payerId: 'M1' })]
    expect(findOrphanMemberRefs(expenses, members)).toEqual([])
  })

  it('同時有 payer 與 participant 孤兒', () => {
    const members = [m({ id: 'M1' })]
    const expenses = [
      e({ id: 'E1', payerId: 'GHOST-P', participantIds: ['GHOST-X', 'M1'] }),
    ]
    const out = findOrphanMemberRefs(expenses, members)
    expect(out).toHaveLength(1)
    expect(out[0].orphanPayer).toBe(true)
    expect(out[0].orphanParticipantIds).toEqual(['GHOST-X'])
  })

  it('保留輸入順序、只回傳有孤兒的列', () => {
    const members = [m({ id: 'M1' })]
    const expenses = [
      e({ id: 'E1', payerId: 'M1' }), // 無問題
      e({ id: 'E2', payerId: 'GHOST' }), // 孤兒
      e({ id: 'E3', participantIds: ['M1'] }), // 無問題
      e({ id: 'E4', participantIds: ['GHOST'] }), // 孤兒
    ]
    const out = findOrphanMemberRefs(expenses, members)
    expect(out.map((r) => r.expense.id)).toEqual(['E2', 'E4'])
  })
})
