import { useEffect, useState, type ReactNode } from 'react'
import { getSessionByCode } from './lib/db'
import { isFirebaseConfigured } from './lib/firebase'
import {
  getStoredSessionCode,
  readCodeFromUrl,
  setStoredSessionCode,
} from './lib/sessionCode'

export function SessionGate({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(() => readCodeFromUrl() ?? getStoredSessionCode())
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const fromUrl = readCodeFromUrl()
    if (fromUrl) {
      setStoredSessionCode(fromUrl)
      setCode(fromUrl)
    }
  }, [])

  async function join(nextCode: string) {
    const normalized = nextCode.trim().toUpperCase()
    if (!normalized) {
      setError('활동 코드를 입력해 주세요.')
      return
    }

    if (!isFirebaseConfigured) {
      setStoredSessionCode(normalized)
      setCode(normalized)
      setError('')
      return
    }

    setChecking(true)
    setError('')
    try {
      const session = await getSessionByCode(normalized)
      if (!session) {
        setError('코드를 찾을 수 없습니다. 관리자에게 다시 확인해 주세요.')
        return
      }
      setStoredSessionCode(session.code)
      setCode(session.code)
    } catch {
      setError('활동 코드 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setChecking(false)
    }
  }

  if (code) return <>{children}</>

  return (
    <div className="classroom-game min-h-dvh">
      <div className="classroom-sheet flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border-[3px] border-[#0b3a66] bg-white p-6 shadow-[4px_4px_0_#0b3a66]">
          <h1 className="text-center font-[family-name:var(--font-cg)] text-2xl text-[#0b3a66]">
            활동 참여하기
          </h1>
          <p className="mt-2 text-center text-sm text-[#5a6f82]">
            관리자가 안내한 <strong>6자리 활동 코드</strong>를 입력하세요.
          </p>

          {!isFirebaseConfigured ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              Firebase가 아직 설정되지 않았습니다. 제출·관리 기능을 쓰려면 Vercel 환경변수에
              Firebase 설정을 추가해 주세요.
            </p>
          ) : null}

          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              void join(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="예: ABC123"
              maxLength={8}
              className="cg-input w-full text-center text-lg tracking-[0.2em]"
              autoComplete="off"
            />
            {error ? <p className="text-center text-sm text-[#c43c3c]">{error}</p> : null}
            <button type="submit" disabled={checking} className="cg-btn cg-btn-primary w-full">
              {checking ? '확인 중…' : '참여하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function useSessionCode(): string | null {
  return getStoredSessionCode()
}
