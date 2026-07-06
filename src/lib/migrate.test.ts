import { describe, it, expect } from 'vitest'
import { shoppingToExpense } from './migrate'
import type { ShoppingItem } from '../types'

function makeShopping(over: Partial<ShoppingItem> = {}): ShoppingItem {
  return {
    id: 'sid-1',
    tripId: 'trip-1',
    date: '2026-07-01',
    time: '10:30',
    item: '藥妝',
    currency: 'JPY',
    amount: 3200,
    fee: 15,
    payerId: 'm-A',
    participantIds: ['m-A', 'm-B'],
    notes: '',
    sort: 3,
    ...over,
  }
}

describe('shoppingToExpense', () => {
  it('欄位對應：共通欄位原樣、補齊花費新欄位、sort 由參數決定', () => {
    const s = makeShopping({ notes: '松本清' })
    const e = shoppingToExpense(s, 42)
    expect(e).toEqual({
      id: 'sid-1',
      tripId: 'trip-1',
      date: '2026-07-01',
      time: '10:30',
      item: '藥妝',
      currency: 'JPY',
      amount: 3200,
      fee: 15,
      paid: false,
      paidBy: '',
      payerId: 'm-A',
      participantIds: ['m-A', 'm-B'],
      paymentStatus: '',
      notes: '[購物] 松本清',
      sort: 42,
    })
  })

  it('notes 空 → 恰好為 [購物]', () => {
    const e = shoppingToExpense(makeShopping({ notes: '' }), 1)
    expect(e.notes).toBe('[購物]')
  })

  it('notes 非空 → 前綴 [購物] + 空格', () => {
    const e = shoppingToExpense(makeShopping({ notes: '折扣 10%' }), 1)
    expect(e.notes).toBe('[購物] 折扣 10%')
  })

  it('id 沿用（同一 ShoppingItem 呼叫兩次 id 相同）', () => {
    const s = makeShopping()
    const a = shoppingToExpense(s, 1)
    const b = shoppingToExpense(s, 2)
    expect(a.id).toBe(s.id)
    expect(b.id).toBe(s.id)
  })

  it('payerId/participantIds 未設時亦保留原樣（undefined）', () => {
    const s = makeShopping({ payerId: undefined, participantIds: undefined })
    const e = shoppingToExpense(s, 5)
    expect(e.payerId).toBeUndefined()
    expect(e.participantIds).toBeUndefined()
  })
})
