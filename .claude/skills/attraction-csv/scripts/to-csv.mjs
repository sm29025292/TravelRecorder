#!/usr/bin/env node
// 把整理好的景點 JSON 陣列轉成 TravelRecorder 景點庫可匯入的標準 CSV（T49 格式）。
// 用法：node to-csv.mjs <input.json> <output.csv>
// JSON 每筆欄位：country, city, district, type, name, address, url, urlLabel?, notes, priority
//   type：景點／美食／住宿／交通（或 attraction/food/lodging/transport，輸出統一為中文）
//   url：原始 Google 地圖網址；輸出成 [urlLabel](url)，urlLabel 預設「Google Map」
//   priority：0–3（0＝未設）
// 輸出 UTF-8 含 BOM（Excel 開啟中文不亂碼；App 匯入會自動去除 BOM）。驗證失敗時列出問題並 exit 1。
import { readFileSync, writeFileSync } from 'node:fs'

export const HEADER = ['國家', '地點', '區域', '類型', '景點', '地址', '網址', '備註', '優先度']
const TYPES = { attraction: '景點', food: '美食', lodging: '住宿', transport: '交通' }
const LABELS = new Set(Object.values(TYPES))

export function normType(t) {
  const s = String(t ?? '').trim()
  if (!s) return ''
  if (LABELS.has(s)) return s
  return TYPES[s.toLowerCase()] ?? null
}

const esc = (v) => {
  const s = String(v ?? '').replace(/\r?\n/g, ' ').trim()
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(items) {
  const errors = []
  const lines = [HEADER.join(',')]
  items.forEach((it, i) => {
    const tag = `第 ${i + 1} 筆（${it.name || '未命名'}）`
    if (!String(it.name ?? '').trim()) errors.push(`${tag}：缺景點名稱`)
    if (!String(it.country ?? '').trim()) errors.push(`${tag}：缺國家`)
    if (!String(it.city ?? '').trim()) errors.push(`${tag}：缺都市`)
    const type = normType(it.type)
    if (type === null) errors.push(`${tag}：類型「${it.type}」不是 景點／美食／住宿／交通`)
    const p = it.priority === undefined || it.priority === '' ? 0 : Number(it.priority)
    if (!Number.isInteger(p) || p < 0 || p > 3) errors.push(`${tag}：優先度需為 0–3 整數`)
    const url = String(it.url ?? '').trim()
    const label = String(it.urlLabel ?? 'Google Map').trim()
    const link = !url ? '' : /^\[.*\]\(.*\)$/.test(url) || !label ? url : `[${label}](${url})`
    lines.push(
      [it.country, it.city, it.district, type ?? '', it.name, it.address, link, it.notes, p || '']
        .map(esc)
        .join(','),
    )
  })
  return { csv: '﻿' + lines.join('\r\n') + '\r\n', errors }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, output] = process.argv.slice(2)
  if (!input || !output) {
    console.error('用法：node to-csv.mjs <input.json> <output.csv>')
    process.exit(1)
  }
  const items = JSON.parse(readFileSync(input, 'utf8'))
  if (!Array.isArray(items)) {
    console.error('輸入需為 JSON 陣列')
    process.exit(1)
  }
  const { csv, errors } = toCsv(items)
  if (errors.length) {
    console.error('驗證失敗：\n' + errors.map((e) => '- ' + e).join('\n'))
    process.exit(1)
  }
  writeFileSync(output, csv)
  console.log(`已輸出 ${items.length} 筆 → ${output}`)
}
