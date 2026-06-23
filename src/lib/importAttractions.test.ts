import { describe, it, expect } from 'vitest'
import { parseCSV } from './csv'
import { rowsToAttractions } from './importAttractions'

// 合成樣本：涵蓋向下填滿、備註在不同欄、第二份重複表頭、餐館表（引號內逗號的價位）、雜項。
const csv = [
  '地點,景點,地址,網址,備註,,,優先度(1-3),',
  '大阪,環球影城,,營業時間,,,,1,',
  ',通天閣,,,,,,1,', // 向下填滿「大阪」
  '京都車站,京都車站,,,,拉麵小路,,1,', // 備註內容在第 5 欄
  '地點,景點,地址,網址,備註,,,優先度(1-3),', // 第二份（重複）
  '大阪,環球影城,,營業時間,,,,1,', // 與前面重複 → 去重
  '地點,餐館/小吃(種類/店名),地址,網址,備註(開店時間),價位(円),,,',
  '大阪心齋橋,四天王,大阪府道頓堀,,24小時,"700,920",,,', // 美食＋引號逗號價位
  'Google Map,191116-191123日本關西,,,,,,,', // 雜項分組 → 略過
  '早餐,早餐,,,,,,,', // 雜項名稱 → 略過
].join('\n')

describe('rowsToAttractions', () => {
  const { items, skipped } = rowsToAttractions(parseCSV(csv))

  it('正確筆數與略過數（去重1 + 雜項2 = 3）', () => {
    expect(items).toHaveLength(4)
    expect(skipped).toBe(3)
  })

  it('地點向下填滿（落在都市 city）', () => {
    expect(items[1]).toMatchObject({ country: '', city: '大阪', name: '通天閣', priority: 1 })
  })

  it('備註可取自非標準欄位', () => {
    expect(items[2]).toMatchObject({ city: '京都車站', name: '京都車站', notes: '拉麵小路' })
  })

  it('餐館自成美食分組、價位（含逗號）併入備註、type 標記 food', () => {
    expect(items[3]).toMatchObject({
      country: '',
      city: '大阪心齋橋 美食',
      name: '四天王',
      address: '大阪府道頓堀',
      notes: '24小時・價位：700,920',
      type: 'food',
    })
  })

  it('不含被略過的雜項', () => {
    const names = items.map((i) => i.name)
    expect(names).not.toContain('早餐')
    expect(names).not.toContain('191116-191123日本關西')
  })
})
