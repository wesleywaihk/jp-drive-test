import { useState } from "react";
import { Question } from "../types";
import { BookmarkLevel } from "../useBookmarks";
import QuestionIdBadge from "./QuestionIdBadge";

interface Props {
  stage1Questions: Question[];
  stage2Questions: Question[];
  getLevel: (id: string) => BookmarkLevel;
  onCycleBookmark: (id: string) => void;
  onBack: () => void;
}

const BOOKMARK_ICON: Record<BookmarkLevel, string> = {
  0: "🏷️",
  1: "🔖",
  2: "⭐",
};
const BOOKMARK_TITLE: Record<BookmarkLevel, string> = {
  0: "Bookmark",
  1: "Mark as very important",
  2: "Toggle bookmark",
};
const PAGE_SIZE = 20;

type Tab = "stage1" | "stage2";

function getStateFromHash(): { tab: Tab; page: number } {
  const query = window.location.hash.split('?')[1] || ''
  const params = new URLSearchParams(query)
  const tab = params.get('tab') === 'stage1' ? 'stage1' : 'stage2'
  const page = parseInt(params.get('page') || '1', 10)
  return { tab, page: isNaN(page) || page < 1 ? 1 : page }
}

function Pagination({
  page,
  total,
  onPage,
}: {
  page: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 my-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition-colors"
      >
        ← Prev
      </button>
      <span className="text-sm text-gray-500 px-2">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  getLevel,
  onCycleBookmark,
}: {
  question: Question;
  index: number;
  getLevel: (id: string) => BookmarkLevel;
  onCycleBookmark: (id: string) => void;
}) {
  const level = getLevel(question.id);
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">#{index}</span>
          <QuestionIdBadge question={question} />
        </div>
        <button
          onClick={() => onCycleBookmark(question.id)}
          className="text-2xl leading-none transition-transform active:scale-90"
          title={BOOKMARK_TITLE[level]}
        >
          {BOOKMARK_ICON[level]}
        </button>
      </div>

      <p className="text-gray-800 text-lg font-medium leading-relaxed mb-3">
        {question.question}
      </p>

      {question.image && (
        <div className="mb-3 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={import.meta.env.BASE_URL + question.image}
            alt="Question illustration"
            className="w-full object-contain max-h-48"
          />
        </div>
      )}

      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold mb-3 ${question.answer ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
      >
        {question.answer ? "⭕ True" : "✕ False"}
      </div>

      <div className="bg-blue-50 rounded-lg px-3 py-2">
        <p className="text-xs font-semibold text-blue-600 mb-1">Explanation</p>
        <p
          className="text-lg text-gray-700"
          dangerouslySetInnerHTML={{ __html: question.description }}
        />
      </div>
    </div>
  );
}

export default function QuestionsScreen({
  stage1Questions,
  stage2Questions,
  getLevel,
  onCycleBookmark,
  onBack,
}: Props) {
  const initial = getStateFromHash()
  const [activeTab, setActiveTab] = useState<Tab>(initial.tab);
  const [page, setPage] = useState(initial.page);

  const questions = activeTab === "stage1" ? stage1Questions : stage2Questions;

  const start = (page - 1) * PAGE_SIZE;
  const pageQuestions = questions.slice(start, start + PAGE_SIZE);

  function updateHash(tab: Tab, p: number) {
    const params = new URLSearchParams({ tab, page: String(p) })
    history.replaceState(null, '', '#questions?' + params.toString())
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setPage(1);
    updateHash(tab, 1);
  }

  function handlePage(p: number) {
    setPage(p);
    updateHash(activeTab, p);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none transition-colors"
            title="Back"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">All Questions</h1>
          <span className="ml-auto text-sm text-gray-400">
            {questions.length} questions
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => handleTabChange("stage1")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "stage1"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Stage 1
            <span className="ml-1.5 text-xs font-normal opacity-70">
              ({stage1Questions.length})
            </span>
          </button>
          <button
            onClick={() => handleTabChange("stage2")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "stage2"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Stage 2
            <span className="ml-1.5 text-xs font-normal opacity-70">
              ({stage2Questions.length})
            </span>
          </button>
        </div>

        <Pagination page={page} total={questions.length} onPage={handlePage} />

        {/* Question cards */}
        <div className="space-y-4">
          {pageQuestions.map((question, i) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={start + i + 1}
              getLevel={getLevel}
              onCycleBookmark={onCycleBookmark}
            />
          ))}
        </div>

        <Pagination page={page} total={questions.length} onPage={handlePage} />
      </div>
    </div>
  );
}
