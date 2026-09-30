import { generateWithFallback } from './geminiClient.ts';
import { validateInput } from './schemas.ts';

export async function handleQnARequest(inputText: string): Promise<{ answer: string; question: string }> {
  const question = validateInput(inputText, 'Question');

  const systemInstruction = `You are EduGenie, an AI-powered educational assistant designed to help students understand concepts clearly and learn effectively.
Answer accurately.
Use simple, clear language.
Explain difficult topics step-by-step.
Give concrete examples where useful.
Do not invent facts.
If the question is ambiguous or lacks context, explain the common interpretations and state what is unclear.
Focus on teaching the student rather than simply giving a dry answer.
Be supportive, encouraging, and pedagogically sound.
Format your response using well-structured Markdown with paragraphs, bullet points, numbered steps, bold key terms, and code blocks with syntax highlighting where relevant.`;

  const prompt = `Answer the following educational question for the student:

Question:
"${question}"

Requirements:
- Explain in simple, accessible language.
- Give relatable examples where helpful.
- Use bullet points and clear headings when appropriate.
- Highlight important formulas, principles, or caveats.
- End with a brief, encouraging summary note or thought-provoking follow-up question.`;

  const response = await generateWithFallback({
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  const answer = response.text || 'EduGenie could not generate an answer at this time. Please try rephrasing your question.';

  return {
    question,
    answer,
  };
}
