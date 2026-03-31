import { useState, useCallback } from 'react'

export type BookmarkLevel = 0 | 1 | 2  // 0 = none, 1 = bookmarked, 2 = very important

const STORAGE_KEY = 'jp-quiz-bookmarks'

function load(): Map<string, BookmarkLevel> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Map(raw ? JSON.parse(raw) : [])
  } catch {
    return new Map()
  }
}

function save(map: Map<string, BookmarkLevel>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...map]))
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Map<string, BookmarkLevel>>(load)

  const cycle = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Map(prev)
      const current = next.get(id) ?? 0
      const nextLevel = ((current + 1) % 3) as BookmarkLevel
      if (nextLevel === 0) next.delete(id)
      else next.set(id, nextLevel)
      save(next)
      return next
    })
  }, [])

  const getLevel = useCallback((id: string): BookmarkLevel => bookmarks.get(id) ?? 0, [bookmarks])

  const countByLevel = useCallback((level: BookmarkLevel) =>
    [...bookmarks.values()].filter((v) => v === level).length, [bookmarks])

  const totalBookmarked = bookmarks.size

  const remove = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Map(prev)
      next.delete(id)
      save(next)
      return next
    })
  }, [])

  return { cycle, remove, getLevel, countByLevel, totalBookmarked }
}
