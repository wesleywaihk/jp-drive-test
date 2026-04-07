import { TestRecord, TestType } from '../useHistory'

interface Props {
  records: TestRecord[]
  onSelect: (record: TestRecord) => void
  onBack: () => void
}

const TYPE_LABEL: Record<TestType, string> = {
  mock: '📝 Mock Exam',
  practice: '📚 Practice',
  bookmarked: '🔖 Bookmarked',
  important: '⭐ Important',
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoryScreen({ records, onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            title="Back"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">Test History</h1>
        </div>

        {records.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">🕐</div>
            <p className="text-lg font-medium">No history yet</p>
            <p className="text-sm mt-1">Complete a test to see results here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => {
              const pct = Math.round((record.score / record.questionCount) * 100)
              const passed = pct >= 90
              return (
                <button
                  key={record.id}
                  onClick={() => onSelect(record)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {TYPE_LABEL[record.type]}
                    </span>
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded-full ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {passed ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {record.score} / {record.questionCount}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{pct}%</p>
                    </div>
                    <p className="text-xs text-gray-400">{formatDateTime(record.dateTime)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
