import React, { useState } from 'react';
import {
  FileText,
  Send,
  Copy,
  Check,
  AlertCircle,
  Key,
  Bookmark,
  Zap,
  Target,
  FileCheck2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { SummaryResponseData } from '../../types/index.ts';
import { MarkdownRenderer } from '../MarkdownRenderer.tsx';
import { saveRecentActivity } from '../../services/storage.ts';

export const SummarizeView: React.FC = () => {
  const [text, setText] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const samplePassage = `Cellular respiration is a series of chemical reactions that break down glucose to produce ATP, which may be used as energy to power many reactions throughout the body. There are three main steps of cellular respiration: glycolysis, the citric acid cycle, and oxidative phosphorylation. Glycolysis takes place in the cytosol, where one glucose molecule is cleaved into two pyruvate molecules, yielding a net of 2 ATP and 2 NADH. The citric acid cycle, occurring in the mitochondrial matrix, further oxidizes the pyruvate products, generating electron carriers NADH and FADH2 alongside 2 ATP. Finally, oxidative phosphorylation occurs across the inner mitochondrial membrane via the electron transport chain and chemiosmosis, generating the majority of cellular energy—approximately 28 to 32 ATP molecules per glucose molecule. Oxygen acts as the terminal electron acceptor, forming water. Without adequate oxygen, cells must resort to anaerobic fermentation to regenerate NAD+.`;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please paste study material to summarize.');
      return;
    }
    if (trimmed.length > 12000) {
      setError('Material exceeds 12,000 characters limit. Please shorten your text.');
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await api.summarizeText(trimmed, length);
      setResult(data);
      saveRecentActivity({
        type: 'summarize',
        title: trimmed.substring(0, 45) + '...',
        preview: data.structured?.mainIdea || data.summary.substring(0, 100),
        data,
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while summarizing your material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Summarize Your Study Material
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Paste notes, articles, or chapters to extract main ideas, key facts, and flash revision points.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="relative">
            <label htmlFor="summary-text" className="sr-only">
              Study material
            </label>
            <textarea
              id="summary-text"
              rows={6}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste your study material here..."
              disabled={loading}
              className="w-full p-4 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-slate-800 placeholder-slate-400 text-sm sm:text-base leading-relaxed resize-y transition-all disabled:bg-slate-50"
            />
            <div className="flex items-center justify-between mt-1 text-xs text-slate-400 px-1">
              <button
                type="button"
                onClick={() => setText(samplePassage)}
                disabled={loading}
                className="text-teal-700 hover:text-teal-800 font-medium underline underline-offset-2"
              >
                Insert sample biology notes
              </button>
              <span>{text.length} / 12,000 characters</span>
            </div>
          </div>

          {/* Depth / Length selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-3 border-t border-slate-100">
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-1.5">
                Summary Length
              </span>
              <div className="flex gap-2">
                {[
                  { id: 'short', label: 'Short' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'detailed', label: 'Detailed' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLength(l.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      length === l.id
                        ? 'bg-teal-50 border-teal-500 text-teal-800 font-semibold ring-1 ring-teal-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>EduGenie is summarizing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Summarize</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Summarization Error</p>
            <p className="text-rose-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs animate-pulse space-y-4">
          <div className="h-5 bg-teal-100 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
          </div>
          <div className="h-24 bg-slate-50 rounded-xl" />
        </div>
      )}

      {/* Summary Output */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                Revision Summary ({length})
              </h2>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          {/* Structured Output Cards */}
          {result.structured ? (
            <div className="grid grid-cols-1 gap-4">
              {/* Main Idea Card */}
              <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-teal-800 font-bold text-sm">
                  <Target className="w-4 h-4 text-teal-600" />
                  <h3>Main Idea</h3>
                </div>
                <p className="text-slate-800 text-sm sm:text-base leading-relaxed pl-6 font-medium">
                  {result.structured.mainIdea}
                </p>
              </div>

              {/* Key Points */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <h3>Key Points</h3>
                </div>
                <ul className="space-y-2 pl-2">
                  {result.structured.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Terms and Facts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Important Terms */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
                    <Bookmark className="w-4 h-4 text-amber-600" />
                    <h3>Important Terms</h3>
                  </div>
                  <div className="space-y-2.5">
                    {result.structured.importantTerms.map((item, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-amber-50/40 border border-amber-100 text-xs sm:text-sm">
                        <span className="font-bold text-amber-950 block">{item.term}</span>
                        <span className="text-slate-600">{item.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Facts */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
                    <Zap className="w-4 h-4 text-sky-600" />
                    <h3>Important Facts & Numbers</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.structured.importantFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 bg-sky-50/40 p-2.5 rounded-lg border border-sky-100">
                        <span className="font-semibold text-sky-700">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Revision Summary */}
              <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-2xl p-5 border border-teal-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-teal-900 font-bold text-sm">
                  <FileCheck2 className="w-4 h-4 text-teal-700" />
                  <h3>Quick Revision Summary</h3>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed font-medium pl-6">
                  {result.structured.quickRevision}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <MarkdownRenderer content={result.summary} />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="p-8 text-center bg-slate-100/60 rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-70" />
          <h3 className="font-semibold text-slate-700 text-sm">Turn your notes into quick revision material</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Paste notes or articles above to automatically organize them into main ideas, key facts, terms, and instant revision takeaways.
          </p>
        </div>
      )}
    </div>
  );
};
