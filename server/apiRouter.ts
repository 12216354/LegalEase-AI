import { Router, Request, Response } from 'express';
import { CONFIG } from './config.ts';
import { handleQnARequest } from './qnaService.ts';
import { handleExplanationRequest } from './explanationService.ts';
import { handleQuizRequest } from './quizService.ts';
import { handleSummaryRequest } from './summaryService.ts';
import { handleRecommendationRequest } from './recommendationService.ts';
import { formatFriendlyErrorMessage } from './schemas.ts';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: CONFIG.appName,
    version: CONFIG.appVersion,
    model: CONFIG.geminiModel,
    maxInputLength: CONFIG.maxInputLength,
    timestamp: new Date().toISOString(),
  });
});

// Q&A endpoint: POST /qa and POST /api/qa
apiRouter.post(['/qa', '/api/qa'], async (req: Request, res: Response) => {
  try {
    const rawText = req.body?.text ?? req.body?.question ?? req.body?.input;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({
        error: 'Please enter a question. Input cannot be empty.',
      });
    }

    const result = await handleQnARequest(rawText);
    return res.json(result);
  } catch (error: any) {
    const message = formatFriendlyErrorMessage(error, 'Something went wrong while generating your answer. Please try again.');
    const status = error?.message?.includes('exceeds maximum') || error?.message?.includes('cannot be empty') ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

// Concept Explanation endpoint: POST /explain and POST /api/explain
apiRouter.post(['/explain', '/api/explain'], async (req: Request, res: Response) => {
  try {
    const rawText = req.body?.text ?? req.body?.topic ?? req.body?.input;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({
        error: 'Please enter a topic to explain. Input cannot be empty.',
      });
    }

    const level = req.body?.level || 'beginner';
    const preference = req.body?.preference || 'simple';

    const result = await handleExplanationRequest(rawText, level, preference);
    return res.json(result);
  } catch (error: any) {
    const message = formatFriendlyErrorMessage(error, 'Something went wrong while explaining this concept. Please try again.');
    const status = error?.message?.includes('exceeds maximum') || error?.message?.includes('cannot be empty') ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

// Quiz Generator endpoint: POST /quiz and POST /api/quiz
apiRouter.post(['/quiz', '/api/quiz'], async (req: Request, res: Response) => {
  try {
    const rawText = req.body?.text ?? req.body?.topic ?? req.body?.input;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({
        error: 'Please enter a topic for the quiz. Input cannot be empty.',
      });
    }

    const difficulty = req.body?.difficulty || 'medium';
    const result = await handleQuizRequest(rawText, difficulty);
    return res.json(result);
  } catch (error: any) {
    const message = formatFriendlyErrorMessage(error, 'Something went wrong while generating your quiz. Please try again.');
    const status = error?.message?.includes('exceeds maximum') || error?.message?.includes('cannot be empty') ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

// Text Summarizer endpoint: POST /summarize and POST /api/summarize
apiRouter.post(['/summarize', '/api/summarize'], async (req: Request, res: Response) => {
  try {
    const rawText = req.body?.text ?? req.body?.input ?? req.body?.material;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({
        error: 'Please paste study material to summarize. Input cannot be empty.',
      });
    }

    const length = req.body?.length || 'medium';
    const result = await handleSummaryRequest(rawText, length);
    return res.json(result);
  } catch (error: any) {
    const message = formatFriendlyErrorMessage(error, 'Something went wrong while summarizing your material. Please try again.');
    const status = error?.message?.includes('exceeds maximum') || error?.message?.includes('cannot be empty') ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

// Learning Path / Recommendations endpoint: POST /learn/recommendations and POST /api/learn/recommendations
apiRouter.post(['/learn/recommendations', '/api/learn/recommendations', '/recommendations', '/api/recommendations'], async (req: Request, res: Response) => {
  try {
    const rawTopic = req.body?.topic ?? req.body?.text ?? req.body?.input;
    if (!rawTopic || typeof rawTopic !== 'string' || !rawTopic.trim()) {
      return res.status(400).json({
        error: 'Please enter a learning topic or skill. Input cannot be empty.',
      });
    }

    const level = req.body?.level || 'beginner';
    const goal = req.body?.goal || 'skill development';
    const studyTime = req.body?.study_time || req.body?.studyTime || '30 minutes/day';

    const result = await handleRecommendationRequest(rawTopic, level, goal, studyTime);
    return res.json(result);
  } catch (error: any) {
    const message = formatFriendlyErrorMessage(error, 'Something went wrong while generating your learning path. Please try again.');
    const status = error?.message?.includes('exceeds maximum') || error?.message?.includes('cannot be empty') ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

