import { useState, useCallback, useEffect } from 'react'
import questionsData from './questions.json'
import specialQuestionsData from './special-questions.json'
import { Question } from './types'
import { useBookmarks } from './useBookmarks'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import StartScreen from './components/StartScreen'
import BookmarkScreen from './components/BookmarkScreen'
import QuestionsScreen from './components/QuestionsScreen'

type UserAnswer = { question: Question; userAnswer: boolean }
type AppState = 'start' | 'quiz' | 'result' | 'bookmarks' | 'questions'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const normalQuestions = questionsData as Question[]
const specialQuestions = specialQuestionsData as Question[]
const allQuestions = [...normalQuestions, ...specialQuestions]

export default function App() {
  const [appState, setAppState] = useState<AppState>('start')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [isMock, setIsMock] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timesUp, setTimesUp] = useState(false)
  const { cycle, remove, getLevel, countByLevel, totalBookmarked } = useBookmarks()

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

  const startQuiz = useCallback((count: number) => {
    setQuestions(shuffle(allQuestions).slice(0, count))
    setCurrentIndex(0)
    setAnswers([])
    setAppState('quiz')
  }, [])

  const startBookmarked = useCallback((level?: 2) => {
    const pool = level
      ? allQuestions.filter((q) => getLevel(q.id) === level)
      : allQuestions.filter((q) => getLevel(q.id) >= 1)
    setQuestions(shuffle(pool))
    setCurrentIndex(0)
    setAnswers([])
    setAppState('quiz')
  }, [getLevel])

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
    setQuestions(shuffle(allQuestions).slice(0, 50))
    setCurrentIndex(0)
    setAnswers([])
    setIsMock(true)
    setTimesUp(false)
    setTimeLeft(30 * 60)
    setAppState('quiz')
  }, [])

  const restart = useCallback(() => {
    setIsMock(false)
    setTimesUp(false)
    setTimeLeft(0)
    setAppState('start')
  }, [])

  if (appState === 'questions') {
    return (
      <QuestionsScreen
        normalQuestions={normalQuestions}
        specialQuestions={specialQuestions}
        getLevel={getLevel}
        onCycleBookmark={cycle}
        onBack={() => setAppState('start')}
      />
    )
  }

  if (appState === 'bookmarks') {
    return (
      <BookmarkScreen
        questions={allQuestions}
        getLevel={getLevel}
        onCycleBookmark={cycle}
        onRemoveBookmark={remove}
        onBack={() => setAppState('start')}
      />
    )
  }

  if (appState === 'start') {
    return (
      <StartScreen
        totalAvailable={allQuestions.length}
        totalBookmarked={totalBookmarked}
        importantCount={countByLevel(2)}
        onStart={startQuiz}
        onStartMock={startMock}
        onStartBookmarked={() => startBookmarked()}
        onStartImportant={() => startBookmarked(2)}
        onViewBookmarks={() => setAppState('bookmarks')}
        onViewQuestions={() => setAppState('questions')}
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
