import { describe, it, expect } from 'vitest'
import {
  findDuplicateGroups,
  mergeAttractionFields,
  normalizeName,
} from './dedupeAttractions'
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

describe('normalizeName', () => {
  it('去半形空白／tab／換行、全形空白、大小寫', () => {
    expect(normalizeName('  Foo\tBar\n  ')).toBe('foobar')
    expect(normalizeName('富　士　山')).toBe('富士山')
    expect(normalizeName('CAFé Del Mar')).toBe('cafédelmar')
  })
})

describe('findDuplicateGroups', () => {
  it('空輸入回空陣列', () => {
    expect(findDuplicateGroups([])).toEqual([])
  })

  it('未命名（name === "" 或全空白）不參與分組', () => {
    const groups = findDuplicateGroups([
      a({ id: '1', name: '' }),
      a({ id: '2', name: '   ' }),
      a({ id: '3', name: '　' }),
    ])
    expect(groups).toEqual([])
  })

  it('單筆桶不成組', () => {
    const groups = findDuplicateGroups([
      a({ id: '1', name: '通天閣' }),
      a({ id: '2', name: '大阪城' }),
    ])
    expect(groups).toEqual([])
  })

  it('三筆名稱正規化後相同（半形/全形/大小寫）→ 一組 3 筆', () => {
    const groups = findDuplicateGroups([
      a({ id: '1', name: '富士 山', priority: 1 }),
      a({ id: '2', name: '富士　山', priority: 3 }),
      a({ id: '3', name: 'FUJI SAN 富士山', priority: 0 }), // 不同：混英文
      a({ id: '4', name: '富士山', priority: 2 }),
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0].map((x) => x.id)).toEqual(['2', '4', '1']) // priority 降冪穩定
  })

  it('多組同時存在時依組內第一筆 name 排序', () => {
    const groups = findDuplicateGroups([
      a({ id: 'z1', name: '通天閣' }),
      a({ id: 'z2', name: '通天閣' }),
      a({ id: 'a1', name: '大阪城' }),
      a({ id: 'a2', name: '大阪城' }),
    ])
    expect(groups).toHaveLength(2)
    expect(groups[0][0].name).toBe('大阪城')
    expect(groups[1][0].name).toBe('通天閣')
  })
})

describe('mergeAttractionFields', () => {
  it('survivor 非空欄位保留、id 沿用', () => {
    const survivor = a({
      id: 'S',
      country: '日本',
      city: '大阪',
      district: '心齋橋',
      name: '通天閣',
      address: '大阪府浪速區',
      url: 'https://s.example',
      priority: 2,
      type: 'attraction',
    })
    const loser = a({
      id: 'L',
      country: '別的國家',
      city: '別都市',
      district: '別區',
      name: '別名',
      address: '別地址',
      url: 'https://l.example',
      priority: 1,
      type: 'food',
    })
    const merged = mergeAttractionFields(survivor, [loser])
    expect(merged.id).toBe('S')
    expect(merged).toMatchObject({
      country: '日本',
      city: '大阪',
      district: '心齋橋',
      name: '通天閣',
      address: '大阪府浪速區',
      url: 'https://s.example',
      type: 'attraction',
    })
  })

  it('survivor 空欄位由第一個非空 loser 補上（非最後一個）', () => {
    const survivor = a({ id: 'S', country: '', city: '', district: '', address: '', url: '' })
    const l1 = a({ id: 'L1', country: '日本', city: '', address: '第一地址' })
    const l2 = a({ id: 'L2', country: '韓國', city: '首爾', address: '第二地址', url: 'https://l2' })
    const merged = mergeAttractionFields(survivor, [l1, l2])
    expect(merged.country).toBe('日本') // L1 先命中
    expect(merged.city).toBe('首爾') // L1 空 → 取 L2
    expect(merged.address).toBe('第一地址') // 兩者都有 → 取 L1
    expect(merged.url).toBe('https://l2') // 只有 L2 有
  })

  it('notes 聯集：以ㅇ・ split → trim → 保序去重', () => {
    const survivor = a({ id: 'S', notes: 'A・ B ・' })
    const l1 = a({ id: 'L1', notes: 'B・C' })
    const l2 = a({ id: 'L2', notes: '  ・ A ・D' })
    const merged = mergeAttractionFields(survivor, [l1, l2])
    expect(merged.notes).toBe('A・B・C・D')
  })

  it('notes 全空回空字串', () => {
    const merged = mergeAttractionFields(a({ id: 'S' }), [a({ id: 'L' })])
    expect(merged.notes).toBe('')
  })

  it('priority 取最大', () => {
    const merged = mergeAttractionFields(
      a({ id: 'S', priority: 2 }),
      [a({ id: 'L1', priority: 1 }), a({ id: 'L2', priority: 3 })],
    )
    expect(merged.priority).toBe(3)
  })
})
