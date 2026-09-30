import { getGeminiClient } from './geminiClient.ts';
import { CONFIG } from './config.ts';
import { validateInput, cleanJsonString, RecommendationResponseData, RecommendationTopic } from './schemas.ts';
import { Type } from '@google/genai';

export async function handleRecommendationRequest(
  inputText: string,
  level: string = 'beginner',
  goal: string = 'skill development',
  studyTime: string = '30 minutes/day'
): Promise<RecommendationResponseData> {
  const topic = validateInput(inputText, 'Learning topic');
  const validLevel = ['beginner', 'intermediate', 'advanced'].includes(level.toLowerCase())
    ? level.toLowerCase()
    : 'beginner';
  const validGoal = goal?.trim() || 'skill development';
  const validStudyTime = studyTime?.trim() || '30 minutes/day';

  const ai = getGeminiClient();

  const systemInstruction = `You are EduGenie, a personalized AI learning path architect.
Create a step-by-step sequential learning roadmap from basic to advanced for the given student.
The roadmap must follow an 8-stage educational progression:
1. Prerequisites
2. Fundamentals
3. Core Concepts
4. Practical Examples
5. Intermediate Topics
6. Advanced Topics
7. Practice / Projects
8. Revision

For every stage/topic provide:
- topic: clear descriptive module/topic title
- category: one of the 8 stages
- whyItMatters: 1-2 sentences on why this module is critical for their goal
- difficulty: 'Beginner', 'Intermediate', or 'Advanced'
- estimatedTime: realistic study time (e.g., '45 minutes', '2 hours', '1 week') based on their daily commitment of ${validStudyTime}
- nextTopic: specific topic to tackle next`;

  const prompt = `Create a structured learning path for:
Topic: "${topic}"
Student Level: ${validLevel}
Goal: ${validGoal}
Available Study Time: ${validStudyTime}

Provide at least 6 to 8 sequential milestone recommendations covering the stages from prerequisites to mastery.`;

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
            overview: { type: Type.STRING, description: 'A motivating introductory roadmap summary for the student' },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  category: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  nextTopic: { type: Type.STRING },
                },
                required: ['topic', 'category', 'whyItMatters', 'difficulty', 'estimatedTime', 'nextTopic'],
              },
            },
          },
          required: ['recommendations'],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(response.text || '{}'));
    const recommendations: RecommendationTopic[] = Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
      ? parsed.recommendations
      : [
          {
            topic: `${topic} Foundations`,
            category: 'Fundamentals',
            whyItMatters: `Builds the core vocabulary and mental models needed for ${topic}.`,
            difficulty: 'Beginner',
            estimatedTime: '2 hours',
            nextTopic: `Core Principles of ${topic}`,
          },
          {
            topic: `Core Principles of ${topic}`,
            category: 'Core Concepts',
            whyItMatters: `Crucial for understanding how ${topic} works under the hood.`,
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            nextTopic: `Practical Projects in ${topic}`,
          },
        ];

    return {
      topic,
      level: validLevel,
      goal: validGoal,
      studyTime: validStudyTime,
      overview: parsed.overview || `Custom tailored roadmap for mastering ${topic} aiming for ${validGoal}.`,
      recommendations,
    };
  } catch (err) {
    // Fallback response if schema generation errors
    return {
      topic,
      level: validLevel,
      goal: validGoal,
      studyTime: validStudyTime,
      overview: `Roadmap for ${topic} (${validLevel} level, ${validGoal}).`,
      recommendations: [
        {
          topic: `1. Prerequisites for ${topic}`,
          category: 'Prerequisites',
          whyItMatters: 'Essential prior concepts required before starting.',
          difficulty: 'Beginner',
          estimatedTime: '1 hour',
          nextTopic: `Fundamentals of ${topic}`,
        },
        {
          topic: `2. Fundamentals of ${topic}`,
          category: 'Fundamentals',
          whyItMatters: 'Core building blocks and definitions.',
          difficulty: 'Beginner',
          estimatedTime: '2 hours',
          nextTopic: `Core Concepts`,
        },
        {
          topic: `3. Core Mechanics & Deep Dive`,
          category: 'Core Concepts',
          whyItMatters: 'Deep understanding of primary working principles.',
          difficulty: 'Intermediate',
          estimatedTime: '3 hours',
          nextTopic: `Practical Application & Projects`,
        },
        {
          topic: `4. Hands-on Project & Review`,
          category: 'Practice / Projects',
          whyItMatters: 'Consolidates knowledge through direct active problem solving.',
          difficulty: 'Advanced',
          estimatedTime: '4 hours',
          nextTopic: 'Review & Revision',
        },
      ],
    };
  }
}
