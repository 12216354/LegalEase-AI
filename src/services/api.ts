import {
  QuizResponseData,
  ExplanationResponseData,
  SummaryResponseData,
  RecommendationResponseData,
} from '../types/index.ts';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Could not connect to EduGenie server. Please check your network or server status.');
    }
    throw err;
  }
}

export const api = {
  getHealth: async () => {
    return request<{ status: string; service: string; version: string; model: string }>('/health');
  },

  askQuestion: async (text: string): Promise<{ question: string; answer: string }> => {
    return request<{ question: string; answer: string }>('/qa', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  explainConcept: async (
    text: string,
    level: string = 'beginner',
    preference: string = 'simple'
  ): Promise<ExplanationResponseData> => {
    return request<ExplanationResponseData>('/explain', {
      method: 'POST',
      body: JSON.stringify({ text, level, preference }),
    });
  },

  generateQuiz: async (
    text: string,
    difficulty: string = 'medium'
  ): Promise<QuizResponseData> => {
    return request<QuizResponseData>('/quiz', {
      method: 'POST',
      body: JSON.stringify({ text, difficulty }),
    });
  },

  summarizeText: async (
    text: string,
    length: string = 'medium'
  ): Promise<SummaryResponseData> => {
    return request<SummaryResponseData>('/summarize', {
      method: 'POST',
      body: JSON.stringify({ text, length }),
    });
  },

  getRecommendations: async (
    topic: string,
    level: string = 'beginner',
    goal: string = 'skill development',
    studyTime: string = '30 minutes/day'
  ): Promise<RecommendationResponseData> => {
    return request<RecommendationResponseData>('/learn/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        level,
        goal,
        study_time: studyTime,
      }),
    });
  },
};
