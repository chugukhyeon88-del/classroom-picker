import type { CategoryId, Selections } from './data'

export type ChoiceSummary = {
  categoryId: CategoryId
  categoryLabel: string
  title: string
  subtitle: string
  cost: number
}

export type Submission = {
  id: string
  teacherName: string
  school: string
  selections: Selections
  choices: ChoiceSummary[]
  createdAt: number
}
