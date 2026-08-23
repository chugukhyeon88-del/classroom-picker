import { addDoc, collection, getDocs, serverTimestamp, type Timestamp } from 'firebase/firestore'
import { CATEGORIES, type CategoryId, type Selections } from '../data'
import type { ChoiceSummary, Submission } from '../types'
import { getDb, isFirebaseConfigured } from './firebase'

const SUBMISSIONS = 'classroom_submissions'

function toMillis(value: Timestamp | number | undefined): number {
  if (!value) return Date.now()
  if (typeof value === 'number') return value
  return value.toMillis()
}

export function selectionsToChoices(selections: Selections): ChoiceSummary[] {
  return CATEGORIES.map((cat) => {
    const cost = selections[cat.id as CategoryId]!
    const option = cat.options.find((o) => o.cost === cost)!
    return {
      categoryId: cat.id,
      categoryLabel: cat.label,
      title: option.title,
      subtitle: option.subtitle,
      cost,
    }
  })
}

export async function submitResult(input: {
  teacherName: string
  school?: string
  selections: Selections
}): Promise<Submission> {
  const db = getDb()
  if (!db) throw new Error('Firebase가 설정되지 않았습니다.')

  const choices = selectionsToChoices(input.selections)
  const ref = await addDoc(collection(db, SUBMISSIONS), {
    teacherName: input.teacherName.trim(),
    school: input.school?.trim() || '',
    selections: input.selections,
    choices,
    createdAt: serverTimestamp(),
  })

  return {
    id: ref.id,
    teacherName: input.teacherName.trim(),
    school: input.school?.trim() || '',
    selections: input.selections,
    choices,
    createdAt: Date.now(),
  }
}

export async function listAllSubmissions(): Promise<Submission[]> {
  const db = getDb()
  if (!db) return []

  // Avoid composite index requirement: sort client-side
  const snap = await getDocs(collection(db, SUBMISSIONS))

  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        teacherName: data.teacherName,
        school: data.school ?? '',
        selections: data.selections,
        choices: data.choices,
        createdAt: toMillis(data.createdAt),
      } satisfies Submission
    })
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function getStorageStatus(): 'ready' | 'missing' {
  return isFirebaseConfigured ? 'ready' : 'missing'
}
