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

// 表頭多一個「區域」欄：地點→city、區域→district，餐館表則跳過「地點 美食」後綴。
const csvWithDistrict = [
  '地點,區域,景點,地址,網址,備註,,,優先度(1-3),',
  '京都,車站,京都塔,,,,,,1,', // 有區域
  ',,梅小路公園,,,迷宮的十字路口,,,1,', // 區域向下填滿
  ',清水,清水寺,,,,,,1,', // 換區域
  '大阪,,環球影城,,,,,,1,', // 換都市，區域重置為空
  '地點,區域,餐館/小吃,地址,網址,備註,價位(円),,,', // 餐館表也支援區域
  '大阪,心齋橋,一蘭拉麵,,,,700,,,',
].join('\n')

describe('rowsToAttractions with 區域 column', () => {
  const { items } = rowsToAttractions(parseCSV(csvWithDistrict))
  const byName = Object.fromEntries(items.map((i) => [i.name, i]))

  it('地點 → city、區域 → district，區域可向下填滿', () => {
    expect(byName['京都塔']).toMatchObject({ city: '京都', district: '車站' })
    expect(byName['梅小路公園']).toMatchObject({ city: '京都', district: '車站' })
  })

  it('區域可在同一都市內覆寫', () => {
    expect(byName['清水寺']).toMatchObject({ city: '京都', district: '清水' })
  })

  it('都市切換時區域自動重置為空', () => {
    expect(byName['環球影城']).toMatchObject({ city: '大阪', district: '' })
  })

  it('餐館表在有區域欄時不再加「地點 美食」後綴，僅以 type:food 標記', () => {
    expect(byName['一蘭拉麵']).toMatchObject({
      city: '大阪',
      district: '心齋橋',
      type: 'food',
    })
  })
})

// 表頭再多一個「國家」欄：country 從 CSV 直接落地，切換國家時 city+district 都重置。
const csvWithCountry = [
  '國家,地點,區域,景點,地址,網址,備註,,,優先度(1-3),',
  '日本,京都,車站,京都塔,,,,,,1,', // 首列有國家＋地點＋區域
  ',,,梅小路公園,,,,,,1,', // 三層全部向下填滿
  ',,清水,清水寺,,,,,,1,', // 換區域（同國同都市）
  ',大阪,,環球影城,,,,,,1,', // 換都市（同國），區域重置
  '韓國,首爾,,景福宮,,,,,,1,', // 換國家，都市/區域全部重置
  ',,,南山塔,,,,,,1,', // 向下填滿新的國家
].join('\n')

describe('rowsToAttractions with 國家 column', () => {
  const { items } = rowsToAttractions(parseCSV(csvWithCountry))
  const byName = Object.fromEntries(items.map((i) => [i.name, i]))

  it('國家值落入 country、三層向下填滿', () => {
    expect(byName['京都塔']).toMatchObject({ country: '日本', city: '京都', district: '車站' })
    expect(byName['梅小路公園']).toMatchObject({
      country: '日本',
      city: '京都',
      district: '車站',
    })
  })

  it('都市切換時區域自動重置為空（同國）', () => {
    expect(byName['環球影城']).toMatchObject({ country: '日本', city: '大阪', district: '' })
  })

  it('國家切換時 city/district 全部重置並改用新國家', () => {
    expect(byName['景福宮']).toMatchObject({ country: '韓國', city: '首爾', district: '' })
    expect(byName['南山塔']).toMatchObject({ country: '韓國', city: '首爾', district: '' })
  })
})
