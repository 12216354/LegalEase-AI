import React, { useState } from 'react';
import {
  MapPin,
  Send,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  Compass,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { RecommendationResponseData } from '../../types/index.ts';
import { saveRecentActivity } from '../../services/storage.ts';

export const RecommendationsView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<string>('skill development');
  const [studyTime, setStudyTime] = useState<string>('30 minutes/day');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleTopics = ['Machine Learning', 'Data Structures & Algorithms', 'Full-Stack Web Development', 'Microeconomics', 'Organic Chemistry'];

  const goals = [
    'Skill development',
    'Academic learning',
    'Exam preparation',
    'Interview preparation',
    'General understanding',
  ];

  const studyTimeOptions = [
    '15 minutes/day',
    '30 minutes/day',
    '1 hour/day',
    '2+ hours/day',
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setError('Please enter a topic or subject.');
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await api.getRecommendations(trimmed, level, goal, studyTime);
      setResult(data);
      saveRecentActivity({
        type: 'recommendations',
        title: `${trimmed} Learning Path`,
        preview: data.overview || `${data.recommendations?.length || 0} milestone modules`,
        data,
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while generating your learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPath = () => {
    if (!result) return;
    const pathText = [
      `Learning Path: ${result.topic}`,
      `Level: ${result.level} | Goal: ${result.goal} | Study Time: ${result.studyTime}`,
      '',
      ...(result.overview ? [result.overview, ''] : []),
      ...result.recommendations.map((rec, i) =>
        `${i + 1}. [${rec.category}] ${rec.topic}\n   Why: ${rec.whyItMatters}\n   Difficulty: ${rec.difficulty} | Est. Time: ${rec.estimatedTime}\n   Next Step: ${rec.nextTopic}`
      ),
    ].join('\n');

    navigator.clipboard.writeText(pathText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Your Personalized Learning Path
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Tell EduGenie what you want to learn and get a sequential milestone roadmap from prerequisites to mastery.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="topic-rec" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Subject or Skill
            </label>
            <input
              id="topic-rec"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Example: Machine Learning, React & TypeScript, Organic Chemistry..."
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 text-sm sm:text-base transition-all"
            />
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-xs text-slate-400 font-medium">Examples:</span>
            {sampleTopics.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTopic(sample)}
                disabled={loading}
                className="text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-md transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Knowledge Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Current Knowledge Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-medium capitalize border transition-all text-center ${
                      level === l
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Goal */}
            <div>
              <label htmlFor="goal-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Primary Goal
              </label>
              <select
                id="goal-select"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400"
              >
                {goals.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Study Time */}
            <div>
              <label htmlFor="time-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Available Study Time
              </label>
              <select
                id="time-select"
                value={studyTime}
                onChange={(e) => setStudyTime(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400"
              >
                {studyTimeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>EduGenie is architecting your path...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Learning Path</span>
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
            <p className="font-semibold">Roadmap Generation Error</p>
            <p className="text-rose-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs animate-pulse space-y-4">
          <div className="h-5 bg-emerald-100 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="space-y-3 pt-4">
            <div className="h-20 bg-slate-50 rounded-xl" />
            <div className="h-20 bg-slate-50 rounded-xl" />
            <div className="h-20 bg-slate-50 rounded-xl" />
          </div>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 capitalize">
                  {result.topic} Learning Path
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium capitalize">
                  {result.level}
                </span>
                <span>•</span>
                <span>{result.goal}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {result.studyTime}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyPath}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Roadmap</span>
                </>
              )}
            </button>
          </div>

          {/* Overview Callout */}
          {result.overview && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
              💡 {result.overview}
            </div>
          )}

          {/* Sequential Path Timeline */}
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 before:hidden sm:before:block">
            {result.recommendations.map((rec, index) => {
              const diffBadgeColor =
                rec.difficulty?.toLowerCase() === 'beginner'
                  ? 'bg-emerald-100 text-emerald-800'
                  : rec.difficulty?.toLowerCase() === 'advanced'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800';

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all sm:ml-8 relative"
                >
                  {/* Step badge icon for desktop timeline */}
                  <div className="hidden sm:flex absolute -left-11 top-5 w-6 h-6 rounded-full bg-emerald-600 text-white items-center justify-center text-xs font-bold shadow-xs">
                    {index + 1}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="sm:hidden font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          #{index + 1}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {rec.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${diffBadgeColor}`}>
                          {rec.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {rec.topic}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 shrink-0 self-start">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Est: {rec.estimatedTime}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                    {rec.whyItMatters}
                  </p>

                  {/* Suggested Next Topic */}
                  {rec.nextTopic && (
                    <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Next milestone:</span>
                      <span className="font-semibold text-slate-700">{rec.nextTopic}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="p-8 text-center bg-slate-100/60 rounded-2xl border border-dashed border-slate-200">
          <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-70" />
          <h3 className="font-semibold text-slate-700 text-sm">Build your next learning step</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Choose what you want to learn, and EduGenie will create an 8-stage roadmap customized to your study hours and goals.
          </p>
        </div>
      )}
    </div>
  );
};
