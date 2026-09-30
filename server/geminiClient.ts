import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import { CONFIG } from './config.ts';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = CONFIG.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your environment variables or Secrets panel.');
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiInstance;
}

export async function generateWithFallback(
  params: Omit<GenerateContentParameters, 'model'>,
  preferredModel?: string
): Promise<GenerateContentResponse> {
  const ai = getGeminiClient();
  const primaryModel = preferredModel || CONFIG.geminiModel || 'gemini-3.8-flash';
  const fallbackModel = 'gemini-flash-latest';

  try {
    return await ai.models.generateContent({
      ...params,
      model: primaryModel,
    });
  } catch (err: any) {
    const msg = err?.message || '';
    // If high demand or transient 503, retry with fallback model
    if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
      console.warn(`[EduGenie] ${primaryModel} hit 503 high demand. Retrying with ${fallbackModel}...`);
      await new Promise((res) => setTimeout(res, 800));
      return await ai.models.generateContent({
        ...params,
        model: fallbackModel,
      });
    }
    throw err;
  }
}
