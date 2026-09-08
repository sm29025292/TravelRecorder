import type { Trip } from '../types'

/** 國家 → 幣別對應（T2）。列出常用旅遊目的地；表內找不到就不自動改幣別。 */
export const COUNTRY_CURRENCY: Record<string, { code: string; label: string }> = {
  日本: { code: 'JPY', label: '日元' },
  韓國: { code: 'KRW', label: '韓元' },
  泰國: { code: 'THB', label: '泰銖' },
  越南: { code: 'VND', label: '越南盾' },
  新加坡: { code: 'SGD', label: '新加坡幣' },
  馬來西亞: { code: 'MYR', label: '令吉' },
  印尼: { code: 'IDR', label: '印尼盾' },
  菲律賓: { code: 'PHP', label: '披索' },
  中國: { code: 'CNY', label: '人民幣' },
  香港: { code: 'HKD', label: '港幣' },
  澳門: { code: 'MOP', label: '澳門幣' },
  美國: { code: 'USD', label: '美元' },
  英國: { code: 'GBP', label: '英鎊' },
  法國: { code: 'EUR', label: '歐元' },
  德國: { code: 'EUR', label: '歐元' },
  義大利: { code: 'EUR', label: '歐元' },
  西班牙: { code: 'EUR', label: '歐元' },
  荷蘭: { code: 'EUR', label: '歐元' },
  澳洲: { code: 'AUD', label: '澳幣' },
  紐西蘭: { code: 'NZD', label: '紐幣' },
  台灣: { code: 'TWD', label: '台幣' },
}

/** 對台幣參考匯率（只用於「使用者尚未在別的旅程用過此幣別」時的第一次預設）。 */
export const DEFAULT_RATES: Record<string, number> = {
  JPY: 0.21,
  KRW: 0.023,
  USD: 31,
  EUR: 34,
  GBP: 39,
  THB: 0.9,
  HKD: 4.0,
  CNY: 4.3,
  SGD: 23,
  AUD: 20,
  NZD: 18,
  MYR: 7,
  PHP: 0.55,
  VND: 0.0012,
  IDR: 0.002,
  MOP: 3.9,
  TWD: 1,
}

/**
 * 挑選一個對外幣代碼 `code` 的匯率：
 * 1. 從**其他旅程**中找 currencyCode 相符且 exchangeRate > 0 者，取 updatedAt 最新的匯率
 *    （使用者實際用過的數字通常比表格預設值準）；
 * 2. 若都沒有 → 回 DEFAULT_RATES[code]；
 * 3. 仍沒有 → 回 undefined（呼叫端應不動原匯率）。
 */
export function pickExchangeRate(
  trips: Trip[],
  code: string,
  excludeTripId: string,
): number | undefined {
  let best: Trip | undefined
  for (const t of trips) {
    if (t.id === excludeTripId) continue
    if (t.currencyCode !== code) continue
    if (!(t.exchangeRate > 0)) continue
    if (!best || t.updatedAt > best.updatedAt) best = t
  }
  if (best) return best.exchangeRate
  return DEFAULT_RATES[code]
}
