import { Question } from '../types'

interface UserAnswer {
  question: Question
  userAnswer: boolean
}

interface Props {
  answers: UserAnswer[]
  onRestart: () => void
}

export default function ResultScreen({ answers, onRestart }: Props) {
  const score = answers.filter((a) => a.userAnswer === a.question.answer).length
  const total = answers.length
  const percentage = Math.round((score / total) * 100)

  const passed = percentage >= 90

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Score card */}
        <div className={`rounded-2xl shadow-md p-8 text-center mb-6 ${passed ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="text-5xl mb-3">{passed ? '🎉' : '📚'}</div>
          <h2 className="text-white text-2xl font-bold mb-1">
            {passed ? 'Passed!' : 'Keep Studying!'}
          </h2>
          <p className="text-white/90 text-4xl font-bold mb-1">{score} / {total}</p>
          <p className="text-white/80 text-lg">{percentage}%</p>
        </div>

        {/* Answer review */}
        <div className="space-y-4 mb-8">
          {answers.map(({ question, userAnswer }, i) => {
            const isCorrect = userAnswer === question.answer
            return (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Question {i + 1}</p>
                  <span className="text-xs font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{question.id}</span>
                </div>
                <p className="text-gray-800 font-medium mb-3">{question.question}</p>

                {question.image && (
                  <div className="mb-3 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={question.image}
                      alt="Question illustration"
                      className="w-full object-contain max-h-40"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mb-3 text-sm">
                  <div className={`flex-1 rounded-lg px-3 py-2 font-medium ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <span className="font-semibold">Your Answer: </span>
                    {isCorrect ? '⭕ Correct' : '❌ Incorrect'}
                    <span className="ml-1 opacity-70">({userAnswer ? 'True' : 'False'})</span>
                  </div>
                  {!isCorrect && (
                    <div className="flex-1 rounded-lg px-3 py-2 bg-green-50 text-green-700 text-sm font-medium">
                      <span className="font-semibold">Correct: </span>
                      {question.answer ? 'True ⭕' : 'False ✕'}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Explanation</p>
                  <p className="text-sm text-gray-700">{question.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 rounded-2xl text-lg shadow-md transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
