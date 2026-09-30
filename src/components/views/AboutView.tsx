import React from 'react';
import {
  GraduationCap,
  MessageSquare,
  BookOpen,
  HelpCircle,
  FileText,
  MapPin,
  Mic,
  Languages,
  Smartphone,
  BarChart3,
  Trophy,
  GitBranch,
  FolderGit2,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TaskType } from '../../types/index.ts';

interface AboutViewProps {
  onNavigate: (route: TaskType | 'home') => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const currentFeatures = [
    {
      icon: <MessageSquare className="w-5 h-5 text-indigo-600" />,
      title: 'AI Question & Answer',
      desc: 'Ask any academic question across STEM, humanities, languages, and coding. Receive structured, clear explanations with examples and code formatting.',
      route: 'qa' as TaskType,
    },
    {
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      title: 'Concept Explanation',
      desc: 'Break down complex topics into 7 pedagogical building blocks: definition, core concept, step-by-step logic, practical examples, important points, common traps, and recap.',
      route: 'explain' as TaskType,
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-violet-600" />,
      title: 'AI Quiz Generator',
      desc: 'Generate interactive 3-question quizzes with 4 options each, immediate scoring, correct answer indicators, and detailed teaching explanations.',
      route: 'quiz' as TaskType,
    },
    {
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      title: 'Text Summarization',
      desc: 'Condense long articles, textbook chapters, or lecture notes into high-yield main ideas, key vocabulary definitions, numbers/facts, and quick revision briefs.',
      route: 'summarize' as TaskType,
    },
    {
      icon: <MapPin className="w-5 h-5 text-emerald-600" />,
      title: 'Personalized Learning Paths',
      desc: 'Get a sequenced milestone path tailored to your knowledge level, daily available study hours, and academic or career objectives.',
      route: 'recommendations' as TaskType,
    },
  ];

  const futureRoadmap = [
    {
      icon: <Mic className="w-4 h-4 text-slate-500" />,
      title: 'Voice Interaction',
      desc: 'Spoken Q&A and real-time audio tutoring via Gemini Live.',
    },
    {
      icon: <Languages className="w-4 h-4 text-slate-500" />,
      title: 'Multilingual Learning',
      desc: 'Instant translation and bilingual tutoring in 40+ languages.',
    },
    {
      icon: <Smartphone className="w-4 h-4 text-slate-500" />,
      title: 'Native Mobile Apps',
      desc: 'Offline flashcards and sync across iOS and Android.',
    },
    {
      icon: <BarChart3 className="w-4 h-4 text-slate-500" />,
      title: 'Progress Dashboards',
      desc: 'Visual mastery metrics, study streaks, and retention curves.',
    },
    {
      icon: <Trophy className="w-4 h-4 text-slate-500" />,
      title: 'Gamification & Badges',
      desc: 'Daily study XP, milestone achievements, and friendly challenges.',
    },
    {
      icon: <GitBranch className="w-4 h-4 text-slate-500" />,
      title: 'Adaptive Learning Paths',
      desc: 'Automatic quiz failure diagnosis that adapts your next learning module.',
    },
    {
      icon: <FolderGit2 className="w-4 h-4 text-slate-500" />,
      title: 'LMS Integration',
      desc: 'Seamless Canvas, Blackboard, and Google Classroom synchronization.',
    },
    {
      icon: <FileCode className="w-4 h-4 text-slate-500" />,
      title: 'Image & PDF Document Input',
      desc: 'Snap photos of handwritten homework or upload research PDF papers directly.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-4 border border-white/10">
            <GraduationCap className="w-4 h-4" />
            <span>EduGenie Learning Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Learn Smarter with EduGenie
          </h1>

          <p className="mt-3 text-slate-200 text-sm sm:text-base leading-relaxed">
            EduGenie is an AI-powered learning assistant designed to help students understand concepts clearly, study efficiently, and master topics step-by-step.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Core Capabilities */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Current Core Features</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Fully functional AI-powered learning tools built into EduGenie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentFeatures.map((feat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{feat.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => onNavigate(feat.route)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <span>Open {feat.title}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Architecture */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2>Security & Architecture</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          EduGenie is architected with student security and data privacy as top priorities:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="font-bold text-slate-900 block mb-1">Server-Side AI Proxy</span>
            <span className="text-slate-600">
              The Gemini API key is never exposed to the client or browser bundle. All requests are routed through dedicated backend endpoints.
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="font-bold text-slate-900 block mb-1">Rigorous Validation</span>
            <span className="text-slate-600">
              All user inputs are length-checked and sanitized. Quiz JSON outputs are validated for strict structure (3 questions, 4 options).
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="font-bold text-slate-900 block mb-1">Zero Lock-In</span>
            <span className="text-slate-600">
              No mandatory login or paywall is required for core learning tasks. Students can start learning immediately.
            </span>
          </div>
        </div>
      </div>

      {/* Future-Ready Roadmap */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Upcoming Roadmap</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Future Modules
            </span>
          </div>
          <p className="text-xs text-slate-500">
            These features represent the planned extensions for future EduGenie releases:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {futureRoadmap.map((item, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-slate-100">{item.icon}</span>
                <span className="font-bold text-xs text-slate-800">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
