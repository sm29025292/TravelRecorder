import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { parseLink, serializeLink } from '../lib/link'

const POPOVER_WIDTH = 256 // w-64

/**
 * 連結欄位：顯示狀態＝可點超連結（有名稱顯名稱、無名稱顯完整網址）＋ ✎；
 * 點 ✎ 開 popover 編輯「名稱」「連結」。value 為單一字串（`[名稱](網址)`、裸網址或 ''）。
 * popover 內用原生 input＋local state，按「儲存」才 onChange 寫回。
 * popover 用 `createPortal` 掛到 `document.body`、以 `position: fixed` 定位（座標取自按鈕
 * `getBoundingClientRect()`）——景點庫每個國家節點容器有 `overflow-hidden`（給摺疊圓角用），
 * 若 popover 仍在該容器內以 `absolute` 定位，往下展開的內容會被裁掉（螢幕截圖回報的 bug）；
 * portal 到 body 後完全不受任何祖先 `overflow` 影響。
 */
export default function LinkField({
  value,
  onChange,
}: {
  value: string
  onChange: (raw: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (wrapRef.current?.contains(target)) return
      if (popRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // 編輯中若捲動（含表格內層 overflow-x-auto）或視窗縮放，fixed 定位會跟丟錨點，直接關閉。
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  function openEditor() {
    const p = parseLink(value)
    setText(p.text)
    setUrl(p.url)
    const rect = wrapRef.current?.getBoundingClientRect()
    if (rect) {
      const margin = 8
      let left = rect.right - POPOVER_WIDTH
      left = Math.max(margin, Math.min(left, window.innerWidth - POPOVER_WIDTH - margin))
      setPos({ top: rect.bottom + 4, left })
    }
    setOpen(true)
  }
  function save() {
    onChange(serializeLink(text, url))
    setOpen(false)
  }

  const p = parseLink(value)
  const inputCls =
    'w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
  return (
    <div className="relative flex min-w-0 items-center gap-1" ref={wrapRef}>
      {p.url && (
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="truncate text-sky-600 underline decoration-sky-300 underline-offset-2 hover:text-sky-800"
        >
          {p.text || p.url}
        </a>
      )}
      <button
        type="button"
        title={p.url ? '編輯連結' : '新增連結'}
        onClick={(e) => {
          e.stopPropagation()
          if (open) setOpen(false)
          else openEditor()
        }}
        className="shrink-0 rounded px-1.5 py-1 text-xs text-gray-400 hover:bg-sky-50 hover:text-sky-700"
      >
        ✎
      </button>
      {open &&
        createPortal(
          <div
            ref={popRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
            className="z-50 space-y-2 rounded border bg-white p-2 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="flex items-center gap-2 text-sm">
              <span className="w-8 shrink-0 text-xs text-gray-500">名稱</span>
              <input
                className={inputCls}
                value={text}
                placeholder="例如：官網（可留空）"
                autoFocus
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="w-8 shrink-0 text-xs text-gray-500">連結</span>
              <input
                className={inputCls}
                value={url}
                placeholder="https://"
                inputMode="url"
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
              />
            </label>
            <p className="text-xs text-gray-400">
              名稱留空＝顯示完整網址；連結留空＝儲存時清除此欄。
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border px-2.5 py-1 text-xs hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-700"
              >
                儲存
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
