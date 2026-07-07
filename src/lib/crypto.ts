// AES-GCM ＋ PBKDF2-SHA256 加解密。所有資料上雲前必須經過這裡。
//
// Envelope 格式（JSON）：
//   { v:1, alg:'AES-GCM', kdf:'PBKDF2-SHA256', iter:310000, salt, iv, data }
//   salt/iv/data 皆為 base64 字串。
//
// 錯誤訊息絕不夾帶 passphrase 原文。

const PBKDF2_ITER = 310_000
const SALT_BYTES = 16
const IV_BYTES = 12
const KEY_BITS = 256

interface Envelope {
  v: 1
  alg: 'AES-GCM'
  kdf: 'PBKDF2-SHA256'
  iter: number
  salt: string
  iv: string
  data: string
}

// 明確產出 Uint8Array<ArrayBuffer>（非 SharedArrayBuffer），對齊 crypto.subtle 型別要求。
function newBytes(n: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new ArrayBuffer(n))
}

function b64encode(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

function b64decode(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s)
  const out = newBytes(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function utf8(s: string): Uint8Array<ArrayBuffer> {
  const src = new TextEncoder().encode(s)
  const out = newBytes(src.length)
  out.set(src)
  return out
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iter: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    utf8(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter },
    material,
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptText(plain: string, passphrase: string): Promise<string> {
  const salt = newBytes(SALT_BYTES)
  crypto.getRandomValues(salt)
  const iv = newBytes(IV_BYTES)
  crypto.getRandomValues(iv)
  const key = await deriveKey(passphrase, salt, PBKDF2_ITER)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, utf8(plain))
  const envelope: Envelope = {
    v: 1,
    alg: 'AES-GCM',
    kdf: 'PBKDF2-SHA256',
    iter: PBKDF2_ITER,
    salt: b64encode(salt),
    iv: b64encode(iv),
    data: b64encode(new Uint8Array(cipher)),
  }
  return JSON.stringify(envelope)
}

export async function decryptText(payload: string, passphrase: string): Promise<string> {
  let env: Envelope
  try {
    env = JSON.parse(payload) as Envelope
  } catch {
    throw new Error('備份格式錯誤（非 JSON）')
  }
  if (env.v !== 1 || env.alg !== 'AES-GCM' || env.kdf !== 'PBKDF2-SHA256') {
    throw new Error('備份格式錯誤或版本不相容')
  }
  if (typeof env.iter !== 'number' || env.iter < 1000 || env.iter > 10_000_000) {
    throw new Error('備份格式錯誤（iter 異常）')
  }
  const salt = b64decode(env.salt)
  const iv = b64decode(env.iv)
  const data = b64decode(env.data)
  const key = await deriveKey(passphrase, salt, env.iter)
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return new TextDecoder().decode(plain)
  } catch {
    throw new Error('密語錯誤或資料損毀')
  }
}
