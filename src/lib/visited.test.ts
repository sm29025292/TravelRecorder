import { describe, it, expect } from 'vitest'
import { visitedAttractionIds } from './visited'

describe('visitedAttractionIds', () => {
  it('基本：收集非空 attractionId 成 Set', () => {
    const s = visitedAttractionIds([
      { attractionId: 'A1' },
      { attractionId: 'A2' },
      { attractionId: 'A3' },
    ])
    expect(s).toEqual(new Set(['A1', 'A2', 'A3']))
  })

  it('空清單回空 Set', () => {
    expect(visitedAttractionIds([])).toEqual(new Set())
  })

  it('重複 id 自動去重、空字串忽略', () => {
    const s = visitedAttractionIds([
      { attractionId: 'A1' },
      { attractionId: '' },
      { attractionId: 'A1' },
      { attractionId: 'A2' },
      { attractionId: '' },
      { attractionId: 'A2' },
    ])
    expect(s).toEqual(new Set(['A1', 'A2']))
    expect(s.size).toBe(2)
  })
})
