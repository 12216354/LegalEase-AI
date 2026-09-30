import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { TaskSelector } from './components/TaskSelector.tsx';
import { HomeDashboard } from './components/views/HomeDashboard.tsx';
import { QaView } from './components/views/QaView.tsx';
import { ExplainView } from './components/views/ExplainView.tsx';
import { QuizView } from './components/views/QuizView.tsx';
import { SummarizeView } from './components/views/SummarizeView.tsx';
import { RecommendationsView } from './components/views/RecommendationsView.tsx';
import { AboutView } from './components/views/AboutView.tsx';
import { TaskType, RecentItem } from './types/index.ts';
import { getRecentActivities, clearRecentActivities } from './services/storage.ts';
import { api } from './services/api.ts';
import { ChevronRight, Sparkles, GraduationCap } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<TaskType | 'home'>('home');
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const [initialInput, setInitialInput] = useState<string>('');

  // Handle URL route synchronization
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      if (path === 'qa') setCurrentRoute('qa');
      else if (path === 'explain') setCurrentRoute('explain');
      else if (path === 'quiz') setCurrentRoute('quiz');
      else if (path === 'summarize') setCurrentRoute('summarize');
      else if (path === 'recommendations' || path === 'learn/recommendations') setCurrentRoute('recommendations');
      else if (path === 'about') setCurrentRoute('about');
      else setCurrentRoute('home');
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Load recent items
  useEffect(() => {
    setRecentItems(getRecentActivities());
  }, [currentRoute]);

  // Check backend health
  useEffect(() => {
    api.getHealth()
      .then(() => setSystemHealthy(true))
      .catch(() => setSystemHealthy(false));
  }, []);

  const navigateTo = (route: TaskType | 'home', queryParam?: string) => {
    setCurrentRoute(route);
    const targetPath = route === 'home' ? '/' : `/${route}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (queryParam) {
      setInitialInput(queryParam);
    } else {
      setInitialInput('');
    }
  };

  const handleSelectRecent = (item: RecentItem) => {
    if (item.type) {
      navigateTo(item.type, item.title);
    }
  };

  const handleClearHistory = () => {
    clearRecentActivities();
    setRecentItems([]);
  };

  // Route labels for breadcrumbs
  const routeNames: Record<string, string> = {
    qa: 'Ask a Question',
    explain: 'Concept Explanation',
    quiz: 'AI Quiz Generator',
    summarize: 'Text Summarizer',
    recommendations: 'Personalized Learning Path',
    about: 'About EduGenie',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        systemHealthy={systemHealthy}
      />

      {/* Main Workspace Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation on sub-routes */}
        {currentRoute !== 'home' && (
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 select-none">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-indigo-600 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">
              {routeNames[currentRoute] || currentRoute}
            </span>
          </nav>
        )}

        {/* Learning Task Switcher (shown on learning routes) */}
        {currentRoute !== 'home' && currentRoute !== 'about' && (
          <TaskSelector
            currentTask={currentRoute}
            onSelectTask={(task) => navigateTo(task)}
          />
        )}

        {/* View Routing */}
        <div className="transition-all duration-200">
          {currentRoute === 'home' && (
            <HomeDashboard
              onNavigate={navigateTo}
              recentItems={recentItems}
              onSelectRecent={handleSelectRecent}
              onClearRecent={handleClearHistory}
            />
          )}

          {currentRoute === 'qa' && <QaView initialQuestion={initialInput} />}

          {currentRoute === 'explain' && <ExplainView initialTopic={initialInput} />}

          {currentRoute === 'quiz' && <QuizView initialTopic={initialInput} />}

          {currentRoute === 'summarize' && <SummarizeView />}

          {currentRoute === 'recommendations' && <RecommendationsView />}

          {currentRoute === 'about' && <AboutView onNavigate={navigateTo} />}
        </div>
      </main>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">EduGenie</span>
            <span>— AI Learning Assistant</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-indigo-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('qa')}
              className="hover:text-indigo-600 transition-colors"
            >
              Q&A
            </button>
            <button
              onClick={() => navigateTo('explain')}
              className="hover:text-indigo-600 transition-colors"
            >
              Explain
            </button>
            <button
              onClick={() => navigateTo('quiz')}
              className="hover:text-indigo-600 transition-colors"
            >
              Quiz
            </button>
            <button
              onClick={() => navigateTo('summarize')}
              className="hover:text-indigo-600 transition-colors"
            >
              Summarize
            </button>
            <button
              onClick={() => navigateTo('recommendations')}
              className="hover:text-indigo-600 transition-colors"
            >
              Learning Path
            </button>
            <button
              onClick={() => navigateTo('about')}
              className="hover:text-indigo-600 transition-colors"
            >
              About
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Powered by Google Gemini 3.8</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          EduGenie provides AI-assisted educational guidance. Always verify complex formulas, historical dates, and academic coursework sources.
        </div>
      </footer>
    </div>
  );
}
