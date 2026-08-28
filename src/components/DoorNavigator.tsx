import React from 'react';
import { 
  ShieldCheck, 
  Scale, 
  HeartHandshake, 
  BookOpenCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';
import { Door, LessonContent, UserProgress } from '../types';

interface DoorNavigatorProps {
  door: Door;
  activeLessonId: string;
  progress: UserProgress;
  onSelectLesson: (lessonId: string) => void;
  onRequestCertificate?: (doorId: string) => void;
}

export const DoorNavigator: React.FC<DoorNavigatorProps> = ({
  door,
  activeLessonId,
  progress,
  onSelectLesson,
  onRequestCertificate,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'Scale': return <Scale className="w-6 h-6 text-amber-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6 text-rose-400" />;
      case 'BookOpenCheck': return <BookOpenCheck className="w-6 h-6 text-indigo-400" />;
      default: return <BookOpen className="w-6 h-6 text-amber-400" />;
    }
  };

  const completedLessons = door.lessons.filter(l => progress.completedLessonIds.includes(l.id));
  const isDoorMastered = completedLessons.length === door.lessons.length;

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-6 shadow-xs">
      {/* Door Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
            {getIcon(door.iconName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-amiri font-bold text-xl sm:text-2xl text-stone-900">
                {door.title}
              </h2>
              {isDoorMastered && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  مُتقن ومُجاز
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {door.pedagogicalGoal}
            </p>
          </div>
        </div>

        {/* Certificate Claim Button if Mastered */}
        {isDoorMastered && (
          <button
            onClick={() => onRequestCertificate && onRequestCertificate(door.id)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white border border-amber-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Award className="w-4 h-4 text-white" />
            <span>عرض شهادة إتقان الباب</span>
          </button>
        )}
      </div>

      {/* Sequential Lessons Ladder */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {door.lessons.map((lesson, idx) => {
          const isCompleted = progress.completedLessonIds.includes(lesson.id);
          const isSelected = activeLessonId === lesson.id;
          
          const isUnlocked = true; // All lessons accessible to visitors for reading
          const quizScore = progress.lessonQuizScores[lesson.id];

          const getLevelBadge = (lvl: string) => {
            switch (lvl) {
              case 'beginner':
                return { text: 'مستوى تأسيسي', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
              case 'intermediate':
                return { text: 'مستوى تأصيلي', color: 'bg-blue-50 text-blue-800 border-blue-200' };
              case 'advanced':
                return { text: 'مستوى تحقيقي', color: 'bg-purple-50 text-purple-800 border-purple-200' };
              default:
                return { text: 'درس منهجي', color: 'bg-stone-50 text-stone-700 border-stone-200' };
            }
          };

          const badge = getLevelBadge(lesson.level);

          return (
            <button
              key={lesson.id}
              onClick={() => isUnlocked && onSelectLesson(lesson.id)}
              disabled={!isUnlocked}
              className={`relative text-right p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-3.5 cursor-pointer ${
                isSelected
                  ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                  : isCompleted
                  ? 'bg-white hover:bg-emerald-50/30 border-emerald-200 text-stone-800'
                  : isUnlocked
                  ? 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                  : 'bg-stone-50 border-stone-200 text-stone-400 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Top Row: Number & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isSelected
                      ? 'bg-amber-600 text-white font-black shadow-xs'
                      : isUnlocked
                      ? 'bg-stone-100 text-stone-700'
                      : 'bg-stone-100 text-stone-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-sans font-bold ${badge.color}`}>
                    {badge.text}
                  </span>
                </div>

                <div>
                  {!isUnlocked ? (
                    <span title="مغلق حتى إتقان الدرس السابق" className="p-1 rounded-md bg-stone-100 text-stone-400 inline-block">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  ) : isCompleted ? (
                    <span title="تم اجتياز اختبار الإتقان بنجاح" className="text-emerald-700 flex items-center gap-1 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {quizScore?.score && `${quizScore.score}/${quizScore.total}`}
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-800 font-bold px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200">قيد التحصيل</span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className={`font-cairo font-bold text-sm sm:text-base leading-snug line-clamp-2 ${
                  isSelected ? 'text-amber-900' : isUnlocked ? 'text-stone-900' : 'text-stone-400'
                }`}>
                  {lesson.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-sans">
                  {lesson.subtitle}
                </p>
              </div>

              {/* Footer Row */}
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2.5 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {lesson.estimatedMinutes} دقيقة
                </span>
                <span className={`flex items-center gap-1 font-bold ${
                  isSelected ? 'text-amber-800' : 'text-stone-600'
                }`}>
                  {isSelected ? 'تدرس حالياً' : isUnlocked ? 'فتح الدرس' : 'مقفل'}
                  <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
