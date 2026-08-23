import { useState } from 'react'
import {
  CATEGORIES,
  COST_TIERS,
  REFLECTIONS,
  formatWon,
  type CategoryId,
  type Selections,
} from './data'
import { getStorageStatus, submitResult } from './lib/db'
import { isFirebaseConfigured } from './lib/firebase'

const TONE_BG: Record<string, string> = {
  green: '#2e7d46',
  amber: '#d97706',
  rose: '#db2777',
  violet: '#6d28d9',
}

export function ResultView({
  selections,
  sessionCode,
  onReplay,
}: {
  selections: Selections
  sessionCode: string | null
  onReplay: () => void
}) {
  const [teacherName, setTeacherName] = useState('')
  const [school, setSchool] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = isFirebaseConfigured && Boolean(sessionCode)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionCode) {
      setError('활동 코드가 없습니다. 처음 화면에서 코드를 입력해 주세요.')
      return
    }
    if (!teacherName.trim()) {
      setError('이름을 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await submitResult({
        sessionCode,
        teacherName,
        school,
        selections,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-cg-rise mx-auto max-w-[560px] space-y-6 px-1 pb-10">
      <header className="text-center">
        <div className="inline-block rounded-full bg-[#0b3a66] px-4 py-1 font-[family-name:var(--font-cg)] text-sm text-white">
          완료!
        </div>
        <h2 className="mt-3 font-[family-name:var(--font-cg)] text-3xl text-[#0b3a66] sm:text-4xl">
          내가 고른 <span className="text-[#2e7d46]">학급</span>
        </h2>
        <p className="mt-2 text-sm text-[#5a6f82]">100만원을 모두 사용해 구성한 나만의 교실입니다.</p>
      </header>

      <ul className="overflow-hidden rounded-2xl border-[3px] border-[#0b3a66] bg-white shadow-[4px_4px_0_#0b3a66]">
        {CATEGORIES.map((cat, i) => {
          const cost = selections[cat.id as CategoryId]!
          const optionIndex = cat.options.findIndex((o) => o.cost === cost)
          const option = cat.options[optionIndex]!
          const tone = COST_TIERS[optionIndex]!.tone
          return (
            <li
              key={cat.id}
              className={`flex items-center gap-3 px-4 py-3.5 sm:gap-4 ${
                i < CATEGORIES.length - 1 ? 'border-b border-dashed border-[#c5d6e4]' : ''
              }`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-cg)] text-sm text-white"
                style={{ background: TONE_BG[tone] }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[#5a6f82]">{cat.label}</p>
                <p className="font-[family-name:var(--font-cg)] text-lg leading-tight text-[#0b3a66]">
                  {option.title}{' '}
                  <span className="text-sm font-normal text-[#5a6f82]">({option.subtitle})</span>
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                style={{ background: TONE_BG[tone] }}
              >
                {formatWon(cost)}
              </span>
            </li>
          )
        })}
      </ul>

      <section className="rounded-2xl border-[3px] border-[#0b3a66] bg-white px-5 py-5 shadow-[4px_4px_0_#0b3a66]">
        <h3 className="font-[family-name:var(--font-cg)] text-xl text-[#0b3a66]">결과 제출</h3>
        {getStorageStatus() === 'missing' ? (
          <p className="mt-3 text-sm leading-relaxed text-[#5a6f82]">
            Firebase 설정이 없어 제출 기능을 사용할 수 없습니다. 관리자에게 문의해 주세요.
          </p>
        ) : submitted ? (
          <p className="mt-3 rounded-xl bg-[#e8f5e9] px-4 py-3 text-sm font-medium text-[#2e7d46]">
            제출이 완료되었습니다. 감사합니다!
          </p>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={(e) => void handleSubmit(e)}>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#0b3a66]">이름 *</span>
              <input
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="cg-input w-full"
                placeholder="홍길동"
                maxLength={40}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#0b3a66]">학교 (선택)</span>
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="cg-input w-full"
                placeholder="○○초등학교"
                maxLength={60}
              />
            </label>
            {sessionCode ? (
              <p className="text-xs text-[#5a6f82]">
                활동 코드 <strong className="text-[#0b3a66]">{sessionCode}</strong>로 제출됩니다.
              </p>
            ) : (
              <p className="text-xs text-[#c43c3c]">활동 코드가 없습니다. 처음 화면에서 참여해 주세요.</p>
            )}
            {error ? <p className="text-sm text-[#c43c3c]">{error}</p> : null}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="cg-btn cg-btn-primary w-full"
            >
              {submitting ? '제출 중…' : '관리자에게 제출하기'}
            </button>
          </form>
        )}
      </section>

      <section className="rounded-2xl border-[3px] border-[#c4a35a] bg-[#fff6d6] px-5 py-5 shadow-[4px_4px_0_#c4a35a]">
        <div className="flex items-center gap-2">
          <h3 className="font-[family-name:var(--font-cg)] text-xl text-[#5c4a1f]">
            생각해 볼 질문
          </h3>
          <span aria-hidden>💡</span>
        </div>
        <ol className="mt-3 space-y-2.5">
          {REFLECTIONS.map((q, i) => (
            <li key={q} className="flex gap-2.5 text-sm leading-relaxed text-[#3d3420]">
              <span className="font-bold text-[#c4a35a]">•</span>
              <span>
                {i + 1}. {q}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex justify-center">
        <button type="button" onClick={onReplay} className="cg-btn cg-btn-ghost px-8">
          다시 고르기
        </button>
      </div>
    </div>
  )
}
