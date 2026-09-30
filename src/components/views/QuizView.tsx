import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  PlusCircle,
  ArrowRight,
  Award,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { QuizResponseData, QuizQuestion } from '../../types/index.ts';
import { saveRecentActivity } from '../../services/storage.ts';

interface QuizViewProps {
  initialTopic?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({ initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sampleTopics = ['Python Functions', 'Cellular Respiration', 'World War II Timeline', 'Calculus Derivatives', 'HTML5 Semantic Tags'];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setError('Please enter a topic for the quiz.');
      return;
    }

    setError(null);
    setLoading(true);
    setQuizData(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);

    try {
      const data = await api.generateQuiz(trimmed, difficulty);
      setQuizData(data);
      saveRecentActivity({
        type: 'quiz',
        title: `${trimmed} Quiz (${difficulty})`,
        preview: `3 questions on ${trimmed}`,
        data,
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while generating the quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;
    setIsSubmitted(true);
  };

  const handleTryAgain = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
  };

  const handleNewQuiz = () => {
    setQuizData(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
  };

  // Score calculation
  let correctCount = 0;
  if (quizData && isSubmitted) {
    quizData.questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen && chosen.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        correctCount++;
      }
    });
  }
  const totalQuestions = quizData?.questions.length || 3;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* Quiz Generator Input Box (only shown if quiz not in progress or if requested) */}
      {!quizData && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Quiz Generator</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Test your understanding with a custom 3-question interactive quiz.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="mt-4 space-y-4">
            <div>
              <label htmlFor="quiz-topic" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quiz Topic
              </label>
              <input
                id="quiz-topic"
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Example: Python Functions, Organic Chemistry, World History..."
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 text-sm sm:text-base transition-all"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-xs text-slate-400 font-medium">Quick topics:</span>
              {sampleTopics.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTopic(sample)}
                  disabled={loading}
                  className="text-xs text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-0.5 rounded-md transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2.5 max-w-sm">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-medium capitalize border transition-all text-center ${
                      difficulty === d
                        ? 'bg-violet-50 border-violet-500 text-violet-700 font-semibold shadow-2xs ring-1 ring-violet-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm shadow-xs hover:shadow transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>EduGenie is crafting your quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Quiz Generation Notice</p>
            <p className="text-rose-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs animate-pulse space-y-4">
          <div className="h-5 bg-violet-100 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="h-14 bg-slate-100 rounded-xl" />
            <div className="h-14 bg-slate-100 rounded-xl" />
            <div className="h-14 bg-slate-100 rounded-xl" />
            <div className="h-14 bg-slate-100 rounded-xl" />
          </div>
        </div>
      )}

      {/* Interactive Quiz Active Mode */}
      {quizData && !isSubmitted && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          {/* Quiz Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-violet-100 text-violet-800">
                  {quizData.difficulty}
                </span>
                <h2 className="font-bold text-slate-900 text-base sm:text-lg">
                  {quizData.topic}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Answer all 3 questions to reveal your score and feedback
              </p>
            </div>

            {/* Stepper dots */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </span>
              <div className="flex gap-1.5 ml-2">
                {quizData.questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentQuestionIndex
                        ? 'bg-violet-600 ring-2 ring-violet-200 scale-110'
                        : selectedAnswers[idx]
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                    title={`Go to Question ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Current Question Card */}
          {(() => {
            const currentQ: QuizQuestion = quizData.questions[currentQuestionIndex];
            const chosenOption = selectedAnswers[currentQuestionIndex];
            const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
            const allAnswered = quizData.questions.every((_, i) => selectedAnswers[i]);

            return (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider block mb-1">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((opt, optIndex) => {
                    const isSelected = chosenOption === opt;
                    const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left text-sm sm:text-base transition-all select-none ${
                          isSelected
                            ? 'bg-violet-50/80 border-violet-500 text-violet-950 font-medium shadow-xs ring-2 ring-violet-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <span className="grow leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {!isLastQuestion ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-medium shadow-xs transition-all"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitQuiz}
                        disabled={!allAnswered}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Quiz</span>
                      </button>
                    )}
                  </div>
                </div>

                {!allAnswered && isLastQuestion && (
                  <p className="text-center text-xs text-amber-600">
                    Please answer all 3 questions before submitting.
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Quiz Results Screen */}
      {quizData && isSubmitted && (
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Score Header */}
          <div className="text-center py-4 bg-gradient-to-b from-violet-50/70 to-slate-50/50 rounded-2xl border border-violet-100">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-violet-200">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Quiz Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Topic: <span className="font-semibold text-slate-700">{quizData.topic}</span> ({quizData.difficulty})
            </p>

            {/* Score Indicator */}
            <div className="my-5 inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Score</span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-4xl font-extrabold text-violet-700">{correctCount}</span>
                <span className="text-xl font-bold text-slate-400">/ {totalQuestions}</span>
              </div>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  scorePercentage >= 67
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {scorePercentage}%
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {scorePercentage === 100
                ? 'Outstanding! You answered every question correctly.'
                : scorePercentage >= 67
                ? 'Great job! Review the explanations below to refine your understanding.'
                : 'Good effort! Review the questions and try again to improve your score.'}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={handleTryAgain}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={handleNewQuiz}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Generate New Quiz</span>
              </button>
            </div>
          </div>

          {/* Breakdown for each question */}
          <div className="space-y-5 pt-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
              Detailed Question Review & Explanations
            </h3>

            {quizData.questions.map((q, idx) => {
              const studentAnswer = selectedAnswers[idx];
              const isCorrect = studentAnswer && studentAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-white border text-slate-700">
                        Q{idx + 1}
                      </span>
                      <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                        {q.question}
                      </h4>
                    </div>

                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options review */}
                  <div className="space-y-1.5 mb-3 pl-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectChoice = opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                      const isStudentChoice = studentAnswer && studentAnswer.trim().toLowerCase() === opt.trim().toLowerCase();

                      let badgeClass = 'border-slate-200 bg-white text-slate-600';
                      if (isCorrectChoice) {
                        badgeClass = 'border-emerald-300 bg-emerald-100/70 text-emerald-900 font-semibold';
                      } else if (isStudentChoice && !isCorrect) {
                        badgeClass = 'border-rose-300 bg-rose-100/70 text-rose-900 line-through';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs sm:text-sm ${badgeClass}`}
                        >
                          <span className="font-mono text-xs w-4">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                          {isCorrectChoice && (
                            <span className="ml-auto text-[10px] font-bold text-emerald-700 uppercase">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isStudentChoice && !isCorrect && (
                            <span className="ml-auto text-[10px] font-bold text-rose-700 uppercase">
                              ✗ Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Card */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      💡 Explanation:
                    </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!quizData && !loading && !error && (
        <div className="p-8 text-center bg-slate-100/60 rounded-2xl border border-dashed border-slate-200">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-70" />
          <h3 className="font-semibold text-slate-700 text-sm">Test what you know</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Generate an interactive 3-question quiz with 4 options each, instant scoring, and complete explanations.
          </p>
        </div>
      )}
    </div>
  );
};
