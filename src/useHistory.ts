import { useCallback, useState } from 'react'

export type TestType = 'mock' | 'practice' | 'bookmarked' | 'important'

export interface AnswerRecord {
  questionId: string
  userAnswer: boolean
}

export interface TestRecord {
  id: string
  dateTime: string
  type: TestType
  questionCount: number
  score: number
  answers: AnswerRecord[]
}

const STORAGE_KEY = 'jp-drive-history'
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

function loadRecords(): TestRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const records: TestRecord[] = JSON.parse(raw)
    const cutoff = Date.now() - THREE_DAYS_MS
    return records.filter(r => new Date(r.dateTime).getTime() > cutoff)
  } catch {
    return []
  }
}

function saveRecords(records: TestRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function useHistory() {
  const [records, setRecords] = useState<TestRecord[]>(() => {
    const pruned = loadRecords()
    saveRecords(pruned)
    return pruned
  })

  const addRecord = useCallback((record: Omit<TestRecord, 'id'>) => {
    const newRecord: TestRecord = { id: Date.now().toString(), ...record }
    setRecords(prev => {
      const updated = [newRecord, ...prev]
      saveRecords(updated)
      return updated
    })
  }, [])

  return { records, addRecord }
}
