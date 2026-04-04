import { useState } from 'react'
import { Question } from '../types'
import { BookmarkLevel } from '../useBookmarks'

interface Props {
  questions: Question[]
  getLevel: (id: string) => BookmarkLevel
  onCycleBookmark: (id: string) => void
  onRemoveBookmark: (id: string) => void
  onBack: () => void
}

const BOOKMARK_ICON: Record<BookmarkLevel, string> = { 0: '🏷️', 1: '🔖', 2: '⭐' }
const BOOKMARK_TITLE: Record<BookmarkLevel, string> = { 0: 'Bookmark', 1: 'Mark as very important', 2: 'Toggle bookmark' }
const LEVEL_LABEL: Record<1 | 2, string> = { 1: 'Bookmarked', 2: 'Very Important' }
const LEVEL_COLOR: Record<1 | 2, string> = {
  1: 'border-yellow-300 bg-yellow-50',
  2: 'border-orange-300 bg-orange-50',
}

export default function BookmarkScreen({ questions, getLevel, onCycleBookmark, onRemoveBookmark, onBack }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const bookmarked = questions
    .map((q) => ({ question: q, level: getLevel(q.id) }))
    .filter((e) => e.level >= 1)
    .sort((a, b) => a.question.id.localeCompare(b.question.id, undefined, { numeric: true }))

  function handleConfirmRemove() {
    if (confirmId) onRemoveBookmark(confirmId)
    setConfirmId(null)
  }

  const confirmQuestion = confirmId ? questions.find((q) => q.id === confirmId) : null

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none transition-colors"
            title="Back"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">Bookmarks</h1>
          <span className="ml-auto text-sm text-gray-400">{bookmarked.length} questions</span>
        </div>

        {bookmarked.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏷️</div>
            <p className="text-lg">No bookmarks yet.</p>
            <p className="text-sm mt-1">Bookmark questions during a quiz to review them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarked.map(({ question, level }) => (
              <div
                key={question.id}
                className={`bg-white rounded-2xl shadow-sm p-5 border-2 ${LEVEL_COLOR[level as 1 | 2]}`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{question.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${level === 2 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {LEVEL_LABEL[level as 1 | 2]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCycleBookmark(question.id)}
                      className="text-2xl leading-none transition-transform active:scale-90"
                      title={BOOKMARK_TITLE[level]}
                    >
                      {BOOKMARK_ICON[level]}
                    </button>
                    <button
                      onClick={() => setConfirmId(question.id)}
                      className="text-sm font-medium text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove bookmark"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Question */}
                <p className="text-gray-800 text-lg font-medium leading-relaxed mb-3">{question.question}</p>

                {/* Image */}
                {question.image && (
                  <div className="mb-3 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={import.meta.env.BASE_URL + question.image}
                      alt="Question illustration"
                      className="w-full object-contain max-h-48"
                    />
                  </div>
                )}

                {/* Answer */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold mb-3 ${question.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {question.answer ? '⭕ True' : '✕ False'}
                </div>

                {/* Explanation */}
                <div className="bg-blue-50 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Explanation</p>
                  <p className="text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: question.description }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Remove Bookmark?</h2>
            <p className="text-sm text-gray-500 mb-1 font-mono">{confirmId}</p>
            {confirmQuestion && (
              <p className="text-gray-700 text-sm mb-6 line-clamp-2">{confirmQuestion.question}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
