import { QuestionMeta } from "../types";

function getDateLabel(isoDate: string): string | null {
  const now = new Date();
  const created = new Date(isoDate);
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) return "Today";
  if (diffHours < 48) return "Yesterday";
  return null;
}

interface Props {
  question: Pick<QuestionMeta, "id" | "createdDate">;
}

export default function QuestionIdBadge({ question }: Props) {
  const label = question.createdDate ? getDateLabel(question.createdDate) : null;
  return (
    <span className="text-xs font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded">
      {question.id}
      {label && <> ({label})</>}
    </span>
  );
}
