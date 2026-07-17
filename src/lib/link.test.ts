import { describe, it, expect } from 'vitest'
import { parseLink, serializeLink, linkDisplayText } from './link'

describe('parseLink', () => {
  it('`[名稱](網址)` 拆成 text／url', () => {
    expect(parseLink('[google](https://google.com)')).toEqual({
      text: 'google',
      url: 'https://google.com',
    })
  })

  it('裸網址 → text 空、url 為整串', () => {
    expect(parseLink('https://google.com')).toEqual({
      text: '',
      url: 'https://google.com',
    })
  })

  it('空字串／全空白 → 兩者皆空', () => {
    expect(parseLink('')).toEqual({ text: '', url: '' })
    expect(parseLink('   ')).toEqual({ text: '', url: '' })
  })

  it('網址含括號（維基百科）需完整保留', () => {
    expect(parseLink('[維基](https://en.wikipedia.org/wiki/Osaka_(city))')).toEqual({
      text: '維基',
      url: 'https://en.wikipedia.org/wiki/Osaka_(city)',
    })
  })

  it('`[名稱]()` 網址空 → 整串當網址處理（非合法格式）', () => {
    expect(parseLink('[abc]()')).toEqual({ text: '', url: '[abc]()' })
  })

  it('前後空白 trim', () => {
    expect(parseLink('  [x](https://y.com)  ')).toEqual({
      text: 'x',
      url: 'https://y.com',
    })
    expect(parseLink('  https://y.com  ')).toEqual({
      text: '',
      url: 'https://y.com',
    })
  })
})

describe('serializeLink', () => {
  it('名稱＋網址皆有 → `[名稱](網址)`', () => {
    expect(serializeLink('google', 'https://google.com')).toBe(
      '[google](https://google.com)',
    )
  })

  it('名稱空 → 存裸網址', () => {
    expect(serializeLink('', 'https://google.com')).toBe('https://google.com')
    expect(serializeLink('   ', 'https://google.com')).toBe('https://google.com')
  })

  it('網址空 → 回 ""（名稱有值也一樣）', () => {
    expect(serializeLink('', '')).toBe('')
    expect(serializeLink('google', '')).toBe('')
    expect(serializeLink('google', '   ')).toBe('')
  })

  it('roundtrip：parseLink(serializeLink(t, u)) 還原', () => {
    const cases: Array<[string, string]> = [
      ['google', 'https://google.com'],
      ['', 'https://google.com'],
      ['維基', 'https://en.wikipedia.org/wiki/Osaka_(city)'],
    ]
    for (const [t, u] of cases) {
      const s = serializeLink(t, u)
      expect(parseLink(s)).toEqual({ text: t, url: u })
    }
  })
})

describe('linkDisplayText', () => {
  it('有名稱 → 名稱', () => {
    expect(linkDisplayText('[google](https://google.com)')).toBe('google')
  })

  it('無名稱 → 完整網址', () => {
    expect(linkDisplayText('https://google.com')).toBe('https://google.com')
  })

  it('空字串 → ""', () => {
    expect(linkDisplayText('')).toBe('')
    expect(linkDisplayText('   ')).toBe('')
  })
})
