import { describe, it, expect } from 'vitest'
import { buildLocationTree, groupByLocation } from './group'
import type { Attraction } from '../types'

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

describe('buildLocationTree', () => {
  it('依國家→都市→區域三層分組，計數正確', () => {
    const items = [
      a({ id: '1', country: '日本', city: '大阪', district: '心齋橋' }),
      a({ id: '2', country: '日本', city: '大阪', district: '難波' }),
      a({ id: '3', country: '日本', city: '東京', district: '澀谷' }),
      a({ id: '4', country: '韓國', city: '首爾', district: '' }),
    ]
    const tree = buildLocationTree(items)
    expect(tree.map((c) => c.country)).toEqual(['日本', '韓國'])
    const jp = tree[0]
    expect(jp.count).toBe(3)
    expect(jp.cities.map((c) => c.city)).toEqual(['大阪', '東京'])
    const osaka = jp.cities[0]
    expect(osaka.count).toBe(2)
    expect(osaka.direct).toEqual([])
    expect(osaka.districts.map((d) => d.district)).toEqual(['心齋橋', '難波'])
    const kr = tree[1]
    expect(kr.cities[0].direct.map((x) => x.id)).toEqual(['4'])
    expect(kr.cities[0].districts).toEqual([])
    expect(kr.count).toBe(1)
  })

  it('country === "" 節點置頂顯示為「未分類」', () => {
    const items = [
      a({ id: '1', country: '日本', city: '大阪' }),
      a({ id: '2', country: '', city: '未知' }),
      a({ id: '3', country: '韓國', city: '首爾' }),
    ]
    const tree = buildLocationTree(items)
    expect(tree[0].country).toBe('')
    expect(tree[0].cities.map((c) => c.city)).toEqual(['未知'])
    expect(tree.slice(1).map((c) => c.country)).toEqual(['日本', '韓國'])
  })

  it('空層歸位：district 空的列進 CityNode.direct、city 空的列成獨立 city 節點', () => {
    const items = [
      a({ id: '1', country: '日本', city: '大阪', district: '' }),
      a({ id: '2', country: '日本', city: '大阪', district: '心齋橋' }),
      a({ id: '3', country: '日本', city: '', district: '' }),
    ]
    const tree = buildLocationTree(items)
    const jp = tree[0]
    // 城市空字串在 localeCompare 下排前；大阪其後
    expect(jp.cities.map((c) => c.city)).toEqual(['', '大阪'])
    const emptyCity = jp.cities[0]
    expect(emptyCity.direct.map((x) => x.id)).toEqual(['3'])
    expect(emptyCity.count).toBe(1)
    const osaka = jp.cities[1]
    expect(osaka.direct.map((x) => x.id)).toEqual(['1'])
    expect(osaka.districts.map((d) => d.district)).toEqual(['心齋橋'])
    expect(osaka.count).toBe(2)
    expect(jp.count).toBe(3)
  })

  it('空輸入回空陣列', () => {
    expect(buildLocationTree([])).toEqual([])
  })

  it('都市與區域皆依中文排序', () => {
    const items = [
      a({ id: '1', country: '日本', city: '東京' }),
      a({ id: '2', country: '日本', city: '大阪' }),
      a({ id: '3', country: '日本', city: '京都' }),
      a({ id: '4', country: '日本', city: '大阪', district: '難波' }),
      a({ id: '5', country: '日本', city: '大阪', district: '心齋橋' }),
    ]
    const tree = buildLocationTree(items)
    expect(tree[0].cities.map((c) => c.city)).toEqual(
      ['京都', '大阪', '東京'].sort((a, b) => a.localeCompare(b, 'zh-Hant')),
    )
    const osaka = tree[0].cities.find((c) => c.city === '大阪')!
    expect(osaka.districts.map((d) => d.district)).toEqual(
      ['心齋橋', '難波'].sort((a, b) => a.localeCompare(b, 'zh-Hant')),
    )
  })

  it('組內依 priority 降冪、名稱升冪排序（DistrictNode.list 與 CityNode.direct 皆同）', () => {
    const items = [
      a({ id: '1', country: '日本', city: '大阪', district: '心齋橋', name: '甲', priority: 1 }),
      a({ id: '2', country: '日本', city: '大阪', district: '心齋橋', name: '乙', priority: 3 }),
      a({ id: '3', country: '日本', city: '大阪', district: '心齋橋', name: '丙', priority: 0 }),
      a({ id: '4', country: '日本', city: '大阪', district: '心齋橋', name: '丁', priority: 3 }),
      a({ id: '5', country: '日本', city: '大阪', district: '', name: 'B', priority: 2 }),
      a({ id: '6', country: '日本', city: '大阪', district: '', name: 'A', priority: 2 }),
      a({ id: '7', country: '日本', city: '大阪', district: '', name: 'C', priority: 3 }),
    ]
    const tree = buildLocationTree(items)
    const osaka = tree[0].cities.find((c) => c.city === '大阪')!
    // direct：C(3) → A(2) → B(2)
    expect(osaka.direct.map((x) => x.name)).toEqual(['C', 'A', 'B'])
    // district list：priority desc；平手依中文名（乙 < 丁 依 zh-Hant）
    const shin = osaka.districts.find((d) => d.district === '心齋橋')!
    const names = shin.list.map((x) => x.name)
    // 兩個 priority 3 的 名稱升冪；然後 priority 1；最後 priority 0
    expect(names[names.length - 1]).toBe('丙')
    expect(names[names.length - 2]).toBe('甲')
    expect(names.slice(0, 2).sort((a, b) => a.localeCompare(b, 'zh-Hant'))).toEqual(names.slice(0, 2))
  })
})

describe('groupByLocation', () => {
  it('組內依 priority 降冪、名稱升冪排序', () => {
    const items = [
      a({ id: '1', country: '日本', city: '大阪', district: '', name: '乙', priority: 1 }),
      a({ id: '2', country: '日本', city: '大阪', district: '', name: '甲', priority: 3 }),
      a({ id: '3', country: '日本', city: '大阪', district: '', name: '丙', priority: 3 }),
      a({ id: '4', country: '日本', city: '大阪', district: '', name: '丁', priority: 0 }),
    ]
    const groups = groupByLocation(items)
    expect(groups).toHaveLength(1)
    const names = groups[0].list.map((x) => x.name)
    // 兩個 priority 3 先出，其中 名稱升冪；接著 priority 1、priority 0
    expect(names.slice(2)).toEqual(['乙', '丁'])
    expect(names.slice(0, 2).sort((a, b) => a.localeCompare(b, 'zh-Hant'))).toEqual(names.slice(0, 2))
  })
})
