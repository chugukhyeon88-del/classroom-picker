import {
  CATEGORIES,
  COST_TIERS,
  REFLECTIONS,
  formatWon,
  type CategoryId,
  type Selections,
} from './data'

const TONE_BG: Record<string, string> = {
  green: '#2e7d46',
  amber: '#d97706',
  rose: '#db2777',
  violet: '#6d28d9',
}

export function ResultView({
  selections,
  onReplay,
}: {
  selections: Selections
  onReplay: () => void
}) {
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
        <button type="button" onClick={onReplay} className="cg-btn cg-btn-primary px-8">
          다시 고르기
        </button>
      </div>
    </div>
  )
}
