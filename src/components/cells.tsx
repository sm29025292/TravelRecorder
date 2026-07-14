import { useEffect, useState, type ReactNode } from 'react'
import { normalizeTimeText } from '../lib/itinerary'

const base =
  'w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

// 所有輸入採「聚焦時不被外部值覆寫」的緩衝策略：
// 因為資料寫入 IndexedDB 後會透過 useLiveQuery 回流，若直接受控可能造成游標跳動／字被吃掉。
type TextLikeProps = {
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'date' | 'time'
  placeholder?: string
  className?: string
  list?: string
  // commitOnBlur：輸入過程只更新內部 state，離開欄位（blur）才呼叫父層 onChange。
  // 用於 TimeInput／DateInput：避免每擊鍵就寫入 DB → useLiveQuery 回流重排 → 輸入框失焦吃字。
  commitOnBlur?: boolean
  // normalize：commitOnBlur 模式下 blur 時先呼叫；回 null 代表無法解析、恢復原值不寫回；
  // 回字串代表正規化後的合法值。
  normalize?: (raw: string) => string | null
  inputMode?: 'numeric'
}

function TextLike({
  value,
  onChange,
  type = 'text',
  placeholder,
  className = '',
  list,
  commitOnBlur = false,
  normalize,
  inputMode,
}: TextLikeProps) {
  const [text, setText] = useState(value)
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (!focused) setText(value)
  }, [value, focused])
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`${base} ${className}`}
      value={text}
      list={list}
      inputMode={inputMode}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        if (!commitOnBlur) return
        if (normalize) {
          const out = normalize(text)
          if (out === null) {
            setText(value)
            return
          }
          setText(out)
          if (out !== value) onChange(out)
        } else if (text !== value) {
          onChange(text)
        }
      }}
      onChange={(e) => {
        setText(e.target.value)
        if (!commitOnBlur) onChange(e.target.value)
      }}
    />
  )
}

export function TextInput(p: Omit<TextLikeProps, 'type'>) {
  return <TextLike {...p} type="text" />
}
export function DateInput(p: Omit<TextLikeProps, 'type' | 'commitOnBlur' | 'normalize' | 'inputMode'>) {
  return <TextLike {...p} type="date" commitOnBlur />
}
export function TimeInput(
  p: Omit<TextLikeProps, 'type' | 'commitOnBlur' | 'normalize' | 'inputMode' | 'placeholder'>,
) {
  return (
    <TextLike
      {...p}
      type="text"
      inputMode="numeric"
      placeholder="HH:MM"
      commitOnBlur
      normalize={normalizeTimeText}
    />
  )
}

type NumberProps = {
  value: number
  onChange: (n: number) => void
  className?: string
  step?: string | number
  placeholder?: string
}

/** 數字輸入：值為 0 時顯示空白讓表格清爽；可正常輸入小數（如 0.21）。 */
export function NumberInput({ value, onChange, className = '', step, placeholder }: NumberProps) {
  const toText = (v: number) => (v === 0 || !Number.isFinite(v) ? '' : String(v))
  const [text, setText] = useState(() => toText(value))
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (!focused) setText(toText(value))
  }, [value, focused])
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      placeholder={placeholder}
      className={`${base} text-right ${className}`}
      value={text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const t = e.target.value
        setText(t)
        onChange(t === '' ? 0 : Number(t))
      }}
    />
  )
}

type SelectProps = {
  value: string
  onChange: (v: string) => void
  className?: string
  children: ReactNode
}
export function Select({ value, onChange, className = '', children }: SelectProps) {
  return (
    <select
      className={`${base} ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  )
}

export function IconButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded px-2 py-1 text-sm text-gray-400 hover:bg-red-50 hover:text-red-600"
    >
      {children}
    </button>
  )
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <th className={`px-2 py-2 font-medium ${className}`}>{children}</th>
}
export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`px-1.5 py-1 align-top ${className}`}>{children}</td>
}
