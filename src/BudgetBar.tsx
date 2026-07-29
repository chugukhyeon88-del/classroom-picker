import { BUDGET, formatWon } from './data'

export function BudgetBar({
  spent,
  remaining,
  exact,
  complete,
  onSubmit,
  onReset,
}: {
  spent: number
  remaining: number
  exact: boolean
  complete: boolean
  onSubmit: () => void
  onReset: () => void
}) {
  const over = remaining < 0
  const progress = Math.min(100, (spent / BUDGET) * 100)

  return (
    <div className="sticky bottom-0 z-30 border-t-4 border-[#0b3a66] bg-[#fffaf0]/97 px-3 py-3 backdrop-blur-md sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-[720px] flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 font-[family-name:var(--font-cg)]">
            <span className="text-sm text-[#0b3a66]">
              사용{' '}
              <strong className="text-xl sm:text-2xl">{formatWon(spent)}</strong>
            </span>
            <span
              className={`text-sm ${
                over ? 'text-[#c43c3c]' : exact ? 'text-[#2e7d46]' : 'text-[#5a6f82]'
              }`}
            >
              {over ? '초과 ' : '남은 돈 '}
              <strong className="text-xl sm:text-2xl">{formatWon(Math.abs(remaining))}</strong>
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border-2 border-[#0b3a66]/20 bg-white">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                over ? 'bg-[#c43c3c]' : exact ? 'bg-[#2e7d46]' : 'bg-[#0b3a66]'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#5a6f82]">
            {exact
              ? '딱 100만원을 썼어요! 아래 버튼으로 결과를 확인하세요.'
              : complete && !exact
                ? over
                  ? '예산이 초과됐어요. 더 저렴한 칸을 골라보세요.'
                  : '아직 남은 돈이 있어요. 다른 조합을 시도해 보세요.'
                : '네 줄 모두에서 하나씩 선택하세요.'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={onReset} className="cg-btn cg-btn-ghost">
            초기화
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!exact}
            className="cg-btn cg-btn-primary"
          >
            내 학급 보기
          </button>
        </div>
      </div>
    </div>
  )
}
