import type { ExpenseItem, ShoppingItem } from '../types'

// T1：把購物列轉成花費列。id 沿用（冪等），notes 前綴 [購物] 標示來源。
export function shoppingToExpense(s: ShoppingItem, sort: number): ExpenseItem {
  const notes = s.notes ? `[購物] ${s.notes}` : '[購物]'
  return {
    id: s.id,
    tripId: s.tripId,
    date: s.date,
    time: s.time,
    item: s.item,
    currency: s.currency,
    amount: s.amount,
    fee: s.fee,
    paid: false,
    paidBy: '',
    payerId: s.payerId,
    participantIds: s.participantIds,
    paymentStatus: '',
    notes,
    sort,
  }
}
