import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatWon } from './data'
import { createSession, listSubmissions, verifySessionAdmin } from './lib/db'
import { isFirebaseConfigured } from './lib/firebase'
import type { ClassroomSession, Submission } from './types'

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
  const [params] = useSearchParams()
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<ClassroomSession | null>(null)
  const [viewCode, setViewCode] = useState(params.get('code') ?? '')
  const [viewToken, setViewToken] = useState(params.get('token') ?? '')
  const [session, setSession] = useState<ClassroomSession | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const teacherLink =
    created && typeof window !== 'undefined'
      ? `${window.location.origin}/?code=${created.code}`
      : ''
  const adminLink =
    created && typeof window !== 'undefined'
      ? `${window.location.origin}/admin?code=${created.code}&token=${created.adminToken}`
      : ''

  useEffect(() => {
    if (params.get('code') && params.get('token')) {
      void loadSubmissions(params.get('code')!, params.get('token')!)
    }
  }, [params])

  async function loadSubmissions(code: string, token: string) {
    if (!isFirebaseConfigured) {
      setError('Firebase가 설정되지 않았습니다.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const found = await verifySessionAdmin(code, token)
      if (!found) {
        setError('활동 코드 또는 관리 토큰이 올바르지 않습니다.')
        setSession(null)
        setSubmissions([])
        return
      }
      setSession(found)
      setSubmissions(await listSubmissions(found.id))
    } catch {
      setError('제출 목록을 불러오지 못했습니다.')
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const next = await createSession(title)
      setCreated(next)
      setSession(next)
      setSubmissions([])
      setViewCode(next.code)
      setViewToken(next.adminToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : '활동 생성에 실패했습니다.')
    } finally {
      setCreating(false)
    }
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
              Firebase 환경변수(<code>VITE_FIREBASE_*</code>)를 Vercel에 설정해야 제출·관리 기능이
              동작합니다.
            </div>
          ) : null}

          {!authed && !session ? (
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
                <button type="submit" className="cg-btn cg-btn-primary w-full sm:w-auto">
                  로그인
                </button>
              </form>
            </section>
          ) : null}

          {(authed || session) && !session ? (
            <section className="rounded-2xl border-[3px] border-[#0b3a66] bg-white p-5 shadow-[4px_4px_0_#0b3a66]">
              <h2 className="font-[family-name:var(--font-cg)] text-xl text-[#0b3a66]">
                새 활동 만들기
              </h2>
              <form className="mt-4 space-y-3" onSubmit={(e) => void handleCreate(e)}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="cg-input w-full"
                  placeholder="예: 3학년 교사 연수"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="cg-btn cg-btn-primary w-full sm:w-auto"
                >
                  {creating ? '생성 중…' : '활동 코드 발급'}
                </button>
              </form>
            </section>
          ) : null}

          {created ? (
            <section className="rounded-2xl border-[3px] border-[#2e7d46] bg-[#f1f8f4] p-5">
              <h2 className="font-[family-name:var(--font-cg)] text-xl text-[#2e7d46]">
                활동이 생성되었습니다
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-bold text-[#0b3a66]">교사 참여 코드</dt>
                  <dd className="mt-1 font-[family-name:var(--font-cg)] text-3xl tracking-widest text-[#0b3a66]">
                    {created.code}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-[#0b3a66]">교사 참여 링크</dt>
                  <dd className="mt-1 break-all rounded-lg bg-white px-3 py-2 text-xs">{teacherLink}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[#0b3a66]">관리자 보기 링크</dt>
                  <dd className="mt-1 break-all rounded-lg bg-white px-3 py-2 text-xs">{adminLink}</dd>
                </div>
              </dl>
            </section>
          ) : null}

          <section className="rounded-2xl border-[3px] border-[#0b3a66] bg-white p-5 shadow-[4px_4px_0_#0b3a66]">
            <h2 className="font-[family-name:var(--font-cg)] text-xl text-[#0b3a66]">제출 목록</h2>
            <form
              className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault()
                void loadSubmissions(viewCode, viewToken)
              }}
            >
              <input
                value={viewCode}
                onChange={(e) => setViewCode(e.target.value.toUpperCase())}
                className="cg-input w-full"
                placeholder="활동 코드"
              />
              <input
                value={viewToken}
                onChange={(e) => setViewToken(e.target.value.toUpperCase())}
                className="cg-input w-full"
                placeholder="관리 토큰"
              />
              <button type="submit" disabled={loading} className="cg-btn cg-btn-primary">
                {loading ? '불러오는 중…' : '조회'}
              </button>
            </form>

            {session ? (
              <p className="mt-4 text-sm text-[#5a6f82]">
                <strong className="text-[#0b3a66]">{session.title}</strong> · 코드 {session.code} ·
                제출 {submissions.length}건
              </p>
            ) : null}

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
            ) : session && !loading ? (
              <p className="mt-4 text-sm text-[#5a6f82]">아직 제출된 결과가 없습니다.</p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
