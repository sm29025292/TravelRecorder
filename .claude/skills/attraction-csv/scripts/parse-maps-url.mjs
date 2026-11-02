#!/usr/bin/env node
// 離線解析 Google 地圖「完整」網址，取出地點名稱、座標、place id 等線索（不連網）。
// 用法：node parse-maps-url.mjs <url> [<url> ...]   → 每個網址輸出一行 JSON。
// 短網址（maps.app.goo.gl / goo.gl/maps）無法離線解析，會回 { short: true }，需先展開。

export function parseMapsUrl(raw) {
  const out = { input: raw, short: false, name: '', lat: null, lng: null, placeId: '', query: '' }
  let u
  try {
    u = new URL(raw.trim())
  } catch {
    return { ...out, error: '不是合法網址' }
  }
  const host = u.hostname.toLowerCase()
  if (host === 'maps.app.goo.gl' || (host === 'goo.gl' && u.pathname.startsWith('/maps'))) {
    return { ...out, short: true }
  }
  const dec = (s) => decodeURIComponent(s.replace(/\+/g, ' ')).trim()
  // /maps/place/<名稱>/@lat,lng,zoom
  const place = u.pathname.match(/\/maps\/place\/([^/]+)/)
  if (place) out.name = dec(place[1])
  const at = u.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (at) {
    out.lat = Number(at[1])
    out.lng = Number(at[2])
  }
  // data=...!3d<lat>!4d<lng>（地點本身座標，比 @ 視窗中心準）
  const d34 = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (d34) {
    out.lat = Number(d34[1])
    out.lng = Number(d34[2])
  }
  const q = u.searchParams.get('q') || u.searchParams.get('query') || ''
  if (q) {
    out.query = q.trim()
    if (!out.name && !/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(out.query)) out.name = out.query
  }
  const pid = u.searchParams.get('query_place_id') || (raw.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i) || [])[1]
  if (pid) out.placeId = pid
  return out
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const urls = process.argv.slice(2)
  if (!urls.length) {
    console.error('用法：node parse-maps-url.mjs <url> [<url> ...]')
    process.exit(1)
  }
  for (const url of urls) console.log(JSON.stringify(parseMapsUrl(url)))
}
