import { useState, useCallback, useEffect } from 'react'
import { Stage } from './App'

export type BookmarkLevel = 0 | 1 | 2  // 0 = none, 1 = bookmarked, 2 = very important

function storageKey(stage: Stage) {
  return `jp-quiz-bookmarks-${stage}`
}

function load(stage: Stage): Map<string, BookmarkLevel> {
  try {
    const raw = localStorage.getItem(storageKey(stage))
    return new Map(raw ? JSON.parse(raw) : [])
  } catch {
    return new Map()
  }
}

function save(stage: Stage, map: Map<string, BookmarkLevel>) {
  localStorage.setItem(storageKey(stage), JSON.stringify([...map]))
}

export function useBookmarks(activeIds: Set<string>, stage: Stage) {
  const [bookmarks, setBookmarks] = useState<Map<string, BookmarkLevel>>(() => load(stage))

  useEffect(() => {
    setBookmarks(load(stage))
  }, [stage])

  const activeBookmarks = new Map([...bookmarks].filter(([id]) => activeIds.has(id)))

  const cycle = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Map(prev)
      const current = next.get(id) ?? 0
      const nextLevel = ((current + 1) % 3) as BookmarkLevel
      if (nextLevel === 0) next.delete(id)
      else next.set(id, nextLevel)
      save(stage, next)
      return next
    })
  }, [stage])

  const getLevel = useCallback((id: string): BookmarkLevel => activeIds.has(id) ? (bookmarks.get(id) ?? 0) : 0, [bookmarks, activeIds])

  const countByLevel = useCallback((level: BookmarkLevel) =>
    [...activeBookmarks.values()].filter((v) => v === level).length, [activeBookmarks])

  const totalBookmarked = activeBookmarks.size

  const remove = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Map(prev)
      next.delete(id)
      save(stage, next)
      return next
    })
  }, [stage])

  return { cycle, remove, getLevel, countByLevel, totalBookmarked }
}
