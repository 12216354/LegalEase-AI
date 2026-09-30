import React, { useState } from 'react';
import { Send, Trash2, Copy, Check, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { api } from '../../services/api.ts';
import { MarkdownRenderer } from '../MarkdownRenderer.tsx';
import { saveRecentActivity } from '../../services/storage.ts';

interface QaViewProps {
  initialQuestion?: string;
}

export const QaView: React.FC<QaViewProps> = ({ initialQuestion = '' }) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleQuestions = [
    "Explain Newton's laws of motion in simple terms with everyday examples",
    "What is the difference between mitosis and meiosis?",
    "How does the binary search algorithm work and what is its time complexity?",
    "Why does the sky turn orange and red during sunset?",
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      setError('Please enter a question before submitting.');
      return;
    }
    if (trimmed.length > 12000) {
      setError('Question exceeds 12,000 characters limit. Please shorten your question.');
      return;
    }

    setError(null);
    setLoading(true);
    setAnswer(null);

    try {
      const response = await api.askQuestion(trimmed);
      setAnswer(response.answer);
      saveRecentActivity({
        type: 'qa',
        title: trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed,
        preview: response.answer,
        data: { question: trimmed, answer: response.answer },
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while generating your answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setQuestion('');
    setAnswer(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Ask EduGenie</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Ask any educational question and get a clear, helpful, step-by-step answer.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="relative">
            <label htmlFor="qa-input" className="sr-only">
              Your question
            </label>
            <textarea
              id="qa-input"
              rows={4}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Example: Explain Newton's laws of motion in simple terms..."
              disabled={loading}
              className="w-full p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 text-sm sm:text-base leading-relaxed resize-y transition-all disabled:bg-slate-50"
            />
            <div className="absolute right-3 bottom-3 text-xs text-slate-400 pointer-events-none">
              {question.length} / 12,000
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Try asking:
            </span>
            {sampleQuestions.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuestion(sample)}
                disabled={loading}
                className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors truncate max-w-xs text-left"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!question && !answer)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>EduGenie is thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Ask Question</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to complete request</p>
            <p className="text-rose-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3.5 bg-slate-100 rounded w-full" />
            <div className="h-3.5 bg-slate-100 rounded w-5/6" />
            <div className="h-3.5 bg-slate-100 rounded w-4/6" />
          </div>
          <div className="h-10 bg-slate-50 rounded-xl" />
        </div>
      )}

      {/* Result Card */}
      {answer && !loading && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm transition-all">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h2 className="font-bold text-slate-800 text-sm sm:text-base">EduGenie's Answer</h2>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100/80 hover:bg-indigo-50 border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Answer</span>
                </>
              )}
            </button>
          </div>

          <div className="prose-content">
            <MarkdownRenderer content={answer} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 gap-2">
            <span>Powered by Google Gemini 3.8</span>
            <span className="text-slate-500 italic">"Focus on understanding the principles, not just memorizing."</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!answer && !loading && !error && (
        <div className="p-8 text-center bg-slate-100/60 rounded-2xl border border-dashed border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-70" />
          <h3 className="font-semibold text-slate-700 text-sm">Ask EduGenie anything</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Your AI-generated result will appear here. Ask about math, physics, coding, biology, history, or literature.
          </p>
        </div>
      )}
    </div>
  );
};
