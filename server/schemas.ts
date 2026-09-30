import { CONFIG } from './config.ts';

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
  sections: ExplanationSections;
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
  category: string; // e.g. "Prerequisites", "Fundamentals", "Core Concepts", "Practical Examples", "Intermediate Topics", "Advanced Topics", "Practice / Projects", "Revision"
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

export function validateInput(text: unknown, fieldName = 'Input'): string {
  if (typeof text !== 'string') {
    throw new Error(`${fieldName} must be a text string.`);
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(`Please provide a valid ${fieldName.toLowerCase()}. Input cannot be empty.`);
  }

  if (trimmed.length > CONFIG.maxInputLength) {
    throw new Error(`${fieldName} exceeds maximum allowed length of ${CONFIG.maxInputLength} characters (received ${trimmed.length} characters).`);
  }

  return trimmed;
}

export function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '');
  }

  return cleaned.trim();
}

export function formatFriendlyErrorMessage(err: any, fallback = 'Something went wrong. Please try again.'): string {
  const msg = err?.message || String(err || '');
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
    return 'Google Gemini AI is currently experiencing high demand. Please wait a moment and try again.';
  }
  if (msg.includes('API key') || msg.includes('GEMINI_API_KEY')) {
    return 'Gemini AI API key is not configured or invalid on the server.';
  }
  if (msg.includes('exceeds maximum') || msg.includes('cannot be empty')) {
    return msg;
  }
  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) {
      if (parsed.error.code === 503) {
        return 'Google Gemini AI is currently experiencing high demand. Please try again shortly.';
      }
      return parsed.error.message;
    }
  } catch {}

  return msg.length > 200 ? fallback : msg;
}

