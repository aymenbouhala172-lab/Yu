import React from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  Clock, 
  Flame, 
  BookOpen, 
  GraduationCap, 
  RotateCcw,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { UserProgress } from '../types';
import { CURRICULUM_DOORS } from '../data/curriculumData';

interface ProgressDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onOpenCertificate: (doorId: string) => void;
  onResetProgress: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  isOpen,
  onClose,
  progress,
  onOpenCertificate,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const totalLessons = CURRICULUM_DOORS.reduce((acc, d) => acc + d.lessons.length, 0);
  const completedLessons = progress.completedLessonIds.length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Calculate average score across completed quizzes
  const rawScores = Object.values(progress.lessonQuizScores);
  const quizScores = rawScores.filter((q: any): q is { score: number; total: number; date?: string } => 
    Boolean(q && typeof q.score === 'number' && typeof q.total === 'number')
  );
  let averageScore = 0;
  if (quizScores.length > 0) {
    const totalPercents = quizScores.reduce((acc: number, q: { score: number; total: number }) => acc + (q.score / q.total) * 100, 0);
    averageScore = Math.round(totalPercents / quizScores.length);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-xl text-stone-900">
                سِجِلُّ الإتقان والتأصيل الشرعي
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                متابعة التحصيل العلمي واجتياز الأبواب التدرجية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Main Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 shadow-2xs">
              <span className="text-xs text-stone-500 block">نسبة الإتقان العامة</span>
              <span className="font-mono text-2xl font-bold text-emerald-700">{progressPercent}%</span>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 shadow-2xs">
              <span className="text-xs text-stone-500 block">الدروس المتقنة</span>
              <span className="font-mono text-2xl font-bold text-amber-800">{completedLessons} / {totalLessons}</span>
              <span className="text-[10px] text-stone-500 block">درس منهجي</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 shadow-2xs">
              <span className="text-xs text-stone-500 block">معدل الاختبارات</span>
              <span className="font-mono text-2xl font-bold text-indigo-700">{averageScore}%</span>
              <span className="text-[10px] text-stone-500 block">دقة الاستيعاب</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 shadow-2xs">
              <span className="text-xs text-stone-500 block">أيام الالتزام</span>
              <span className="font-mono text-2xl font-bold text-orange-700 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-orange-600" />
                {progress.streakDays}
              </span>
              <span className="text-[10px] text-stone-500 block">ورد متواصل</span>
            </div>
          </div>

          {/* Door-by-Door Mastery Breakdown */}
          <div className="space-y-3">
            <h4 className="font-amiri font-bold text-lg text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-700" />
              <span>تفصيل الإتقان بحسب الأبواب التدرجية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURRICULUM_DOORS.map((door) => {
                const doorLessons = door.lessons;
                const completedInDoor = doorLessons.filter(l => progress.completedLessonIds.includes(l.id)).length;
                const isMastered = completedInDoor === doorLessons.length;
                const isUnlocked = progress.unlockedDoorIds.includes(door.id);
                const percent = Math.round((completedInDoor / doorLessons.length) * 100);

                return (
                  <div
                    key={door.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-2xs ${
                      isMastered
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : isUnlocked
                        ? 'bg-white border-stone-200'
                        : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-cairo font-bold text-sm text-stone-900">
                          {door.title}
                        </h5>
                        {isMastered && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                            مُتقن بالكامل
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-1 mt-1 font-sans">
                        {door.pedagogicalGoal}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      <div className="flex justify-between text-xs text-stone-600">
                        <span>الدروس: {completedInDoor}/{doorLessons.length}</span>
                        <span className="font-mono">{percent}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isMastered ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {isMastered && (
                      <button
                        onClick={() => onOpenCertificate(door.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-amber-800" />
                        <span>معاينة شهادة إتقان الباب</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Golden Quote */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
            <p className="font-amiri font-bold text-amber-950 text-base">
              «طَلَبُ العِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ»
            </p>
            <p className="text-xs text-stone-600">
              واصل مسيرتك المباركة بتأنٍّ وتثبّت، فالعلم يُنال بالتدرج لا بالطفرة.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط السجل والبدء من جديد؟')) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط السجل كاملاً</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-xs font-bold text-stone-800 border border-stone-300 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
