import { describe, it, expect } from 'vitest'
import { encryptText, decryptText } from './crypto'

describe('crypto envelope', () => {
  it('正確密語 roundtrip 還原原文（含中文與 emoji）', async () => {
    const plain = '護照號碼 A123456 · 旅程備註 ✈️🍜'
    const enc = await encryptText(plain, 'correct horse battery staple')
    const dec = await decryptText(enc, 'correct horse battery staple')
    expect(dec).toBe(plain)
  })

  it('錯誤密語丟出「密語錯誤或資料損毀」', async () => {
    const enc = await encryptText('secret payload', 'right')
    await expect(decryptText(enc, 'wrong')).rejects.toThrow(/密語錯誤/)
  })

  it('兩次加密相同明文/密語，salt 與 iv 皆不同（隨機）', async () => {
    const enc1 = JSON.parse(await encryptText('hello', 'pw'))
    const enc2 = JSON.parse(await encryptText('hello', 'pw'))
    expect(enc1.salt).not.toBe(enc2.salt)
    expect(enc1.iv).not.toBe(enc2.iv)
    // 資料也應不同（因為 iv 不同，AES-GCM 密文自然不同）
    expect(enc1.data).not.toBe(enc2.data)
  })

  it('envelope 是可 parse 的 JSON 且欄位符合規格', async () => {
    const enc = await encryptText('x', 'pw')
    const env = JSON.parse(enc)
    expect(env.v).toBe(1)
    expect(env.alg).toBe('AES-GCM')
    expect(env.kdf).toBe('PBKDF2-SHA256')
    expect(env.iter).toBe(310000)
    expect(typeof env.salt).toBe('string')
    expect(typeof env.iv).toBe('string')
    expect(typeof env.data).toBe('string')
  })

  it('壞掉的 JSON 丟出格式錯誤', async () => {
    await expect(decryptText('not json', 'pw')).rejects.toThrow(/格式錯誤/)
  })
})
