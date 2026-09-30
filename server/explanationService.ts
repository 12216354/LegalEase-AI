import { getGeminiClient } from './geminiClient.ts';
import { CONFIG } from './config.ts';
import { validateInput, cleanJsonString, ExplanationResponseData, ExplanationSections } from './schemas.ts';
import { Type } from '@google/genai';

export async function handleExplanationRequest(
  inputText: string,
  level: string = 'beginner',
  preference: string = 'simple'
): Promise<ExplanationResponseData> {
  const topic = validateInput(inputText, 'Topic');
  const validLevel = ['beginner', 'intermediate', 'advanced'].includes(level.toLowerCase())
    ? level.toLowerCase()
    : 'beginner';
  const validPreference = ['simple', 'detailed', 'example-based'].includes(preference.toLowerCase())
    ? preference.toLowerCase()
    : 'simple';

  const ai = getGeminiClient();

  const systemInstruction = `You are EduGenie, an expert educational tutor.
Your mission is to explain complex concepts step-by-step so that students truly understand them.
Student level: ${validLevel}.
Explanation preference: ${validPreference}.

You must provide 7 structured pedagogical components:
1. Simple Definition: An intuitive, plain-language one or two sentence definition.
2. Core Concept: The underlying mechanism or principle explained clearly.
3. Step-by-Step Explanation: The process or concept broken down into logical steps.
4. Practical Example: A real-world analogy or hands-on application.
5. Important Points: Key facts, formulas, or takeaways students must remember.
6. Common Mistakes: Frequent student misconceptions or pitfalls to avoid.
7. Quick Recap: A memorable 1-2 sentence takeaway summary.`;

  const prompt = `Explain the following topic for a ${validLevel} student with a ${validPreference} approach:

Topic: "${topic}"

Provide all 7 sections accurately and thoroughly.`;

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
            definition: { type: Type.STRING, description: '1. Simple Definition' },
            coreConcept: { type: Type.STRING, description: '2. Core Concept' },
            stepByStep: { type: Type.STRING, description: '3. Step-by-Step Explanation with numbered steps' },
            example: { type: Type.STRING, description: '4. Practical Example or real-world analogy' },
            importantPoints: { type: Type.STRING, description: '5. Important Points / Key Takeaways' },
            commonMistakes: { type: Type.STRING, description: '6. Common Mistakes and Misconceptions' },
            quickRecap: { type: Type.STRING, description: '7. Quick Recap summary' },
          },
          required: [
            'definition',
            'coreConcept',
            'stepByStep',
            'example',
            'importantPoints',
            'commonMistakes',
            'quickRecap',
          ],
        },
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(cleanJsonString(rawText));

    const sections: ExplanationSections = {
      definition: parsed.definition || `${topic} is a key concept in this subject area.`,
      coreConcept: parsed.coreConcept || `The core concept centers on how ${topic} operates.`,
      stepByStep: parsed.stepByStep || `1. Introduction\n2. Mechanism\n3. Application`,
      example: parsed.example || `For instance, consider how ${topic} behaves in daily life.`,
      importantPoints: parsed.importantPoints || `Key properties and considerations regarding ${topic}.`,
      commonMistakes: parsed.commonMistakes || `Students often confuse subtle terms related to ${topic}.`,
      quickRecap: parsed.quickRecap || `To recap, ${topic} is fundamental to master.`,
    };

    const combinedAnswer = [
      `### 1. Simple Definition\n${sections.definition}`,
      `### 2. Core Concept\n${sections.coreConcept}`,
      `### 3. Step-by-Step Explanation\n${sections.stepByStep}`,
      `### 4. Practical Example\n${sections.example}`,
      `### 5. Important Points\n${sections.importantPoints}`,
      `### 6. Common Mistakes\n${sections.commonMistakes}`,
      `### 7. Quick Recap\n${sections.quickRecap}`,
    ].join('\n\n');

    return {
      topic,
      level: validLevel,
      preference: validPreference,
      answer: combinedAnswer,
      sections,
    };
  } catch (err) {
    // Graceful fallback to text generation if schema fails
    const fallbackResponse = await ai.models.generateContent({
      model: CONFIG.geminiModel,
      contents: `Explain "${topic}" for a ${validLevel} student with these 7 sections: 1. Simple Definition, 2. Core Concept, 3. Step-by-Step Explanation, 4. Practical Example, 5. Important Points, 6. Common Mistakes, 7. Quick Recap.`,
    });

    const fallbackAnswer = fallbackResponse.text || `Explanation for ${topic}`;
    return {
      topic,
      level: validLevel,
      preference: validPreference,
      answer: fallbackAnswer,
      sections: {
        definition: `Comprehensive explanation of ${topic}.`,
        coreConcept: fallbackAnswer,
        stepByStep: `Review the detailed explanation above.`,
        example: `Refer to real-world applications of ${topic}.`,
        importantPoints: `Focus on foundational principles.`,
        commonMistakes: `Watch out for common edge cases.`,
        quickRecap: `Mastering ${topic} opens the door to advanced topics.`,
      },
    };
  }
}
