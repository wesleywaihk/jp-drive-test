import { Question } from '../types'
import { BookmarkLevel } from '../useBookmarks'

interface Props {
  questions: Question[]
  getLevel: (id: string) => BookmarkLevel
  onCycleBookmark: (id: string) => void
  onBack: () => void
}

const BOOKMARK_ICON: Record<BookmarkLevel, string> = { 0: '🏷️', 1: '🔖', 2: '⭐' }
const BOOKMARK_TITLE: Record<BookmarkLevel, string> = { 0: 'Bookmark', 1: 'Mark as very important', 2: 'Toggle bookmark' }

export default function QuestionsScreen({ questions, getLevel, onCycleBookmark, onBack }: Props) {
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
          <h1 className="text-xl font-bold text-gray-800">All Questions</h1>
          <span className="ml-auto text-sm text-gray-400">{questions.length} questions</span>
        </div>

        <div className="space-y-4">
          {questions.map((question, i) => {
            const level = getLevel(question.id)
            return (
              <div key={question.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                {/* Card header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">#{i + 1}</span>
                    <span className="text-xs font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{question.id}</span>
                  </div>
                  <button
                    onClick={() => onCycleBookmark(question.id)}
                    className="text-2xl leading-none transition-transform active:scale-90"
                    title={BOOKMARK_TITLE[level]}
                  >
                    {BOOKMARK_ICON[level]}
                  </button>
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
                  <p className="text-lg text-gray-700">{question.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
