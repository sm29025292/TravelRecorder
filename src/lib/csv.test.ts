import { describe, it, expect } from 'vitest'
import { parseCSV } from './csv'

describe('parseCSV', () => {
  it('基本逗號與換行', () => {
    expect(parseCSV('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ])
  })

  it('處理引號內的逗號', () => {
    expect(parseCSV('x,"a,b,c",y')).toEqual([['x', 'a,b,c', 'y']])
  })

  it('處理引號內的換行與跳脫雙引號', () => {
    expect(parseCSV('"line1\nline2","he said ""hi"""')).toEqual([
      ['line1\nline2', 'he said "hi"'],
    ])
  })

  it('處理 CRLF 與尾端空行', () => {
    expect(parseCSV('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('保留中間空欄', () => {
    expect(parseCSV('a,,c')).toEqual([['a', '', 'c']])
  })
})
