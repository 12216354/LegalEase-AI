import { getGeminiClient } from './geminiClient.ts';
import { CONFIG } from './config.ts';
import { validateInput, cleanJsonString, QuizQuestion, QuizResponseData } from './schemas.ts';
import { Type } from '@google/genai';

function validateAndNormalizeQuiz(data: any): QuizQuestion[] {
  if (!data || !Array.isArray(data.questions)) {
    throw new Error('Invalid quiz response structure: missing "questions" array.');
  }

  const rawQuestions = data.questions;
  if (rawQuestions.length < 3) {
    throw new Error(`Quiz contains only ${rawQuestions.length} questions. Exactly 3 questions are required.`);
  }

  // Slice to exactly 3 questions
  const selectedQuestions = rawQuestions.slice(0, 3);
  const validated: QuizQuestion[] = [];

  for (let i = 0; i < 3; i++) {
    const q = selectedQuestions[i];
    if (!q || typeof q.question !== 'string' || !q.question.trim()) {
      throw new Error(`Question #${i + 1} is missing valid question text.`);
    }

    if (!Array.isArray(q.options) || q.options.length < 4) {
      throw new Error(`Question #${i + 1} must have exactly 4 options.`);
    }

    const options = q.options.slice(0, 4).map((opt: any) => String(opt).trim());
    if (options.some((opt: string) => !opt)) {
      throw new Error(`Question #${i + 1} has empty options.`);
    }

    let answer = String(q.answer || '').trim();
    // In case model returned "A", "B", "C", "D" or index
    if (answer === 'A' || answer === '0') answer = options[0];
    else if (answer === 'B' || answer === '1') answer = options[1];
    else if (answer === 'C' || answer === '2') answer = options[2];
    else if (answer === 'D' || answer === '3') answer = options[3];

    // Ensure answer is in options
    const foundIndex = options.findIndex(
      (opt: string) => opt.toLowerCase() === answer.toLowerCase()
    );

    if (foundIndex !== -1) {
      answer = options[foundIndex];
    } else {
      // Default to first option if not explicitly matched
      answer = options[0];
    }

    const explanation = typeof q.explanation === 'string' && q.explanation.trim()
      ? q.explanation.trim()
      : `The correct answer is: "${answer}".`;

    validated.push({
      question: q.question.trim(),
      options,
      answer,
      explanation,
    });
  }

  return validated;
}

export async function handleQuizRequest(
  inputText: string,
  difficulty: string = 'medium'
): Promise<QuizResponseData> {
  const topic = validateInput(inputText, 'Quiz topic');
  const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())
    ? difficulty.toLowerCase()
    : 'medium';

  const ai = getGeminiClient();

  const prompt = `You are EduGenie's quiz generator.

Generate EXACTLY 3 multiple-choice questions about:
Topic: ${topic}
Difficulty: ${validDifficulty}

Rules:
- Exactly 3 questions.
- Exactly 4 options per question.
- Only one correct answer.
- The "answer" field must be the exact text of the correct option from the options array.
- Include a short, clear pedagogical explanation for why the answer is correct.
- Return ONLY valid JSON adhering to the schema.
- Do not use Markdown code fences.
- Do not add any text before or after the JSON.`;

  // Attempt 1: Schema-enforced JSON generation
  try {
    const response = await ai.models.generateContent({
      model: CONFIG.geminiModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'answer', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(cleanJsonString(rawText));
    const questions = validateAndNormalizeQuiz(parsed);

    return {
      topic,
      difficulty: validDifficulty,
      questions,
    };
  } catch (firstErr) {
    // Attempt 2: Text extraction with fallback prompt if first attempt encountered schema glitch
    const fallbackResponse = await ai.models.generateContent({
      model: CONFIG.geminiModel,
      contents: `Generate a 3-question multiple choice quiz on "${topic}" (${validDifficulty} difficulty) as a JSON object: {"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "answer": "...", "explanation": "..."}]}. Return only JSON.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const fallbackRaw = fallbackResponse.text || '{}';
    try {
      const parsedFallback = JSON.parse(cleanJsonString(fallbackRaw));
      const questions = validateAndNormalizeQuiz(parsedFallback);
      return {
        topic,
        difficulty: validDifficulty,
        questions,
      };
    } catch (secondErr) {
      throw new Error(`Failed to generate a valid 3-question quiz for "${topic}". Please try again or rephrase the topic.`);
    }
  }
}
