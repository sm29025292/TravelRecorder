#!/usr/bin/env node
// 離線解析 Google 地圖網址（不連網、不呼叫任何地理編碼服務）。
// 用法：node parse-maps-url.mjs <url> [<url> ...]   → 每個網址輸出一行 JSON。
//
// kind（網址型態，依設計文件三種情況）：
//   short          maps.app.goo.gl / goo.gl/maps 短網址：本身沒有資訊，需先展開成長網址
//   long-coords    含座標的長網址（地圖載入完／短網址展開後）：可完整解析名稱＋座標
//   long-no-coords 長網址但沒有座標（例：手機 App 剛轉址、名稱與英文地址黏在一起）
//   invalid        不是 Google 地圖網址
//
// 座標優先取 data 參數的 !3d<lat>!4d<lng>（地點本身），沒有才用 @lat,lng（地圖視窗中心，
// 縮放小時可能偏離地點數百公里，coordSource 會標 'viewport'）。

const RARE = /[\u{20000}-\u{3FFFF}]/u // CJK 擴充 B 以後的罕見字（例：サムハラ神社的「𢲡抬𢲡撸」）

export function parseMapsUrl(raw) {
  const out = {
    input: raw,
    kind: 'invalid',
    name: '',
    addressHint: '',
    countryHint: '',
    nameMayIncludeAddress: false,
    lat: null,
    lng: null,
    coordSource: '',
    placeId: '',
    entityId: '',
    rareChars: false,
  }
  let u
  try {
    u = new URL(raw.trim())
  } catch {
    return out
  }
  const host = u.hostname.toLowerCase()
  if (host === 'maps.app.goo.gl' || (host === 'goo.gl' && u.pathname.startsWith('/maps'))) {
    return { ...out, kind: 'short' }
  }
  const isMaps =
    /(^|\.)google\.[a-z.]+$/.test(host) && (u.pathname.startsWith('/maps') || host.startsWith('maps.'))
  if (!isMaps) return out

  const dec = (s) => {
    try {
      return decodeURIComponent(s.replace(/\+/g, ' ')).trim()
    } catch {
      return s.trim()
    }
  }
  const full = dec(raw)

  // /maps/place/<名稱>[/...]
  const place = u.pathname.match(/\/maps\/place\/([^/]+)/)
  if (place) {
    const seg = dec(place[1])
    // 手機 App 版：「名稱＋英文地址, 城市, 都道府縣 郵遞區號＋國家」黏在一起，名稱與地址之間可能沒有空格
    //   例：「箱島神社86 Nijohamakubo, Itoshima, Fukuoka 819-1614日本」
    //       「新宿諏訪神社 1 Chome-12-6 Takadanobaba, Shinjuku City, Tokyo 169-0075, Japan」
    // 地址起點＝第一個「數字（可含 -）＋空白＋英文字」且後面還有逗號的位置；名稱需非空且不以數字結尾。
    const m = seg.match(/^(.*?[^\s\d])\s*(\d[\d-]*\s+[A-Za-z].*,.*)$/)
    if (m) {
      out.name = m[1].trim()
      let addr = m[2].trim()
      // 結尾國家：黏在郵遞區號後的非 ASCII 國名（「…819-1614日本」）或最後一段英文（「…, Japan」）
      const cjk = addr.match(/^(.*?\d)\s*([^\x00-\x7F]+)$/)
      if (cjk) {
        addr = cjk[1].trim()
        out.countryHint = cjk[2].trim()
      } else {
        const parts = addr.split(',')
        const last = parts[parts.length - 1].trim()
        if (parts.length > 2 && /^[A-Za-z .]+$/.test(last)) {
          out.countryHint = last
          addr = parts.slice(0, -1).join(',').trim()
        }
      }
      out.addressHint = addr
    } else {
      out.name = seg
      // 含逗號卻切不出地址：名稱裡可能夾著地址，交給人工確認
      if (/,/.test(seg)) out.nameMayIncludeAddress = true
    }
  }
  const q = u.searchParams.get('q') || u.searchParams.get('query') || ''
  const qCoord = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
  if (q && !qCoord && !out.name) out.name = q.trim()

  const d34 = full.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  const at = u.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (d34) {
    out.lat = Number(d34[1])
    out.lng = Number(d34[2])
    out.coordSource = 'place'
  } else if (qCoord) {
    out.lat = Number(qCoord[1])
    out.lng = Number(qCoord[2])
    out.coordSource = 'query'
  } else if (at) {
    out.lat = Number(at[1])
    out.lng = Number(at[2])
    out.coordSource = 'viewport'
  }

  const pid = u.searchParams.get('query_place_id') || (full.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i) || [])[1]
  if (pid) out.placeId = pid
  const ent = full.match(/!16s(\/g\/[\w-]+|\/m\/[\w-]+)/)
  if (ent) out.entityId = ent[1]

  out.rareChars = RARE.test(out.name)
  out.kind = out.lat !== null ? 'long-coords' : 'long-no-coords'
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
