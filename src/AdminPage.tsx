import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatWon } from './data'
import { listAllSubmissions } from './lib/db'
import { isFirebaseConfigured } from './lib/firebase'
import type { Submission } from './types'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authed) return
    void load()
  }, [authed])

  async function load() {
    if (!isFirebaseConfigured) {
      setError('Firebase가 설정되지 않았습니다.')
      return
    }
    setLoading(true)
    setError('')
    try {
      setSubmissions(await listAllSubmissions())
    } catch {
      setError('제출 목록을 불러오지 못했습니다. Firestore 규칙·인덱스를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  function login(e: React.FormEvent) {
    e.preventDefault()
    if (!ADMIN_PASSWORD) {
      setError('VITE_ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.')
      return
    }
    if (password !== ADMIN_PASSWORD) {
      setError('관리자 비밀번호가 올바르지 않습니다.')
      return
    }
    setAuthed(true)
    setError('')
  }

  return (
    <div className="classroom-game min-h-dvh">
      <div className="classroom-sheet px-3 py-6 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-[family-name:var(--font-cg)] text-2xl text-[#0b3a66] sm:text-3xl">
              관리자 대시보드
            </h1>
            <Link to="/" className="cg-nav-link text-sm">
              게임으로 →
            </Link>
          </div>

          {!isFirebaseConfigured ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Firebase 환경변수가 설정되지 않았습니다.
            </div>
          ) : null}

          {!authed ? (
            <section className="rounded-2xl border-[3px] border-[#0b3a66] bg-white p-5 shadow-[4px_4px_0_#0b3a66]">
              <h2 className="font-[family-name:var(--font-cg)] text-xl text-[#0b3a66]">
                관리자 로그인
              </h2>
              <form className="mt-4 space-y-3" onSubmit={login}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cg-input w-full"
                  placeholder="관리자 비밀번호"
                />
                {error ? <p className="text-sm text-[#c43c3c]">{error}</p> : null}
                <button type="submit" className="cg-btn cg-btn-primary w-full sm:w-auto">
                  로그인
                </button>
              </form>
            </section>
          ) : (
            <section className="rounded-2xl border-[3px] border-[#0b3a66] bg-white p-5 shadow-[4px_4px_0_#0b3a66]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-[family-name:var(--font-cg)] text-xl text-[#0b3a66]">
                  제출 목록 ({submissions.length})
                </h2>
                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={loading}
                  className="cg-btn cg-btn-ghost"
                >
                  {loading ? '불러오는 중…' : '새로고침'}
                </button>
              </div>

              {error ? <p className="mt-3 text-sm text-[#c43c3c]">{error}</p> : null}

              {submissions.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {submissions.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-dashed border-[#c5d6e4] bg-[#fafcff] p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-[family-name:var(--font-cg)] text-lg text-[#0b3a66]">
                          {item.teacherName}
                          {item.school ? (
                            <span className="ml-2 text-sm font-normal text-[#5a6f82]">
                              ({item.school})
                            </span>
                          ) : null}
                        </h3>
                        <time className="text-xs text-[#5a6f82]">{formatTime(item.createdAt)}</time>
                      </div>
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {item.choices.map((choice) => (
                          <li
                            key={choice.categoryId}
                            className="rounded-lg bg-white px-3 py-2 text-sm text-[#0b3a66]"
                          >
                            <span className="text-[11px] font-bold text-[#5a6f82]">
                              {choice.categoryLabel}
                            </span>
                            <p className="font-medium">
                              {choice.title}{' '}
                              <span className="text-[#5a6f82]">({choice.subtitle})</span>
                            </p>
                            <p className="text-xs text-[#2e7d46]">{formatWon(choice.cost)}</p>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : !loading ? (
                <p className="mt-4 text-sm text-[#5a6f82]">아직 제출된 결과가 없습니다.</p>
              ) : null}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
