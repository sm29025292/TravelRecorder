import { describe, it, expect } from 'vitest'
import {
  round,
  toTWD,
  rateForCurrency,
  expenseSubtotal,
  expensesTotal,
  expensesAverage,
  itinerarySubtotal,
  itineraryTotal,
} from './money'
import type { Trip } from '../types'

const trip: Pick<Trip, 'currencyCode' | 'exchangeRate'> = {
  currencyCode: 'JPY',
  exchangeRate: 0.21,
}

describe('round', () => {
  it('四捨五入到兩位並處理浮點誤差', () => {
    expect(round(1575.5)).toBe(1575.5)
    expect(round(0.1 + 0.2)).toBe(0.3)
    expect(round(7437.25)).toBe(7437.25)
  })
  it('非有限數字回傳 0', () => {
    expect(round(NaN)).toBe(0)
    expect(round(Infinity)).toBe(0)
  })
})

describe('toTWD / rateForCurrency', () => {
  it('外幣依匯率換算台幣', () => {
    expect(toTWD(1000, 0.21)).toBe(210)
  })
  it('TWD 與空字串匯率視為 1', () => {
    expect(rateForCurrency('TWD', trip)).toBe(1)
    expect(rateForCurrency('', trip)).toBe(1)
    expect(rateForCurrency('JPY', trip)).toBe(0.21)
  })
})

describe('expenseSubtotal', () => {
  it('外幣列：金額換算台幣加手續費', () => {
    expect(expenseSubtotal({ currency: 'JPY', amount: 10000, fee: 30 }, trip)).toBe(2130)
  })
  it('台幣列：直接使用金額加手續費', () => {
    expect(expenseSubtotal({ currency: 'TWD', amount: 13299, fee: 0 }, trip)).toBe(13299)
    expect(expenseSubtotal({ currency: 'TWD', amount: 1575.5, fee: 0 }, trip)).toBe(1575.5)
  })
})

describe('expensesTotal / expensesAverage（對照試算表 14875 / 7437）', () => {
  const items = [
    { currency: 'TWD', amount: 13299, fee: 0 },
    { currency: 'TWD', amount: 1575.5, fee: 0 },
  ]
  it('總計為精確值 14874.5，整數顯示為 14875', () => {
    const total = expensesTotal(items, trip)
    expect(total).toBe(14874.5)
    expect(Math.round(total)).toBe(14875)
  })
  it('平均由精確總計計算為 7437.25，整數顯示為 7437', () => {
    const avg = expensesAverage(expensesTotal(items, trip), 2)
    expect(avg).toBe(7437.25)
    expect(Math.round(avg)).toBe(7437)
  })
  it('人數為 0 時平均為 0（不會除以零壞掉）', () => {
    expect(expensesAverage(14874.5, 0)).toBe(0)
  })
})

describe('itinerary', () => {
  it('行程小計＝（交通＋花費）換算台幣', () => {
    expect(itinerarySubtotal({ transportCost: 500, activityCost: 1500 }, trip)).toBe(420)
  })
  it('行程總計加總多列', () => {
    const items = [
      { transportCost: 500, activityCost: 1500 },
      { transportCost: 0, activityCost: 1000 },
    ]
    expect(itineraryTotal(items, trip)).toBe(630)
  })
})
