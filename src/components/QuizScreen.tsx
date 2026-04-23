import { useState, useEffect } from "react";
import { AnyQuestion, Question, isScenarioQuestion } from "../types";
import { BookmarkLevel } from "../useBookmarks";
import QuestionIdBadge from "./QuestionIdBadge";

interface Props {
  question: AnyQuestion;
  current: number;
  total: number;
  onAnswer: (answer: boolean, subAnswers?: boolean[]) => void;
  getLevel: (id: string) => BookmarkLevel;
  onCycleBookmark: (id: string) => void;
  onQuit: () => void;
  timeLeft?: number;
  isMock?: boolean;
}

const BOOKMARK_ICON: Record<BookmarkLevel, string> = {
  0: "🏷️",
  1: "🔖",
  2: "⭐",
};
const BOOKMARK_TITLE: Record<BookmarkLevel, string> = {
  0: "Bookmark",
  1: "Mark as very important",
  2: "Remove bookmark",
};

export default function QuizScreen({
  question,
  current,
  total,
  onAnswer,
  getLevel,
  onCycleBookmark,
  onQuit,
  timeLeft,
  isMock,
}: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [scenarioSubIndex, setScenarioSubIndex] = useState(0);
  const [scenarioSubAnswers, setScenarioSubAnswers] = useState<boolean[]>([]);
  const [subSelected, setSubSelected] = useState<boolean | null>(null);

  const sq = isScenarioQuestion(question) ? question : null;
  const nq = sq === null ? (question as Question) : null;
  const subQuestions = sq ? sq.questions.slice(0, 3) : [];

  const progress = (current / total) * 100;
  const isCorrect = nq !== null && selected === nq.answer;
  const level = getLevel(question.id);

  useEffect(() => {
    setSelected(null);
    setScenarioSubIndex(0);
    setScenarioSubAnswers([]);
    setSubSelected(null);
  }, [question.id]);

  function handleSelect(value: boolean) {
    if (selected !== null) return;
    if (isMock) {
      onAnswer(value);
      return;
    }
    setSelected(value);
  }

  function handleNext() {
    const answer = selected!;
    setSelected(null);
    onAnswer(answer);
  }
  const currentSubQ = subQuestions[scenarioSubIndex];
  const isSubCorrect =
    subSelected !== null &&
    currentSubQ != null &&
    subSelected === currentSubQ.answer;

  function handleSubAnswer(value: boolean) {
    if (subSelected !== null) return;
    const newSubAnswers = [...scenarioSubAnswers, value];

    if (isMock) {
      if (scenarioSubIndex + 1 < subQuestions.length) {
        setScenarioSubIndex((s) => s + 1);
      } else {
        const allCorrect = newSubAnswers.every(
          (ans, i) => ans === subQuestions[i].answer,
        );
        onAnswer(allCorrect, newSubAnswers);
      }
    } else {
      setSubSelected(value);
      setScenarioSubAnswers(newSubAnswers);
    }
  }

  function handleSubNext() {
    const isLastSub = scenarioSubIndex + 1 >= subQuestions.length;
    if (isLastSub) {
      const allCorrect = scenarioSubAnswers.every(
        (ans, i) => ans === subQuestions[i].answer,
      );
      setSubSelected(null);
      onAnswer(allCorrect, scenarioSubAnswers);
    } else {
      setScenarioSubIndex((s) => s + 1);
      setSubSelected(null);
    }
  }

  const isScenario = sq !== null && subQuestions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {current} of {total}
          </span>
          <div className="flex items-center gap-3">
            {timeLeft !== undefined && (
              <span
                className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 60 ? "text-red-600 animate-pulse" : timeLeft <= 300 ? "text-orange-500" : "text-gray-600"}`}
              >
                ⏱{" "}
                {Math.floor(timeLeft / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            )}
            <span className="text-sm font-medium text-red-600">
              {Math.round(progress)}%
            </span>
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
        {isScenario ? (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                Scenario
              </p>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {scenarioSubIndex + 1} / {subQuestions.length}
              </span>
            </div>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {sq?.scenario}
            </p>
            {question.image && (
              <div className="mb-4 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={import.meta.env.BASE_URL + question.image}
                  alt="Scenario illustration"
                  className="w-full object-contain max-h-48"
                />
              </div>
            )}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                Question {scenarioSubIndex + 1}
              </p>
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentSubQ?.question}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                Question
              </p>
            </div>
            <p className="text-gray-800 text-lg leading-relaxed">
              {nq?.question}
            </p>

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
        )}

        {/* Answer buttons */}
        {isScenario ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleSubAnswer(true)}
              disabled={subSelected !== null}
              className={`font-bold py-5 rounded-2xl text-xl shadow-md transition-colors
                ${
                  subSelected === null
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white"
                    : subSelected === true
                      ? isSubCorrect
                        ? "bg-green-500 text-white ring-4 ring-green-300"
                        : "bg-green-200 text-green-700"
                      : "bg-gray-100 text-gray-400"
                }`}
            >
              ⭕ True
            </button>
            <button
              onClick={() => handleSubAnswer(false)}
              disabled={subSelected !== null}
              className={`font-bold py-5 rounded-2xl text-xl shadow-md transition-colors
                ${
                  subSelected === null
                    ? "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white"
                    : subSelected === false
                      ? isSubCorrect
                        ? "bg-red-500 text-white ring-4 ring-red-300"
                        : "bg-red-200 text-red-700"
                      : "bg-gray-100 text-gray-400"
                }`}
            >
              ✕ False
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleSelect(true)}
              disabled={selected !== null}
              className={`font-bold py-5 rounded-2xl text-xl shadow-md transition-colors
                ${
                  selected === null
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white"
                    : selected === true
                      ? isCorrect
                        ? "bg-green-500 text-white ring-4 ring-green-300"
                        : "bg-green-200 text-green-700"
                      : "bg-gray-100 text-gray-400"
                }`}
            >
              ⭕ True
            </button>
            <button
              onClick={() => handleSelect(false)}
              disabled={selected !== null}
              className={`font-bold py-5 rounded-2xl text-xl shadow-md transition-colors
                ${
                  selected === null
                    ? "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white"
                    : selected === false
                      ? isCorrect
                        ? "bg-red-500 text-white ring-4 ring-red-300"
                        : "bg-red-200 text-red-700"
                      : "bg-gray-100 text-gray-400"
                }`}
            >
              ✕ False
            </button>
          </div>
        )}

        {/* Scenario sub-question feedback (practice mode) */}
        {isScenario && subSelected !== null && !isMock && (
          <div className="space-y-3">
            <div
              className={`rounded-2xl p-4 ${isSubCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p
                  className={`font-bold text-lg ${isSubCorrect ? "text-green-700" : "text-red-700"}`}
                >
                  {isSubCorrect ? "⭕ Correct!" : "❌ Incorrect"}
                </p>
                {scenarioSubIndex + 1 >= subQuestions.length && (
                  <button
                    onClick={() => onCycleBookmark(question.id)}
                    className="text-2xl leading-none transition-transform active:scale-90"
                    title={BOOKMARK_TITLE[level]}
                  >
                    {BOOKMARK_ICON[level]}
                  </button>
                )}
              </div>
              {!isSubCorrect && (
                <p className="text-sm text-gray-600 mb-2">
                  Correct answer:{" "}
                  <span className="font-semibold">
                    {currentSubQ?.answer ? "True ⭕" : "False ✕"}
                  </span>
                </p>
              )}
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                Explanation
              </p>
              <p
                className="text-lg text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: question.description,
                }}
              />
            </div>

            <button
              onClick={handleSubNext}
              className="w-full bg-gray-800 hover:bg-gray-900 active:bg-black text-white font-bold py-4 rounded-2xl text-lg shadow-md transition-colors"
            >
              {scenarioSubIndex + 1 < subQuestions.length
                ? `Next Sub-question (${scenarioSubIndex + 2}/${subQuestions.length}) →`
                : current < total
                  ? "Next Question →"
                  : "See Results"}
            </button>
          </div>
        )}

        {/* Normal question feedback (practice mode) */}
        {!isScenario && selected !== null && !isMock && (
          <div className="space-y-3">
            <div
              className={`rounded-2xl p-4 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p
                  className={`font-bold text-lg ${isCorrect ? "text-green-700" : "text-red-700"}`}
                >
                  {isCorrect ? "⭕ Correct!" : "❌ Incorrect"}
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
                  Correct answer:{" "}
                  <span className="font-semibold">
                    {nq?.answer ? "True ⭕" : "False ✕"}
                  </span>
                </p>
              )}
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                Explanation{" "}
                <QuestionIdBadge question={question} />
              </p>
              <p
                className="text-lg text-gray-700"
                dangerouslySetInnerHTML={{ __html: nq?.description ?? "" }}
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-gray-800 hover:bg-gray-900 active:bg-black text-white font-bold py-4 rounded-2xl text-lg shadow-md transition-colors"
            >
              {current < total ? "Next Question →" : "See Results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
