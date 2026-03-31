interface Props {
  totalAvailable: number
  onStart: (count: number) => void
}

export default function StartScreen({ totalAvailable, onStart }: Props) {
  const options = [5, 10, 15, totalAvailable].filter((n, i, arr) => n <= totalAvailable && arr.indexOf(n) === i)

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Japan Driving License</h1>
        <p className="text-gray-500 mb-8">True / False Quiz</p>
        <p className="text-sm text-gray-600 mb-6">Select the number of questions</p>
        <div className="grid grid-cols-2 gap-3">
          {options.map((n) => (
            <button
              key={n}
              onClick={() => onStart(n)}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
            >
              {n === totalAvailable ? `All (${n})` : `${n} Questions`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
