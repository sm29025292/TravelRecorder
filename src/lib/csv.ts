/**
 * 解析 CSV 文字為二維字串陣列，符合 RFC4180：
 *  - 逗號分隔、換行分列
 *  - 欄位可用雙引號包住，內含逗號 / 換行 / 雙引號（"" 代表一個 "）
 *  - 支援 CRLF 與 LF，並去除 UTF-8 BOM
 */
export function parseCSV(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const n = text.length

  const endField = () => {
    row.push(field)
    field = ''
  }
  const endRow = () => {
    endField()
    rows.push(row)
    row = []
  }

  while (i < n) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
    } else if (c === ',') {
      endField()
      i++
    } else if (c === '\n') {
      endRow()
      i++
    } else if (c === '\r') {
      endRow()
      i += text[i + 1] === '\n' ? 2 : 1
    } else {
      field += c
      i++
    }
  }
  endRow()

  // 移除檔尾換行造成的單一空列
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}
