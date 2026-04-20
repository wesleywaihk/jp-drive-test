import { useState, useCallback, useEffect, useRef } from 'react'
import stage1Data from './stage-1.json'
import stage2Data from './stage-2.json'
import { Question } from './types'
import { useBookmarks } from './useBookmarks'
import { useHistory, TestRecord, TestType } from './useHistory'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import StartScreen from './components/StartScreen'
import BookmarkScreen from './components/BookmarkScreen'
import QuestionsScreen from './components/QuestionsScreen'
import HistoryScreen from './components/HistoryScreen'

type UserAnswer = { question: Question; userAnswer: boolean }
type AppState = 'start' | 'quiz' | 'result' | 'bookmarks' | 'questions' | 'history' | 'history-detail'
export type Stage = 'stage1' | 'stage2'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getRouteFromHash(): AppState {
  const hash = window.location.hash.slice(1).split('?')[0]
  if (hash === 'bookmarks') return 'bookmarks'
  if (hash === 'questions') return 'questions'
  if (hash === 'history') return 'history'
  return 'start'
}

const stage1Questions = (stage1Data as Question[]).filter(q => !q.removed)
const stage2Questions = (stage2Data as Question[]).filter(q => !q.removed)
// Includes removed questions so history detail can still show them
const allQuestionsForHistory = new Map(
  [...(stage1Data as Question[]), ...(stage2Data as Question[])].map(q => [q.id, q])
)

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => getRouteFromHash())
  const [stage, setStage] = useState<Stage>('stage2')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [isMock, setIsMock] = useState(false)
  const [quizType, setQuizType] = useState<TestType>('practice')
  const [timeLeft, setTimeLeft] = useState(0)
  const [timesUp, setTimesUp] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null)
  const activeQuestions = stage === 'stage1' ? stage1Questions : stage2Questions
  const activeIds = new Set(activeQuestions.map(q => q.id))
  const { cycle, remove, getLevel, countByLevel, totalBookmarked } = useBookmarks(activeIds, stage)
  const { records: historyRecords, addRecord } = useHistory(stage)
  const resultSaved = useRef(false)

  useEffect(() => {
    const handler = () => {
      const route = getRouteFromHash()
      setAppState(prev => {
        if (prev === 'quiz' || prev === 'result') return prev
        return route
      })
    }
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  useEffect(() => {
    if (appState !== 'quiz' || !isMock) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setTimesUp(true)
          setAppState('result')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [appState, isMock])

  // Save result to history when transitioning to result screen
  useEffect(() => {
    if (appState === 'result' && !resultSaved.current && answers.length > 0) {
      resultSaved.current = true
      const score = answers.filter(a => a.userAnswer === a.question.answer).length
      addRecord({
        dateTime: new Date().toISOString(),
        type: quizType,
        questionCount: answers.length,
        score,
        answers: answers.map(a => ({ questionId: a.question.id, userAnswer: a.userAnswer })),
      })
    }
    if (appState !== 'result') {
      resultSaved.current = false
    }
  }, [appState, answers, quizType, addRecord])

  const startQuiz = useCallback((count: number) => {
    setQuestions(shuffle(activeQuestions).slice(0, count))
    setCurrentIndex(0)
    setAnswers([])
    setQuizType('practice')
    setAppState('quiz')
  }, [activeQuestions])

  const startBookmarked = useCallback((level?: 2) => {
    const pool = level
      ? activeQuestions.filter((q) => getLevel(q.id) === level)
      : activeQuestions.filter((q) => getLevel(q.id) >= 1)
    setQuestions(shuffle(pool))
    setCurrentIndex(0)
    setAnswers([])
    setQuizType(level === 2 ? 'important' : 'bookmarked')
    setAppState('quiz')
  }, [activeQuestions, getLevel])

  const handleAnswer = useCallback((userAnswer: boolean) => {
    const question = questions[currentIndex]
    const newAnswers = [...answers, { question, userAnswer }]
    setAnswers(newAnswers)
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setAppState('result')
    }
  }, [questions, currentIndex, answers])

  const startMock = useCallback(() => {
    setQuestions(shuffle(activeQuestions).slice(0, 50))
    setCurrentIndex(0)
    setAnswers([])
    setIsMock(true)
    setQuizType('mock')
    setTimesUp(false)
    setTimeLeft(30 * 60)
    setAppState('quiz')
  }, [activeQuestions])

  const restart = useCallback(() => {
    setIsMock(false)
    setTimesUp(false)
    setTimeLeft(0)
    window.location.hash = ''
    setAppState('start')
  }, [])

  const goToBookmarks = useCallback(() => {
    window.location.hash = 'bookmarks'
    setAppState('bookmarks')
  }, [])

  const goToQuestions = useCallback(() => {
    window.location.hash = 'questions'
    setAppState('questions')
  }, [])

  const goToHistory = useCallback(() => {
    window.location.hash = 'history'
    setAppState('history')
  }, [])

  const goBack = useCallback(() => {
    window.location.hash = ''
    setAppState('start')
  }, [])

  const openHistoryDetail = useCallback((record: TestRecord) => {
    setSelectedRecord(record)
    setAppState('history-detail')
  }, [])

  const goBackToHistory = useCallback(() => {
    window.location.hash = 'history'
    setAppState('history')
  }, [])

  if (appState === 'questions') {
    return (
      <QuestionsScreen
        stage1Questions={stage1Questions}
        stage2Questions={stage2Questions}
        getLevel={getLevel}
        onCycleBookmark={cycle}
        onBack={goBack}
      />
    )
  }

  if (appState === 'bookmarks') {
    return (
      <BookmarkScreen
        questions={[...stage1Questions, ...stage2Questions]}
        getLevel={getLevel}
        onCycleBookmark={cycle}
        onRemoveBookmark={remove}
        onBack={goBack}
      />
    )
  }

  if (appState === 'history') {
    return (
      <HistoryScreen
        records={historyRecords}
        onSelect={openHistoryDetail}
        onBack={goBack}
      />
    )
  }

  if (appState === 'history-detail' && selectedRecord) {
    const reconstructed: UserAnswer[] = selectedRecord.answers
      .map(a => {
        const question = allQuestionsForHistory.get(a.questionId)
        if (!question) return null
        return { question, userAnswer: a.userAnswer }
      })
      .filter((a): a is UserAnswer => a !== null)

    return (
      <ResultScreen
        answers={reconstructed}
        getLevel={getLevel}
        onCycleBookmark={cycle}
        onRestart={goBackToHistory}
        timesUp={false}
        restartLabel="Back to History"
      />
    )
  }

  if (appState === 'start') {
    return (
      <StartScreen
        stage={stage}
        onStageChange={setStage}
        totalAvailable={activeQuestions.length}
        totalBookmarked={totalBookmarked}
        importantCount={countByLevel(2)}
        historyCount={historyRecords.length}
        onStart={startQuiz}
        onStartMock={startMock}
        onStartBookmarked={() => startBookmarked()}
        onStartImportant={() => startBookmarked(2)}
        onViewBookmarks={goToBookmarks}
        onViewQuestions={goToQuestions}
        onViewHistory={goToHistory}
      />
    )
  }

  if (appState === 'quiz') {
    return (
      <QuizScreen
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={questions.length}
        onAnswer={handleAnswer}
        getLevel={getLevel}
        onCycleBookmark={cycle}
        onQuit={restart}
        timeLeft={isMock ? timeLeft : undefined}
        isMock={isMock}
      />
    )
  }

  return (
    <ResultScreen
      answers={answers}
      getLevel={getLevel}
      onCycleBookmark={cycle}
      onRestart={restart}
      timesUp={timesUp}
    />
  )
}
