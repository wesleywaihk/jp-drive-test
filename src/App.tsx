import { useState, useCallback } from 'react'
import questionsData from './questions.json'
import { Question } from './types'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import StartScreen from './components/StartScreen'

type UserAnswer = { question: Question; userAnswer: boolean }
type AppState = 'start' | 'quiz' | 'result'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const allQuestions = questionsData as Question[]

export default function App() {
  const [appState, setAppState] = useState<AppState>('start')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])

  const startQuiz = useCallback((count: number) => {
    setQuestions(shuffle(allQuestions).slice(0, count))
    setCurrentIndex(0)
    setAnswers([])
    setAppState('quiz')
  }, [])

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

  const restart = useCallback(() => {
    setAppState('start')
  }, [])

  if (appState === 'start') {
    return <StartScreen totalAvailable={allQuestions.length} onStart={startQuiz} />
  }

  if (appState === 'quiz') {
    return (
      <QuizScreen
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    )
  }

  return <ResultScreen answers={answers} onRestart={restart} />
}
