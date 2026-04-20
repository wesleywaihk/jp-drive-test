import { Stage } from '../App'

interface Props {
  stage: Stage
  onStageChange: (stage: Stage) => void
  totalAvailable: number
  totalBookmarked: number
  importantCount: number
  historyCount: number
  onStart: (count: number) => void
  onStartMock: () => void
  onStartBookmarked: () => void
  onStartImportant: () => void
  onViewBookmarks: () => void
  onViewQuestions: () => void
  onViewHistory: () => void
}

export default function StartScreen({ stage, onStageChange, totalAvailable, totalBookmarked, importantCount, historyCount, onStart, onStartMock, onStartBookmarked, onStartImportant, onViewBookmarks, onViewQuestions, onViewHistory }: Props) {
  const options = [5, 10, 15, 25].filter((n, i, arr) => n <= totalAvailable && arr.indexOf(n) === i)

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Japan Driving License</h1>
        <p className="text-gray-500 mb-6">True / False Quiz</p>

        {/* Stage toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => onStageChange('stage1')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              stage === 'stage1'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stage 1
          </button>
          <button
            onClick={() => onStageChange('stage2')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              stage === 'stage2'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stage 2
          </button>
        </div>

        <button
          onClick={onStartMock}
          className="w-full bg-gray-800 hover:bg-gray-900 active:black text-white font-bold py-4 rounded-xl text-lg transition-colors mb-4 flex items-center justify-center gap-2"
        >
          📝 Mock Exam
          <span className="text-sm font-normal opacity-70">50 questions · 30 min</span>
        </button>

        <p className="text-sm text-gray-600 mb-4">Select the number of questions</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {options.map((n) => (
            <button
              key={n}
              onClick={() => onStart(n)}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
            >
              {`${n} Questions`}
            </button>
          ))}
        </div>

        {totalBookmarked > 0 && (
          <div className="space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onStartBookmarked}
                className="bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 font-semibold py-4 rounded-xl text-lg transition-colors"
              >
                🔖 ({totalBookmarked})
              </button>
              {importantCount > 0 ? (
                <button
                  onClick={onStartImportant}
                  className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
                >
                  ⭐ ({importantCount})
                </button>
              ) : <div />}
            </div>
            <button
              onClick={onViewBookmarks}
              className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-base transition-colors"
            >
              View Bookmark List
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onViewQuestions}
            className="border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-base transition-colors"
          >
            All Questions ({totalAvailable})
          </button>
          <button
            onClick={onViewHistory}
            className="border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-base transition-colors"
          >
            🕐 History {historyCount > 0 ? `(${historyCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
