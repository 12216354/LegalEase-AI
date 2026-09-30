import React from 'react';
import {
  MessageSquare,
  BookOpen,
  HelpCircle,
  FileText,
  MapPin,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  History,
  Clock,
  Trash2,
} from 'lucide-react';
import { TaskType, RecentItem } from '../../types/index.ts';

interface HomeDashboardProps {
  onNavigate: (route: TaskType) => void;
  recentItems: RecentItem[];
  onSelectRecent: (item: RecentItem) => void;
  onClearRecent: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  recentItems,
  onSelectRecent,
  onClearRecent,
}) => {
  const featureCards = [
    {
      id: 'qa' as TaskType,
      title: 'Ask Anything',
      icon: <MessageSquare className="w-5 h-5 text-indigo-600" />,
      badge: 'Q&A',
      badgeColor: 'bg-indigo-50 text-indigo-700',
      description: 'Get clear AI-powered answers to your questions with step-by-step logic and code formatting.',
      cta: 'Ask a Question',
    },
    {
      id: 'explain' as TaskType,
      title: 'Explain a Concept',
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      badge: 'Concept Breakdown',
      badgeColor: 'bg-amber-50 text-amber-700',
      description: 'Understand difficult concepts with simple explanations, practical examples, and common traps.',
      cta: 'Explain This',
    },
    {
      id: 'quiz' as TaskType,
      title: 'Generate Quiz',
      icon: <HelpCircle className="w-5 h-5 text-violet-600" />,
      badge: 'Knowledge Check',
      badgeColor: 'bg-violet-50 text-violet-700',
      description: 'Test your knowledge with 3-question AI-generated quizzes, instant scoring, and explanations.',
      cta: 'Start Quiz',
    },
    {
      id: 'summarize' as TaskType,
      title: 'Summarize',
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      badge: 'High-Yield Notes',
      badgeColor: 'bg-teal-50 text-teal-700',
      description: 'Turn long study material into concise key points, key vocabulary terms, and quick revision cards.',
      cta: 'Summarize Text',
    },
    {
      id: 'recommendations' as TaskType,
      title: 'Learning Path',
      icon: <MapPin className="w-5 h-5 text-emerald-600" />,
      badge: 'Roadmap',
      badgeColor: 'bg-emerald-50 text-emerald-700',
      description: 'Get personalized recommendations for what to learn next based on your current level and goals.',
      cta: 'Build Roadmap',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Choose a task',
      description: 'Select Q&A, Concept Explanation, Quiz, Summarization, or Learning Path.',
    },
    {
      step: '02',
      title: 'Enter your input',
      description: 'Enter your question, topic, notes, or target study subject.',
    },
    {
      step: '03',
      title: 'AI Processing',
      description: 'EduGenie structures your learning using Google Gemini 3.8.',
    },
    {
      step: '04',
      title: 'Review results',
      description: 'Get clean, high-yield cards designed for fast student comprehension.',
    },
    {
      step: '05',
      title: 'Keep advancing',
      description: 'Follow milestone recommendations or generate quizzes to lock in knowledge.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-12 shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini Powered Learning Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Learn Smarter with EduGenie
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
            Your AI-powered learning assistant for questions, explanations, quizzes, summaries, and personalized learning.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('qa')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all group"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('quiz')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm sm:text-base transition-all backdrop-blur-xs"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Try a Quiz</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-40 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Feature Cards Grid (5 features) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Core Learning Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pick a tool below or click any card to begin immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((feat) => (
            <div
              key={feat.id}
              onClick={() => onNavigate(feat.id)}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                    {feat.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
                  {feat.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                <span>{feat.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How EduGenie Works Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3 h-3" />
            <span>Workflow</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            How EduGenie Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A seamless learning loop designed to take you from confusion to complete mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-2.5">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity Section */}
      {recentItems.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Recent Activity
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {recentItems.length}
              </span>
            </div>

            <button
              onClick={onClearRecent}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRecent(item)}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-indigo-600">
                    {item.type}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.preview}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
