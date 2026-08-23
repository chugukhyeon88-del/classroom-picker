import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { CATEGORIES, type CategoryId, type Selections } from '../data'
import type { ChoiceSummary, ClassroomSession, Submission } from '../types'
import { getDb, isFirebaseConfigured } from './firebase'

const SESSIONS = 'classroom_sessions'
const SUBMISSIONS = 'classroom_submissions'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomToken(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('')
}

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

export async function createSession(title: string): Promise<ClassroomSession> {
  const db = getDb()
  if (!db) throw new Error('Firebase가 설정되지 않았습니다.')

  const code = randomToken(6)
  const adminToken = randomToken(12)
  const ref = await addDoc(collection(db, SESSIONS), {
    code,
    title: title.trim() || '학급 고르기 활동',
    adminToken,
    createdAt: serverTimestamp(),
  })

  return {
    id: ref.id,
    code,
    title: title.trim() || '학급 고르기 활동',
    adminToken,
    createdAt: Date.now(),
  }
}

export async function getSessionByCode(code: string): Promise<ClassroomSession | null> {
  const db = getDb()
  if (!db) return null

  const snap = await getDocs(
    query(collection(db, SESSIONS), where('code', '==', code.toUpperCase())),
  )
  const hit = snap.docs[0]
  if (!hit) return null

  const data = hit.data()
  return {
    id: hit.id,
    code: data.code,
    title: data.title,
    adminToken: data.adminToken,
    createdAt: toMillis(data.createdAt),
  }
}

export async function verifySessionAdmin(
  code: string,
  adminToken: string,
): Promise<ClassroomSession | null> {
  const session = await getSessionByCode(code)
  if (!session || session.adminToken !== adminToken) return null
  return session
}

export async function submitResult(input: {
  sessionCode: string
  teacherName: string
  school?: string
  selections: Selections
}): Promise<Submission> {
  const db = getDb()
  if (!db) throw new Error('Firebase가 설정되지 않았습니다.')

  const session = await getSessionByCode(input.sessionCode)
  if (!session) throw new Error('유효하지 않은 활동 코드입니다.')

  const choices = selectionsToChoices(input.selections)
  const ref = await addDoc(collection(db, SUBMISSIONS), {
    sessionId: session.id,
    sessionCode: session.code,
    teacherName: input.teacherName.trim(),
    school: input.school?.trim() || '',
    selections: input.selections,
    choices,
    createdAt: serverTimestamp(),
  })

  return {
    id: ref.id,
    sessionId: session.id,
    sessionCode: session.code,
    teacherName: input.teacherName.trim(),
    school: input.school?.trim() || '',
    selections: input.selections,
    choices,
    createdAt: Date.now(),
  }
}

export async function listSubmissions(sessionId: string): Promise<Submission[]> {
  const db = getDb()
  if (!db) return []

  const snap = await getDocs(
    query(collection(db, SUBMISSIONS), where('sessionId', '==', sessionId)),
  )

  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        sessionId: data.sessionId,
        sessionCode: data.sessionCode,
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
