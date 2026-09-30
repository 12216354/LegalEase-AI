import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  Cpu,
  ListOrdered,
  Sparkles,
  AlertTriangle,
  BookmarkCheck,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { ExplanationResponseData } from '../../types/index.ts';
import { MarkdownRenderer } from '../MarkdownRenderer.tsx';
import { saveRecentActivity } from '../../services/storage.ts';

interface ExplainViewProps {
  initialTopic?: string;
}

export const ExplainView: React.FC<ExplainViewProps> = ({ initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [preference, setPreference] = useState<'simple' | 'detailed' | 'example-based'>('simple');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleTopics = ['Photosynthesis', 'Quantum Superposition', 'Recursion in Programming', 'Plate Tectonics', 'Inflation in Economics'];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setError('Please enter a topic to explain.');
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await api.explainConcept(trimmed, level, preference);
      setResult(data);
      saveRecentActivity({
        type: 'explain',
        title: trimmed,
        preview: data.sections?.definition || data.answer.substring(0, 120),
        data,
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while explaining this concept. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Inputs */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Explain a Concept</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Understand complex topics through simple, step-by-step explanations.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="topic-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Topic or Concept
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Example: Photosynthesis, Blockchain, Calculus Derivatives..."
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 text-sm sm:text-base transition-all"
            />
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-xs text-slate-400 font-medium">Examples:</span>
            {sampleTopics.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTopic(sample)}
                disabled={loading}
                className="text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-md transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Target Learning Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium capitalize border transition-all text-center ${
                      level === l
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Explanation Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'simple', label: 'Simple' },
                  { id: 'detailed', label: 'Detailed' },
                  { id: 'example-based', label: 'Examples' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreference(p.id as any)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all text-center ${
                      preference === p.id
                        ? 'bg-amber-50 border-amber-400 text-amber-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>EduGenie is breaking it down...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Explain This</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Explanation Error</p>
            <p className="text-rose-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs animate-pulse space-y-4">
          <div className="h-5 bg-indigo-100 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-50 rounded-xl" />
            <div className="h-32 bg-slate-50 rounded-xl" />
            <div className="h-32 bg-slate-50 rounded-xl" />
            <div className="h-32 bg-slate-50 rounded-xl" />
          </div>
        </div>
      )}

      {/* Result Cards */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
                  {result.topic}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="capitalize">{result.level} level</span>
                  <span>•</span>
                  <span className="capitalize">{result.preference} format</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Guide</span>
                </>
              )}
            </button>
          </div>

          {/* 7 Content Cards */}
          {result.sections ? (
            <div className="space-y-4">
              {/* 1. Simple Definition */}
              <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-xs hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-2.5 mb-2.5 text-indigo-700 font-bold text-sm sm:text-base">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-xs text-indigo-600 font-black">
                    1
                  </span>
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <h3>Simple Definition</h3>
                </div>
                <div className="pl-9 text-slate-700 leading-relaxed text-sm sm:text-base">
                  <MarkdownRenderer content={result.sections.definition} />
                </div>
              </div>

              {/* 2. Core Concept */}
              <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs hover:border-sky-200 transition-all">
                <div className="flex items-center gap-2.5 mb-2.5 text-sky-800 font-bold text-sm sm:text-base">
                  <span className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-xs text-sky-700 font-black">
                    2
                  </span>
                  <Cpu className="w-4 h-4 text-sky-600" />
                  <h3>Core Concept</h3>
                </div>
                <div className="pl-9 text-slate-700 leading-relaxed text-sm sm:text-base">
                  <MarkdownRenderer content={result.sections.coreConcept} />
                </div>
              </div>

              {/* 3. Step-by-Step Explanation */}
              <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-xs hover:border-violet-200 transition-all">
                <div className="flex items-center gap-2.5 mb-2.5 text-violet-800 font-bold text-sm sm:text-base">
                  <span className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center text-xs text-violet-700 font-black">
                    3
                  </span>
                  <ListOrdered className="w-4 h-4 text-violet-600" />
                  <h3>Step-by-Step Explanation</h3>
                </div>
                <div className="pl-9 text-slate-700 leading-relaxed text-sm sm:text-base">
                  <MarkdownRenderer content={result.sections.stepByStep} />
                </div>
              </div>

              {/* 4. Practical Example */}
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-xs hover:border-amber-200 transition-all">
                <div className="flex items-center gap-2.5 mb-2.5 text-amber-900 font-bold text-sm sm:text-base">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-xs text-amber-700 font-black">
                    4
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3>Practical Example</h3>
                </div>
                <div className="pl-9 text-slate-700 leading-relaxed text-sm sm:text-base bg-amber-50/40 p-4 rounded-xl border border-amber-100/60">
                  <MarkdownRenderer content={result.sections.example} />
                </div>
              </div>

              {/* 5. Important Points */}
              <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-2.5 mb-2.5 text-emerald-800 font-bold text-sm sm:text-base">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-xs text-emerald-700 font-black">
                    5
                  </span>
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <h3>Important Points</h3>
                </div>
                <div className="pl-9 text-slate-700 leading-relaxed text-sm sm:text-base">
                  <MarkdownRenderer content={result.sections.importantPoints} />
                </div>
              </div>

              {/* 6. Common Mistakes */}
              <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs hover:border-rose-200 transition-all">
                <div className="flex items-center gap-2.5 mb-2.5 text-rose-800 font-bold text-sm sm:text-base">
                  <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-xs text-rose-700 font-black">
                    6
                  </span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3>Common Mistakes to Avoid</h3>
                </div>
                <div className="pl-9 text-slate-700 leading-relaxed text-sm sm:text-base bg-rose-50/30 p-4 rounded-xl border border-rose-100/60">
                  <MarkdownRenderer content={result.sections.commonMistakes} />
                </div>
              </div>

              {/* 7. Quick Recap */}
              <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 rounded-2xl p-5 border border-indigo-200/80 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2 text-indigo-900 font-bold text-sm sm:text-base">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                    7
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <h3>Quick Recap</h3>
                </div>
                <div className="pl-9 text-slate-800 font-medium leading-relaxed text-sm sm:text-base">
                  <MarkdownRenderer content={result.sections.quickRecap} />
                </div>
              </div>
            </div>
          ) : (
            /* Fallback generic markdown container */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <MarkdownRenderer content={result.answer} />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="p-8 text-center bg-slate-100/60 rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-70" />
          <h3 className="font-semibold text-slate-700 text-sm">Let's make this concept easier</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Enter any topic above and EduGenie will break it into 7 clear learning cards with definitions, mechanisms, and real-world examples.
          </p>
        </div>
      )}
    </div>
  );
};
