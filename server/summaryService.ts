import { getGeminiClient } from './geminiClient.ts';
import { CONFIG } from './config.ts';
import { validateInput, cleanJsonString, SummaryResponseData, SummarySections } from './schemas.ts';
import { Type } from '@google/genai';

export async function handleSummaryRequest(
  inputText: string,
  length: string = 'medium'
): Promise<SummaryResponseData> {
  const text = validateInput(inputText, 'Study material');
  const validLength = ['short', 'medium', 'detailed'].includes(length.toLowerCase())
    ? length.toLowerCase()
    : 'medium';

  const ai = getGeminiClient();

  const systemInstruction = `You are EduGenie, an AI educational summarizer.
Summarize the student's study material into concise, high-yield revision notes.
Do not change the original meaning.
Remove unnecessary fluff or repetition.
Retain technical accuracy, formulas, and essential definitions.
Desired summary depth: ${validLength}.`;

  const prompt = `Summarize the following study material:

"""
${text}
"""

Provide:
1. Main idea (1-2 sentences summarizing the overarching thesis or purpose).
2. Key points (list of bulleted high-yield points).
3. Important terms (key vocabulary terms paired with concise definitions).
4. Important facts (critical numbers, dates, rules, or formulas).
5. Quick revision summary (a 2-3 sentence wrap-up ideal for flash revision right before an exam).`;

  try {
    const response = await ai.models.generateContent({
      model: CONFIG.geminiModel,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainIdea: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            importantTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            importantFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            quickRevision: { type: Type.STRING },
          },
          required: ['mainIdea', 'keyPoints', 'importantTerms', 'importantFacts', 'quickRevision'],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(response.text || '{}'));

    const structured: SummarySections = {
      mainIdea: parsed.mainIdea || 'Core summary of the provided text.',
      keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
        ? parsed.keyPoints
        : ['Key point 1 from text', 'Key point 2 from text'],
      importantTerms: Array.isArray(parsed.importantTerms) && parsed.importantTerms.length > 0
        ? parsed.importantTerms
        : [{ term: 'Concept', definition: 'Fundamental subject idea' }],
      importantFacts: Array.isArray(parsed.importantFacts) && parsed.importantFacts.length > 0
        ? parsed.importantFacts
        : ['Essential factual insight'],
      quickRevision: parsed.quickRevision || 'Quick takeaway for this topic.',
    };

    const formattedSummary = [
      `### 📌 Main Idea\n${structured.mainIdea}`,
      `### 🔑 Key Points\n${structured.keyPoints.map((p) => `- ${p}`).join('\n')}`,
      `### 📖 Important Terms\n${structured.importantTerms.map((t) => `- **${t.term}**: ${t.definition}`).join('\n')}`,
      `### ⚡ Important Facts\n${structured.importantFacts.map((f) => `- ${f}`).join('\n')}`,
      `### 🚀 Quick Revision\n${structured.quickRevision}`,
    ].join('\n\n');

    return {
      summary: formattedSummary,
      structured,
    };
  } catch (err) {
    // Fallback to text generation if schema parsing fails
    const fallbackResponse = await ai.models.generateContent({
      model: CONFIG.geminiModel,
      contents: `Summarize the following text in ${validLength} depth with Main Idea, Key Points, Important Terms, Important Facts, and Quick Revision Summary:\n\n${text}`,
    });

    const fallbackText = fallbackResponse.text || 'Summary could not be generated.';
    return {
      summary: fallbackText,
    };
  }
}
