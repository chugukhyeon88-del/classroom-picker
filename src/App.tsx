import { useState } from 'react'
import { BudgetBar } from './BudgetBar'
import { ResultView } from './ResultView'
import {
  BUDGET,
  CATEGORIES,
  COST_TIERS,
  getSpent,
  isComplete,
  isExactBudget,
  type CategoryId,
  type Selections,
} from './data'

const GRID = {
  left: 18.9,
  colW: 19.72,
  rows: [
    { id: 'students' as const, top: 30.1, height: 12.7 },
    { id: 'principal' as const, top: 42.8, height: 17.9 },
    { id: 'complaints' as const, top: 60.7, height: 12.3 },
    { id: 'volleyball' as const, top: 73.0, height: 13.7 },
  ],
}

const SELECT_RING: Record<string, string> = {
  green: 'rgba(46, 125, 70, 0.95)',
  amber: 'rgba(217, 119, 6, 0.95)',
  rose: 'rgba(219, 39, 119, 0.95)',
  violet: 'rgba(109, 40, 217, 0.95)',
}

export default function App() {
  const [selections, setSelections] = useState<Selections>({})
  const [showResult, setShowResult] = useState(false)

  const spent = getSpent(selections)
  const remaining = BUDGET - spent
  const complete = isComplete(selections)
  const exact = isExactBudget(selections)

  function select(categoryId: CategoryId, cost: number) {
    setShowResult(false)
    setSelections((prev) => ({ ...prev, [categoryId]: cost }))
  }

  function reset() {
    setSelections({})
    setShowResult(false)
  }

  if (showResult && exact) {
    return (
      <div className="classroom-game min-h-dvh">
        <div className="classroom-sheet relative px-3 py-4 sm:px-6 sm:py-8">
          <nav className="mx-auto mb-4 flex max-w-[720px] items-center justify-center">
            <span className="font-[family-name:var(--font-cg)] text-sm text-[#0b3a66]">
              초등교사 학급 고르기
            </span>
          </nav>
          <ResultView selections={selections} onReplay={reset} />
        </div>
      </div>
    )
  }

  return (
    <div className="classroom-game flex min-h-dvh flex-col">
      <div className="classroom-sheet relative flex-1 px-2 pb-4 pt-3 sm:px-6 sm:pt-6">
        <nav className="mx-auto mb-3 flex max-w-[720px] items-center justify-end px-1">
          <span className="rounded-full bg-[#0b3a66] px-3 py-1 text-[11px] font-bold text-white sm:text-xs">
            클릭해서 고르기 · 합 100만원
          </span>
        </nav>

        <div className="cg-board-frame mx-auto max-w-[720px]">
          <div className="cg-board relative w-full select-none">
            <img
              src="/classroom/reference.png"
              alt="초등교사 학급 고르기 — 100만원을 가지고 있고, 모든 돈을 사용해야 합니다."
              className="pointer-events-none block h-auto w-full"
              draggable={false}
            />

            {GRID.rows.map((row) =>
              COST_TIERS.map((tier, col) => {
                const selected = selections[row.id] === tier.cost
                const left = GRID.left + col * GRID.colW
                return (
                  <button
                    key={`${row.id}-${tier.cost}`}
                    type="button"
                    aria-label={`${CATEGORIES.find((c) => c.id === row.id)?.label} ${tier.label} 선택`}
                    aria-pressed={selected}
                    onClick={() => select(row.id, tier.cost)}
                    className="cg-hotspot absolute z-10"
                    style={{
                      left: `${left}%`,
                      top: `${row.top}%`,
                      width: `${GRID.colW}%`,
                      height: `${row.height}%`,
                      ['--ring' as string]: SELECT_RING[tier.tone],
                    }}
                    data-selected={selected ? 'true' : 'false'}
                  >
                    {selected ? <span className="cg-check">✓</span> : null}
                  </button>
                )
              }),
            )}
          </div>
        </div>

        <p className="mx-auto mt-3 max-w-[720px] px-2 text-center text-xs text-[#5a6f82] sm:text-sm">
          각 줄에서 <strong className="text-[#0b3a66]">하나씩</strong> 고르고, 합이 정확히{' '}
          <strong className="text-[#c43c3c]">100만원</strong>이 되게 하세요.
        </p>
      </div>

      <BudgetBar
        spent={spent}
        remaining={remaining}
        exact={exact}
        complete={complete}
        onSubmit={() => setShowResult(true)}
        onReset={reset}
      />
    </div>
  )
}
