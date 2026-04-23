export interface QuestionMeta {
  id: string;
  image?: string;
  createdDate?: string;
  removed?: boolean;
  description: string;
}

export type QuestionData = {
  question: string;
  answer: boolean;
};

export interface Question extends QuestionData, QuestionMeta {}

export interface ScenarioQuestion extends QuestionMeta {
  scenario: string;
  questions: QuestionData[];
}

export type AnyQuestion = Question | ScenarioQuestion;

export function isScenarioQuestion(q: AnyQuestion): q is ScenarioQuestion {
  return "scenario" in q;
}
