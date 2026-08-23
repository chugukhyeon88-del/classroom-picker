import type { CategoryId, Selections } from './data'

export type ChoiceSummary = {
  categoryId: CategoryId
  categoryLabel: string
  title: string
  subtitle: string
  cost: number
}

export type ClassroomSession = {
  id: string
  code: string
  title: string
  adminToken: string
  createdAt: number
}

export type Submission = {
  id: string
  sessionId: string
  sessionCode: string
  teacherName: string
  school: string
  selections: Selections
  choices: ChoiceSummary[]
  createdAt: number
}
