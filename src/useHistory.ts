import { useCallback, useState, useEffect } from 'react'
import { Stage } from './App'

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

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

function storageKey(stage: Stage) {
  return `jp-drive-history-${stage}`
}

function loadRecords(stage: Stage): TestRecord[] {
  try {
    const raw = localStorage.getItem(storageKey(stage))
    if (!raw) return []
    const records: TestRecord[] = JSON.parse(raw)
    const cutoff = Date.now() - THREE_DAYS_MS
    return records.filter(r => new Date(r.dateTime).getTime() > cutoff)
  } catch {
    return []
  }
}

function saveRecords(stage: Stage, records: TestRecord[]) {
  localStorage.setItem(storageKey(stage), JSON.stringify(records))
}

export function useHistory(stage: Stage) {
  const [records, setRecords] = useState<TestRecord[]>(() => {
    const pruned = loadRecords(stage)
    saveRecords(stage, pruned)
    return pruned
  })

  useEffect(() => {
    const pruned = loadRecords(stage)
    saveRecords(stage, pruned)
    setRecords(pruned)
  }, [stage])

  const addRecord = useCallback((record: Omit<TestRecord, 'id'>) => {
    const newRecord: TestRecord = { id: Date.now().toString(), ...record }
    setRecords(prev => {
      const updated = [newRecord, ...prev]
      saveRecords(stage, updated)
      return updated
    })
  }, [stage])

  return { records, addRecord }
}
