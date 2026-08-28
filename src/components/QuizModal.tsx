import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowLeft, 
  RotateCcw, 
  Award,
  BookOpen,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LessonContent, QuizQuestion } from '../types';

interface QuizModalProps {
  lesson: LessonContent;
  doorTitle: string;
  onClose: () => void;
  onPassLesson: (lessonId: string, score: number, total: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  lesson,
  doorTitle,
  onClose,
  onPassLesson,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(lesson.quiz);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loadingAiQuestion, setLoadingAiQuestion] = useState(false);

  const currentQ = questions[currentIndex];
  const isSelected = selectedAnswers[currentIndex] !== undefined;
  const isCurrentCorrect = isSelected && selectedAnswers[currentIndex] === currentQ.correctIndex;

  const handleSelectOption = (index: number) => {
    if (showExplanation) return; // Prevent changing after revealing
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: index,
    }));
  };

  const handleConfirmAnswer = () => {
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const passed = correctCount === questions.length;
    if (passed) {
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#fbbf24', '#34d399'],
        });
      } catch (e) {
        // ignore
      }
      onPassLesson(lesson.id, correctCount, questions.length);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsFinished(false);
    setCurrentIndex(0);
  };

  const handleGenerateAiQuestion = async () => {
    setLoadingAiQuestion(true);
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doorTitle,
          lessonTitle: lesson.title,
          centralRule: lesson.centralRule,
          level: lesson.level,
        }),
      });
      const data = await res.json();
      if (data && data.question && Array.isArray(data.options)) {
        const newQ: QuizQuestion = {
          id: `ai-q-${Date.now()}`,
          question: data.question,
          options: data.options,
          correctIndex: typeof data.correctIndex === 'number' ? data.correctIndex : 0,
          explanation: data.explanation || 'تم التحقق من الإجابة وفق الضابط الشرعي.',
          evidenceReference: data.evidenceReference,
        };
        setQuestions(prev => [...prev, newQ]);
        setCurrentIndex(questions.length);
        setShowExplanation(false);
        setIsFinished(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiQuestion(false);
    }
  };

  let totalCorrect = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) totalCorrect++;
  });
  const passed = totalCorrect === questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-lg text-stone-900">
                اختبار إتقان الدرس والتحقق المنهجي
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                {lesson.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {!isFinished ? (
            <>
              {/* Progress indicator */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>سؤال {currentIndex + 1} من {questions.length}</span>
                <div className="flex gap-1.5">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-1.5 rounded-full transition-colors ${
                        i === currentIndex
                          ? 'bg-amber-600'
                          : selectedAnswers[i] !== undefined
                          ? 'bg-emerald-600'
                          : 'bg-stone-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                <p className="font-amiri font-bold text-lg sm:text-xl text-stone-900 leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isOptSelected = selectedAnswers[currentIndex] === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;
                  
                  let btnStyle = 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800 cursor-pointer';
                  if (isOptSelected && !showExplanation) {
                    btnStyle = 'bg-amber-50 border-amber-500 text-amber-950 font-semibold ring-1 ring-amber-400';
                  } else if (showExplanation) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isOptSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                    } else {
                      btnStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={showExplanation}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-right p-4 rounded-2xl border text-sm sm:text-base transition-all flex items-start justify-between gap-3 shadow-2xs ${btnStyle}`}
                    >
                      <span className="leading-relaxed">{opt}</span>
                      <span className="shrink-0 mt-0.5">
                        {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        {showExplanation && isOptSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Revealed after confirming) */}
              {showExplanation && (
                <div className={`p-4 rounded-2xl border space-y-2 animate-fadeIn ${
                  isCurrentCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {isCurrentCorrect ? (
                      <span className="text-emerald-800 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> إجابة صحيحة وموفقة
                      </span>
                    ) : (
                      <span className="text-rose-800 flex items-center gap-1 font-bold">
                        <XCircle className="w-4 h-4 text-rose-600" /> إجابة غير دقيقة، راجع الضابط التالي
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
                    {currentQ.explanation}
                  </p>
                  {currentQ.evidenceReference && (
                    <p className="text-xs text-amber-900 pt-2 border-t border-stone-200">
                      <strong>الدليل المعتمد: </strong>{currentQ.evidenceReference}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-amber-50 border-2 border-amber-300">
                {passed ? (
                  <Award className="w-8 h-8 text-amber-700 animate-bounce" />
                ) : (
                  <RotateCcw className="w-8 h-8 text-rose-600" />
                )}
              </div>

              <div>
                <h4 className="font-amiri font-bold text-2xl text-stone-900">
                  {passed ? 'هنيئاً لك! تم إتقان الدرس بنجاح' : 'لم تستوفِ شرط الإتقان الكامل'}
                </h4>
                <p className="text-sm text-stone-600 mt-1">
                  درجتك المحصلة: <span className="font-bold text-amber-800 font-mono text-base">{totalCorrect}</span> من أصل <span className="font-mono text-base">{questions.length}</span>
                </p>
              </div>

              {passed ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 space-y-1">
                  <p className="font-bold">✨ تم فتح الدرس التالي وتحديث سجل تحصيلك الشرعي!</p>
                  <p className="text-stone-700">«من يرد الله به خيراً يفقهه في الدين» - متفق عليه.</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-900">
                  <p>المنهجية تقتضي الإتقان التام؛ راجع مواضع الخطأ وأعد الاختبار لفتح الدرس التالي.</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!passed && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة المحاولة وتثبيت الفهم</span>
                  </button>
                )}

                <button
                  disabled={loadingAiQuestion}
                  onClick={handleGenerateAiQuestion}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-semibold cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>{loadingAiQuestion ? 'جاري التوليد...' : 'توليد سؤال إضافي بالذكاء الاصطناعي'}</span>
                </button>

                {passed && (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs cursor-pointer"
                  >
                    <span>متابعة المسيرة المنهجية</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        {!isFinished && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              إلغاء والعودة للدرس
            </button>

            {!showExplanation ? (
              <button
                disabled={selectedAnswers[currentIndex] === undefined}
                onClick={handleConfirmAnswer}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer"
              >
                <span>تأكيد الإجابة وعرض الدليل</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer"
              >
                <span>{currentIndex < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
