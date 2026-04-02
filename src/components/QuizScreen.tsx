import { useState } from 'react'
import { Question } from '../types'
import { BookmarkLevel } from '../useBookmarks'

interface Props {
  question: Question
  current: number
  total: number
  onAnswer: (answer: boolean) => void
  getLevel: (id: string) => BookmarkLevel
  onCycleBookmark: (id: string) => void
  onQuit: () => void
}

const BOOKMARK_ICON: Record<BookmarkLevel, string> = { 0: '🏷️', 1: '🔖', 2: '⭐' }
const BOOKMARK_TITLE: Record<BookmarkLevel, string> = { 0: 'Bookmark', 1: 'Mark as very important', 2: 'Remove bookmark' }

export default function QuizScreen({ question, current, total, onAnswer, getLevel, onCycleBookmark, onQuit }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null)
  const progress = (current / total) * 100

  const isCorrect = selected === question.answer
  const level = getLevel(question.id)

  function handleSelect(value: boolean) {
    if (selected !== null) return
    setSelected(value)
  }

  function handleNext() {
    const answer = selected!
    setSelected(null)
    onAnswer(answer)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">Question {current} of {total}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-red-600">{Math.round(progress)}%</span>
            <button
              onClick={onQuit}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Quit
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Question</p>
          </div>
          <p className="text-gray-800 text-lg leading-relaxed">{question.question}</p>

          {question.image && (
            <div className="mt-4 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={import.meta.env.BASE_URL + question.image}
                alt="Question illustration"
                className="w-full object-contain max-h-48"
              />
            </div>
          )}
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => handleSelect(true)}
            disabled={selected !== null}
            className={`font-bold py-5 rounded-2xl text-xl shadow-md transition-colors
              ${selected === null
                ? 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white'
                : selected === true
                  ? isCorrect
                    ? 'bg-green-500 text-white ring-4 ring-green-300'
                    : 'bg-green-200 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
          >
            ⭕ True
          </button>
          <button
            onClick={() => handleSelect(false)}
            disabled={selected !== null}
            className={`font-bold py-5 rounded-2xl text-xl shadow-md transition-colors
              ${selected === null
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
                : selected === false
                  ? isCorrect
                    ? 'bg-red-500 text-white ring-4 ring-red-300'
                    : 'bg-red-200 text-red-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
          >
            ✕ False
          </button>
        </div>

        {/* Answer feedback */}
        {selected !== null && (
          <div className="space-y-3">
            <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '⭕ Correct!' : '❌ Incorrect'}
                </p>
                <button
                  onClick={() => onCycleBookmark(question.id)}
                  className="text-2xl leading-none transition-transform active:scale-90"
                  title={BOOKMARK_TITLE[level]}
                >
                  {BOOKMARK_ICON[level]}
                </button>
              </div>
              {!isCorrect && (
                <p className="text-sm text-gray-600 mb-2">
                  Correct answer: <span className="font-semibold">{question.answer ? 'True ⭕' : 'False ✕'}</span>
                </p>
              )}
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Explanation <span className="font-mono text-gray-400 normal-case">({question.id})</span></p>
              <p className="text-lg text-gray-700">{question.description}</p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-gray-800 hover:bg-gray-900 active:bg-black text-white font-bold py-4 rounded-2xl text-lg shadow-md transition-colors"
            >
              {current < total ? 'Next Question →' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
