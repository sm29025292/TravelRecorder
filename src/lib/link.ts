export type ParsedLink = { text: string; url: string }

/**
 * 解析連結欄字串。`[名稱](網址)` → { text: 名稱, url: 網址 }；
 * 其餘非空字串整串視為網址（text 為 ''）；空／全空白 → 兩者皆 ''。
 * 錨定頭尾的貪婪正則可正確處理名稱含 `]`、網址含 `()`（如維基百科的 `Osaka_(city)`）。
 * `[名稱]()`（網址空）不視為合法格式，整串當網址處理。
 */
export function parseLink(raw: string): ParsedLink {
  const s = (raw ?? '').trim()
  if (!s) return { text: '', url: '' }
  const m = /^\[(.*)\]\((.*)\)$/.exec(s)
  if (m && m[2].trim()) return { text: m[1].trim(), url: m[2].trim() }
  return { text: '', url: s }
}

/**
 * 組回儲存字串。網址空 → ''（名稱單獨存在無意義，等同清空；純文字備忘請用備註欄——已拍板）；
 * 名稱空 → 存裸網址；兩者皆有 → `[名稱](網址)`。
 */
export function serializeLink(text: string, url: string): string {
  const t = text.trim()
  const u = url.trim()
  if (!u) return ''
  if (!t) return u
  return `[${t}](${u})`
}

/** 顯示文字：有名稱用名稱，否則完整網址；空字串回 ''。 */
export function linkDisplayText(raw: string): string {
  const p = parseLink(raw)
  return p.text || p.url
}
