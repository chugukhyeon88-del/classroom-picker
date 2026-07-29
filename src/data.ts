export const BUDGET = 1_000_000

export const COST_TIERS = [
  { cost: 100_000, label: '10만원', tone: 'green' as const },
  { cost: 200_000, label: '20만원', tone: 'amber' as const },
  { cost: 300_000, label: '30만원', tone: 'rose' as const },
  { cost: 400_000, label: '40만원', tone: 'violet' as const },
] as const

export type CostTone = (typeof COST_TIERS)[number]['tone']

export type CategoryId = 'students' | 'principal' | 'complaints' | 'volleyball'

export type Option = {
  cost: number
  title: string
  subtitle: string
}

export type Category = {
  id: CategoryId
  label: string
  options: Option[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'students',
    label: '학생 수',
    options: [
      { cost: 100_000, title: '34명', subtitle: '다소 많음' },
      { cost: 200_000, title: '28명', subtitle: '보통' },
      { cost: 300_000, title: '22명', subtitle: '적음' },
      { cost: 400_000, title: '16명', subtitle: '매우 적음' },
    ],
  },
  {
    id: 'principal',
    label: '교장·교감의 업무 관여도',
    options: [
      { cost: 100_000, title: '매우 많음', subtitle: '세세히 관여' },
      { cost: 200_000, title: '조금 많음', subtitle: '자주 관여' },
      { cost: 300_000, title: '가끔 있음', subtitle: '필요할 때만' },
      { cost: 400_000, title: '거의 없음', subtitle: '교사 자율성 존중' },
    ],
  },
  {
    id: 'complaints',
    label: '학부모 민원전화 횟수 (주당)',
    options: [
      { cost: 100_000, title: '10통 이상', subtitle: '매우 많음' },
      { cost: 200_000, title: '5통', subtitle: '보통' },
      { cost: 300_000, title: '2통', subtitle: '적음' },
      { cost: 400_000, title: '거의 없음', subtitle: '거의 없음' },
    ],
  },
  {
    id: 'volleyball',
    label: '친목 배구 하는 횟수 (월)',
    options: [
      { cost: 100_000, title: '0회', subtitle: '안 함' },
      { cost: 200_000, title: '1회', subtitle: '가끔' },
      { cost: 300_000, title: '2회', subtitle: '보통' },
      { cost: 400_000, title: '4회', subtitle: '많이 함' },
    ],
  },
]

export const HOW_TO = [
  '100만원을 모두 사용해 나만의 학급을 구성해 보세요.',
  '선택한 이유를 주변에 이야기해 보세요.',
  '가장 의외의 선택을 한 사람을 찾아보세요.',
]

export const REFLECTIONS = [
  '나에게 가장 중요했던 요인은?',
  '포기해서 아쉬운 선택은?',
  '현실이라면 가장 바꾸고 싶은 것은?',
]

export type Selections = Partial<Record<CategoryId, number>>

export function formatWon(amount: number): string {
  if (amount >= 10_000) {
    const man = amount / 10_000
    return Number.isInteger(man) ? `${man}만원` : `${man.toFixed(1)}만원`
  }
  return `${amount.toLocaleString('ko-KR')}원`
}

export function getSpent(selections: Selections): number {
  return CATEGORIES.reduce((sum, cat) => {
    const cost = selections[cat.id]
    return sum + (typeof cost === 'number' ? cost : 0)
  }, 0)
}

export function isComplete(selections: Selections): boolean {
  return CATEGORIES.every((cat) => typeof selections[cat.id] === 'number')
}

export function isExactBudget(selections: Selections): boolean {
  return isComplete(selections) && getSpent(selections) === BUDGET
}
