import { useState, useCallback } from 'react'

const STORAGE_KEY = 'jp-quiz-bookmarks'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function save(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(load)

  const toggle = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      save(next)
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [bookmarks])

  return { bookmarks, toggle, isBookmarked }
}
