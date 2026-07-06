import { describe, it, expect } from 'vitest'
import { buildLocationTree } from './group'
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
})
