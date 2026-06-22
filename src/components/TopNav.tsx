import { Link, useLocation } from 'react-router-dom'
import { useRef, useState } from 'react'
import { exportAll, downloadBackup, parseBackup, importAll } from '../lib/backup'

export default function TopNav() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const { pathname } = useLocation()

  async function handleExport() {
    downloadBackup(await exportAll())
    flash('已匯出備份')
  }

  async function handleImportFile(file: File) {
    try {
      const data = parseBackup(await file.text())
      if (!confirm('匯入會以備份檔內容「取代」目前所有資料，確定繼續？')) return
      await importAll(data, 'replace')
      flash('匯入完成')
    } catch (e) {
      alert('匯入失敗：' + (e as Error).message)
    }
  }

  function flash(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 2500)
  }

  const linkCls = (active: boolean) =>
    `px-3 py-1.5 rounded text-sm font-medium ${
      active ? 'bg-sky-600 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
        <Link to="/" className="mr-2 text-lg font-bold text-sky-700">
          ✈️ 旅遊記錄
        </Link>
        <nav className="flex gap-1">
          <Link to="/" className={linkCls(pathname === '/' || pathname.startsWith('/trip'))}>
            旅程
          </Link>
          <Link to="/attractions" className={linkCls(pathname === '/attractions')}>
            景點庫
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          <button
            onClick={handleExport}
            className="rounded border px-2.5 py-1.5 text-sm hover:bg-gray-50"
          >
            匯出備份
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded border px-2.5 py-1.5 text-sm hover:bg-gray-50"
          >
            匯入
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>
    </header>
  )
}
