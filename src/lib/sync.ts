// GitHub Gist 為後端的手動同步層。
// 呼叫者要保證 content 已加密（見 crypto.ts）。
// Token / gist id 在錯誤訊息中一律不出現。

const API_BASE = 'https://api.github.com'
const FILENAME = 'travel-recorder.enc.json'
const GIST_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
} as const

type Fetch = typeof fetch

export interface CloudSnapshot {
  content: string
  updatedAt: string
}

export interface SyncBackend {
  read(): Promise<CloudSnapshot | null>
  write(content: string): Promise<void>
}

function authHeaders(token: string): Record<string, string> {
  return { ...GIST_HEADERS, Authorization: `Bearer ${token}` }
}

interface GistFile {
  filename?: string
  content?: string
  truncated?: boolean
  raw_url?: string
}

interface GistResponse {
  updated_at?: string
  files?: Record<string, GistFile>
}

export class GistBackend implements SyncBackend {
  constructor(
    private readonly token: string,
    private readonly gistId: string,
    private readonly fetchImpl: Fetch = globalThis.fetch,
  ) {}

  async read(): Promise<CloudSnapshot | null> {
    const res = await this.fetchImpl(`${API_BASE}/gists/${this.gistId}`, {
      headers: authHeaders(this.token),
    })
    if (!res.ok) throw new Error(`讀取 Gist 失敗（HTTP ${res.status}）`)
    const body = (await res.json()) as GistResponse
    const file = body.files?.[FILENAME]
    if (!file) return null
    let content = file.content ?? ''
    if ((file.truncated || !file.content) && file.raw_url) {
      const raw = await this.fetchImpl(file.raw_url, { headers: authHeaders(this.token) })
      if (!raw.ok) throw new Error(`讀取 Gist 原檔失敗（HTTP ${raw.status}）`)
      content = await raw.text()
    }
    return { content, updatedAt: body.updated_at ?? '' }
  }

  async write(content: string): Promise<void> {
    const res = await this.fetchImpl(`${API_BASE}/gists/${this.gistId}`, {
      method: 'PATCH',
      headers: { ...authHeaders(this.token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: { [FILENAME]: { content } } }),
    })
    if (!res.ok) throw new Error(`寫入 Gist 失敗（HTTP ${res.status}）`)
  }
}

/** 建立新的**私人** gist，回傳 gist id。 */
export async function createGist(token: string, fetchImpl: Fetch = globalThis.fetch): Promise<string> {
  const res = await fetchImpl(`${API_BASE}/gists`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'TravelRecorder encrypted backup',
      public: false,
      files: { [FILENAME]: { content: '{}' } },
    }),
  })
  if (!res.ok) throw new Error(`建立 Gist 失敗（HTTP ${res.status}）`)
  const body = (await res.json()) as { id?: string }
  if (!body.id) throw new Error('建立 Gist 回應缺少 id')
  return body.id
}
