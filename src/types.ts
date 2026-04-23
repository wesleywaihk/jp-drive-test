export type QuestionData = {
  question: string;
  answer: boolean;
  description: string;
};
export interface Question extends QuestionData {
  id: string;
  image?: string;
  createdDate?: string;
  removed?: boolean;
  isScenario?: boolean;
  scenario?: string;
  scenarioQuestions?: QuestionData[];
}
