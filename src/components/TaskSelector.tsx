import React from 'react';
import { MessageSquare, BookOpen, HelpCircle, FileText, MapPin } from 'lucide-react';
import { TaskType } from '../types/index.ts';

interface TaskSelectorProps {
  currentTask: TaskType;
  onSelectTask: (task: TaskType) => void;
}

export const TaskSelector: React.FC<TaskSelectorProps> = ({ currentTask, onSelectTask }) => {
  const tasks: Array<{
    id: TaskType;
    label: string;
    icon: React.ReactNode;
    tagline: string;
  }> = [
    {
      id: 'qa',
      label: 'Ask a Question',
      icon: <MessageSquare className="w-4 h-4" />,
      tagline: 'Instant clear answers',
    },
    {
      id: 'explain',
      label: 'Explain a Concept',
      icon: <BookOpen className="w-4 h-4" />,
      tagline: 'Step-by-step breakdown',
    },
    {
      id: 'quiz',
      label: 'Generate a Quiz',
      icon: <HelpCircle className="w-4 h-4" />,
      tagline: '3-question knowledge check',
    },
    {
      id: 'summarize',
      label: 'Summarize Text',
      icon: <FileText className="w-4 h-4" />,
      tagline: 'Concise study revision',
    },
    {
      id: 'recommendations',
      label: 'Learning Path',
      icon: <MapPin className="w-4 h-4" />,
      tagline: 'Personalized next steps',
    },
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          How can EduGenie help you today?
        </h2>
        <span className="text-xs text-slate-400">Select any learning task below</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {tasks.map((task) => {
          const isSelected = currentTask === task.id;
          return (
            <button
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all select-none ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300/40'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {task.icon}
                </span>
                <span className="font-semibold text-xs sm:text-sm tracking-tight line-clamp-1">
                  {task.label}
                </span>
              </div>
              <span
                className={`text-[11px] leading-tight line-clamp-1 ${
                  isSelected ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                {task.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
