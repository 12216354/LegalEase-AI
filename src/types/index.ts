export type TaskType = 'qa' | 'explain' | 'quiz' | 'summarize' | 'recommendations' | 'about';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuizResponseData {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface ExplanationSections {
  definition: string;
  coreConcept: string;
  stepByStep: string;
  example: string;
  importantPoints: string;
  commonMistakes: string;
  quickRecap: string;
}

export interface ExplanationResponseData {
  topic: string;
  level: string;
  preference: string;
  answer: string;
  sections?: ExplanationSections;
}

export interface SummarySections {
  mainIdea: string;
  keyPoints: string[];
  importantTerms: Array<{ term: string; definition: string }>;
  importantFacts: string[];
  quickRevision: string;
}

export interface SummaryResponseData {
  summary: string;
  structured?: SummarySections;
}

export interface RecommendationTopic {
  topic: string;
  category: string;
  whyItMatters: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  estimatedTime: string;
  nextTopic: string;
}

export interface RecommendationResponseData {
  topic: string;
  level: string;
  goal: string;
  studyTime: string;
  recommendations: RecommendationTopic[];
  overview?: string;
}

export interface RecentItem {
  id: string;
  type: TaskType;
  title: string;
  timestamp: number;
  preview: string;
  data: any;
}
