import { describe, it, expect } from 'vitest'
import { parseCSV } from './csv'
import {
  parseAttractionType,
  planAttractionImport,
  rowsToAttractions,
  type NewAttraction,
} from './importAttractions'
import type { Attraction } from '../types'

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

// T49：「類型」欄＋標準格式（Skill 輸出用）。
describe('parseAttractionType', () => {
  it('中文標籤與英文值皆可辨識（英文不分大小寫、前後空白忽略）', () => {
    expect(parseAttractionType('景點')).toBe('attraction')
    expect(parseAttractionType(' 美食 ')).toBe('food')
    expect(parseAttractionType('住宿')).toBe('lodging')
    expect(parseAttractionType('Transport')).toBe('transport')
  })
  it('空字串或無法辨識回 null', () => {
    expect(parseAttractionType('')).toBeNull()
    expect(parseAttractionType('購物')).toBeNull()
  })
})

describe('rowsToAttractions with 類型 column（T49 標準格式）', () => {
  const csv = [
    '國家,地點,區域,類型,景點,地址,網址,備註,優先度',
    '日本,大阪,心齋橋,美食,蟹道樂,大阪府道頓堀1-6-18,[Google 地圖](https://maps.app.goo.gl/x),,2',
    ',,,住宿,難波飯店,,,,',
    ',,,購物,黑門市場,,,早上去,1',
    '日本,大阪,,景點,大阪城,,,,3', // 類型值「景點」不可被誤判為表頭
    '地點,餐館,類型',
    '京都,一蘭,',
  ].join('\n')
  const { items } = rowsToAttractions(parseCSV(csv))
  const byName = Object.fromEntries(items.map((i) => [i.name, i]))

  it('類型欄落入 type，其餘欄位正確', () => {
    expect(byName['蟹道樂']).toMatchObject({
      country: '日本',
      city: '大阪',
      district: '心齋橋',
      type: 'food',
      address: '大阪府道頓堀1-6-18',
      url: '[Google 地圖](https://maps.app.goo.gl/x)',
      priority: 2,
      notes: '',
    })
    expect(byName['難波飯店']).toMatchObject({ type: 'lodging', city: '大阪' })
  })
  it('類型值為「景點」的資料列不會被當成表頭', () => {
    expect(byName['大阪城']).toMatchObject({ type: 'attraction', city: '大阪', district: '', priority: 3 })
  })
  it('無法辨識的類型退回表頭推斷（景點表＝未設），且類型欄不混入備註', () => {
    expect(byName['黑門市場']).toMatchObject({ type: '', notes: '早上去' })
  })
  it('類型欄空白時餐館表仍標 food', () => {
    expect(byName['一蘭']).toMatchObject({ type: 'food' })
  })
})

describe('planAttractionImport（T49：已存在補空白欄位）', () => {
  const base: NewAttraction = {
    country: '日本',
    city: '大阪',
    district: '',
    name: '大阪城',
    address: '',
    url: '',
    notes: '',
    priority: 0,
    type: '',
  }
  const existing: Attraction[] = [
    { ...base, id: 'a1', address: '既有地址', priority: 3 },
    { ...base, id: 'a2', name: '通天閣', address: '', url: 'https://old', type: 'attraction' },
  ]

  it('不存在 → 新增；已存在 → 只補空白欄位、不覆蓋已有值', () => {
    const plan = planAttractionImport(
      [
        { ...base, address: '新地址', url: 'https://new', priority: 1, type: 'attraction' },
        { ...base, name: '通天閣', address: '浪速區', url: 'https://new', type: 'food' },
        { ...base, name: '環球影城' },
      ],
      existing,
    )
    expect(plan.toAdd.map((a) => a.name)).toEqual(['環球影城'])
    expect(plan.toUpdate).toEqual([
      { id: 'a1', name: '大阪城', patch: { url: 'https://new', type: 'attraction' } },
      { id: 'a2', name: '通天閣', patch: { address: '浪速區' } },
    ])
    expect(plan.unchanged).toBe(0)
  })

  it('已存在但無可補欄位 → unchanged；同批次重複鍵只第一筆生效', () => {
    const plan = planAttractionImport(
      [{ ...base, address: '別的地址' }, { ...base, name: 'X' }, { ...base, name: 'X' }],
      existing,
    )
    expect(plan.toAdd).toHaveLength(1)
    expect(plan.toUpdate).toHaveLength(0)
    expect(plan.unchanged).toBe(2)
  })

  it('鍵含國家／都市／區域：區域不同視為不同景點', () => {
    const plan = planAttractionImport([{ ...base, district: '中央區' }], existing)
    expect(plan.toAdd).toHaveLength(1)
  })
})
