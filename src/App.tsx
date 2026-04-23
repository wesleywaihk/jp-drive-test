import { useState, useCallback, useEffect, useRef } from 'react'
import stage1Data from './stage-1.json'
import stage2Data from './stage-2.json'
import scenarioData from './scenario.json'
import { Question, ScenarioQuestion, AnyQuestion, isScenarioQuestion } from './types'
import { useBookmarks } from './useBookmarks'
import { useHistory, TestRecord, TestType } from './useHistory'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import StartScreen from './components/StartScreen'
import BookmarkScreen from './components/BookmarkScreen'
import QuestionsScreen from './components/QuestionsScreen'
import HistoryScreen from './components/HistoryScreen'

type UserAnswer = { question: AnyQuestion; userAnswer: boolean; subAnswers?: boolean[] }
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
const scenarioQuestions = (scenarioData as ScenarioQuestion[]).filter(q => !q.removed)
const stage2AllQuestions: AnyQuestion[] = [...stage2Questions, ...scenarioQuestions]

const allQuestionsForHistory = new Map<string, AnyQuestion>(
  [...(stage1Data as Question[]), ...(stage2Data as Question[]), ...(scenarioData as ScenarioQuestion[])].map(q => [q.id, q])
)

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => getRouteFromHash())
  const [stage, setStage] = useState<Stage>('stage2')
  const [questions, setQuestions] = useState<AnyQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [isMock, setIsMock] = useState(false)
  const [quizType, setQuizType] = useState<TestType>('practice')
  const [timeLeft, setTimeLeft] = useState(0)
  const [timesUp, setTimesUp] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null)

  const activeQuestions: AnyQuestion[] = stage === 'stage1' ? stage1Questions : stage2AllQuestions
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

  useEffect(() => {
    if (appState === 'result' && !resultSaved.current && answers.length > 0) {
      resultSaved.current = true
      const score = answers.reduce((sum, a) => {
        const pts = isScenarioQuestion(a.question) ? 2 : 1
        const correct = isScenarioQuestion(a.question) ? a.userAnswer : a.userAnswer === a.question.answer
        return sum + (correct ? pts : 0)
      }, 0)
      const questionCount = answers.reduce((sum, a) => sum + (isScenarioQuestion(a.question) ? 2 : 1), 0)
      addRecord({
        dateTime: new Date().toISOString(),
        type: quizType,
        questionCount,
        score,
        answers: answers.map(a => ({ questionId: a.question.id, userAnswer: a.userAnswer, subAnswers: a.subAnswers })),
      })
    }
    if (appState !== 'result') {
      resultSaved.current = false
    }
  }, [appState, answers, quizType, addRecord])

  const startQuiz = useCallback((count: number) => {
    let picked: AnyQuestion[]
    if (stage === 'stage2') {
      const pool = stage2AllQuestions
      if (pool.length >= count) {
        picked = shuffle(pool).slice(0, count)
      } else {
        const extra = shuffle(stage1Questions).slice(0, count - pool.length)
        picked = shuffle([...pool, ...extra])
      }
    } else {
      picked = shuffle(activeQuestions).slice(0, count)
    }
    setQuestions(picked)
    setCurrentIndex(0)
    setAnswers([])
    setQuizType('practice')
    setAppState('quiz')
  }, [stage, stage2AllQuestions, activeQuestions])

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

  const handleAnswer = useCallback((userAnswer: boolean, subAnswers?: boolean[]) => {
    const question = questions[currentIndex]
    const newAnswers = [...answers, { question, userAnswer, subAnswers }]
    setAnswers(newAnswers)
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setAppState('result')
    }
  }, [questions, currentIndex, answers])

  const startMock = useCallback(() => {
    let picked: AnyQuestion[]
    if (stage === 'stage2') {
      let regularPicked: AnyQuestion[]
      if (stage2Questions.length >= 90) {
        regularPicked = shuffle(stage2Questions).slice(0, 90)
      } else {
        const extra = shuffle(stage1Questions).slice(0, 90 - stage2Questions.length)
        regularPicked = shuffle([...stage2Questions, ...extra])
      }
      const scenarioPicked = shuffle(scenarioQuestions).slice(0, 5)
      picked = [...regularPicked, ...scenarioPicked]
    } else {
      picked = shuffle(activeQuestions).slice(0, 50)
    }
    setQuestions(picked)
    setCurrentIndex(0)
    setAnswers([])
    setIsMock(true)
    setQuizType('mock')
    setTimesUp(false)
    setTimeLeft(stage === 'stage2' ? 50 * 60 : 30 * 60)
    setAppState('quiz')
  }, [activeQuestions, stage])

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
        stage2Questions={stage2AllQuestions}
        getLevel={getLevel}
        onCycleBookmark={cycle}
        onBack={goBack}
      />
    )
  }

  if (appState === 'bookmarks') {
    return (
      <BookmarkScreen
        questions={[...stage1Questions, ...stage2Questions, ...scenarioQuestions]}
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
