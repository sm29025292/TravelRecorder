import { useState, useEffect } from 'react'
import { db } from '../db/db'
import { exportAll, parseBackup, importAll } from '../lib/backup'
import { encryptText, decryptText } from '../lib/crypto'
import { GistBackend, createGist } from '../lib/sync'

const LS = {
  token: 'tr.sync.token',
  gistId: 'tr.sync.gistId',
  remember: 'tr.sync.rememberPassphrase',
  passphrase: 'tr.sync.passphrase',
}

const inputCls =
  'w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

interface Props {
  onClose: () => void
  setMsg: (t: string) => void
}

export default function SyncDialog({ onClose, setMsg }: Props) {
  const [token, setToken] = useState('')
  const [gistId, setGistId] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [remember, setRemember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    setToken(localStorage.getItem(LS.token) ?? '')
    setGistId(localStorage.getItem(LS.gistId) ?? '')
    const r = localStorage.getItem(LS.remember) === '1'
    setRemember(r)
    if (r) setPassphrase(localStorage.getItem(LS.passphrase) ?? '')
  }, [])

  function persistToken(v: string) {
    setToken(v)
    if (v) localStorage.setItem(LS.token, v)
    else localStorage.removeItem(LS.token)
  }
  function persistGistId(v: string) {
    setGistId(v)
    if (v) localStorage.setItem(LS.gistId, v)
    else localStorage.removeItem(LS.gistId)
  }
  function persistPassphrase(v: string) {
    setPassphrase(v)
    if (remember) {
      if (v) localStorage.setItem(LS.passphrase, v)
      else localStorage.removeItem(LS.passphrase)
    }
  }
  function toggleRemember(v: boolean) {
    setRemember(v)
    localStorage.setItem(LS.remember, v ? '1' : '0')
    if (v && passphrase) localStorage.setItem(LS.passphrase, passphrase)
    if (!v) localStorage.removeItem(LS.passphrase)
  }

  function require(condition: boolean, message: string): boolean {
    if (!condition) {
      setErr(message)
      return false
    }
    return true
  }

  async function handleCreateGist() {
    setErr('')
    if (!require(!!token, '請先輸入 GitHub token')) return
    setBusy(true)
    try {
      const id = await createGist(token)
      persistGistId(id)
      setMsg('已建立新 Gist：' + id.slice(0, 8) + '…')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleUpload() {
    setErr('')
    if (!require(!!token, '請先輸入 GitHub token')) return
    if (!require(!!gistId, '請先輸入 Gist ID 或建立新 Gist')) return
    if (!require(!!passphrase, '請輸入密語（加密用）')) return
    setBusy(true)
    try {
      const data = await exportAll()
      const cipher = await encryptText(JSON.stringify(data), passphrase)
      await new GistBackend(token, gistId).write(cipher)
      setMsg('已上傳加密備份 ' + new Date().toLocaleTimeString())
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDownload() {
    setErr('')
    if (!require(!!token, '請先輸入 GitHub token')) return
    if (!require(!!gistId, '請先輸入 Gist ID')) return
    if (!require(!!passphrase, '請輸入密語（解密用）')) return
    setBusy(true)
    try {
      const snap = await new GistBackend(token, gistId).read()
      if (!snap) {
        setErr('Gist 上尚無備份檔')
        return
      }
      const plain = await decryptText(snap.content, passphrase)
      const data = parseBackup(plain)
      const localTrips = await db.trips.toArray()
      const localMax = localTrips.reduce((m, t) => Math.max(m, t.updatedAt ?? 0), 0)
      const localStr = localMax ? new Date(localMax).toLocaleString() : '（本機無資料）'
      const cloudStr = data.exportedAt || snap.updatedAt || '（未知）'
      if (
        confirm(
          `雲端匯出時間：${cloudStr}\n本機最後更新：${localStr}\n\n要以「合併」方式下載嗎？\n合併＝保留本機資料、同 id 以雲端為準；本機已刪除但雲端仍有的資料會被加回。\n（按「取消」改問是否「取代」）`,
        )
      ) {
        await importAll(data, 'merge')
        setMsg('已從雲端還原備份（合併）')
        return
      }
      if (
        confirm(
          `雲端匯出時間：${cloudStr}\n本機最後更新：${localStr}\n\n改以「取代」下載？將清空本機所有資料、完全以雲端內容取代。`,
        )
      ) {
        await importAll(data, 'replace')
        setMsg('已從雲端還原備份（取代）')
        return
      }
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">同步（加密）</h2>
          <span className="text-xs text-gray-500">加密後上傳到你自己的私人 GitHub Gist</span>
          <button
            onClick={onClose}
            className="ml-auto rounded border px-2 py-1 text-xs hover:bg-gray-50"
          >
            關閉
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <label className="block">
            <div className="mb-1 text-xs text-gray-600">GitHub Token（fine-grained PAT，只需 gist 權限）</div>
            <input
              type="password"
              value={token}
              onChange={(e) => persistToken(e.target.value)}
              placeholder="ghp_… 或 github_pat_…"
              className={inputCls}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center gap-2 text-xs text-gray-600">
              <span>Gist ID</span>
              <button
                type="button"
                onClick={handleCreateGist}
                disabled={busy || !token}
                className="rounded border px-2 py-0.5 text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                建立新 Gist
              </button>
            </div>
            <input
              type="text"
              value={gistId}
              onChange={(e) => persistGistId(e.target.value)}
              placeholder="Gist 網址的最後一段亂數字串"
              className={inputCls}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs text-gray-600">密語（僅用於本地加/解密，絕不上傳）</div>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => persistPassphrase(e.target.value)}
              placeholder="請設定一組強密語並自行記住"
              className={inputCls}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => toggleRemember(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              記住密語（此裝置）
              <span className="ml-1 text-gray-400">
                — 會以明文存進本機瀏覽器 localStorage，勿在共用機器勾選。
              </span>
            </span>
          </label>
        </div>

        {err && (
          <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleUpload}
            disabled={busy}
            className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            上傳（加密→Gist）
          </button>
          <button
            onClick={handleDownload}
            disabled={busy}
            className="rounded border border-sky-600 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-50"
          >
            下載（Gist→取代本機）
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          資料一律在瀏覽器內先以 AES-GCM＋PBKDF2 加密再上傳；Gist 保持 private。
          忘記密語＝雲端備份無法還原，請自行妥善保管。
        </p>
      </div>
    </div>
  )
}
