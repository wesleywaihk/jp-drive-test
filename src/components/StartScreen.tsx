interface Props {
  totalAvailable: number
  totalBookmarked: number
  importantCount: number
  onStart: (count: number) => void
  onStartMock: () => void
  onStartBookmarked: () => void
  onStartImportant: () => void
  onViewBookmarks: () => void
  onViewQuestions: () => void
}

export default function StartScreen({ totalAvailable, totalBookmarked, importantCount, onStart, onStartMock, onStartBookmarked, onStartImportant, onViewBookmarks, onViewQuestions }: Props) {
  const options = [5, 10, 15, 25].filter((n, i, arr) => n <= totalAvailable && arr.indexOf(n) === i)

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Japan Driving License</h1>
        <p className="text-gray-500 mb-8">True / False Quiz</p>

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

        <button
          onClick={onViewQuestions}
          className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-base transition-colors"
        >
          All Questions ({totalAvailable})
        </button>
      </div>
    </div>
  )
}
