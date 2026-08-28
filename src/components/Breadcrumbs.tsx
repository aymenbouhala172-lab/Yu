import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  ChevronLeft, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  ChevronDown, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Compass,
  Layers,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Door, LessonContent, UserProgress } from '../types';
import { CURRICULUM_DOORS } from '../data/curriculumData';

interface BreadcrumbsProps {
  activeDoor: Door;
  activeLesson: LessonContent;
  progress: UserProgress;
  onSelectDoor: (doorId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  isNextLessonUnlocked: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  activeDoor,
  activeLesson,
  progress,
  onSelectDoor,
  onSelectLesson,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson,
  hasNextLesson,
  isNextLessonUnlocked,
}) => {
  const [isDoorMenuOpen, setIsDoorMenuOpen] = useState(false);
  const [isLessonMenuOpen, setIsLessonMenuOpen] = useState(false);

  const doorMenuRef = useRef<HTMLDivElement>(null);
  const lessonMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (doorMenuRef.current && !doorMenuRef.current.contains(e.target as Node)) {
        setIsDoorMenuOpen(false);
      }
      if (lessonMenuRef.current && !lessonMenuRef.current.contains(e.target as Node)) {
        setIsLessonMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const completedLessonsInDoor = activeDoor.lessons.filter(l => 
    progress.completedLessonIds.includes(l.id)
  ).length;

  const isCurrentLessonCompleted = progress.completedLessonIds.includes(activeLesson.id);

  return (
    <nav 
      aria-label="مسار التنقل والانتقال السريع"
      className="bg-white border border-stone-200 rounded-2xl px-3.5 sm:px-5 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-stone-700 relative z-30"
    >
      {/* Left / Start: Breadcrumb Trail Hierarchy */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        
        {/* Level 0: Home / Curriculum Root */}
        <button
          onClick={() => onSelectDoor(CURRICULUM_DOORS[0].id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 transition-all font-medium cursor-pointer"
          title="العودة لأول أبواب المنهاج"
        >
          <Home className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline font-cairo">المنهاج</span>
        </button>

        <ChevronLeft className="w-3.5 h-3.5 text-stone-400 shrink-0" />

        {/* Level 1: Door Dropdown Selector */}
        <div className="relative" ref={doorMenuRef}>
          <button
            onClick={() => {
              setIsDoorMenuOpen(!isDoorMenuOpen);
              setIsLessonMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border cursor-pointer ${
              isDoorMenuOpen
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 hover:border-amber-300'
            }`}
            title="انقر لتغيير الباب مباشرة"
          >
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-amiri font-bold text-sm sm:text-base leading-none line-clamp-1 max-w-[140px] sm:max-w-[200px]">
              {activeDoor.shortTitle}
            </span>
            <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isDoorMenuOpen ? 'rotate-180 text-amber-700' : ''}`} />
          </button>

          {/* Door Dropdown Menu with Motion */}
          <AnimatePresence>
            {isDoorMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 space-y-1.5 z-50 overflow-hidden"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-stone-500 border-b border-stone-100 flex items-center justify-between">
                  <span>أبواب المنهاج الشرعي ({CURRICULUM_DOORS.length})</span>
                  <span className="text-amber-700 font-mono font-bold">انتقال فوري</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 p-0.5">
                  {CURRICULUM_DOORS.map((door, dIdx) => {
                    const isUnlocked = progress.unlockedDoorIds.includes(door.id);
                    const isSelected = door.id === activeDoor.id;
                    const doneInDoor = door.lessons.filter(l => progress.completedLessonIds.includes(l.id)).length;
                    const isMastered = doneInDoor === door.lessons.length;

                    return (
                      <button
                        key={door.id}
                        onClick={() => {
                          if (isUnlocked) {
                            onSelectDoor(door.id);
                            setIsDoorMenuOpen(false);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`w-full text-right px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                            : isUnlocked
                            ? 'hover:bg-stone-50 text-stone-700 border border-transparent'
                            : 'text-stone-400 opacity-50 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isMastered 
                              ? 'bg-emerald-600 text-white' 
                              : isSelected 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {isMastered ? '✓' : dIdx + 1}
                          </span>
                          <span className="font-cairo">{door.title}</span>
                        </div>

                        <div>
                          {!isUnlocked ? (
                            <Lock className="w-3.5 h-3.5 text-stone-400" />
                          ) : (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-bold">
                              {doneInDoor}/{door.lessons.length}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ChevronLeft className="w-3.5 h-3.5 text-stone-400 shrink-0" />

        {/* Level 2: Current Lesson Dropdown Selector */}
        <div className="relative" ref={lessonMenuRef}>
          <button
            onClick={() => {
              setIsLessonMenuOpen(!isLessonMenuOpen);
              setIsDoorMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border cursor-pointer ${
              isLessonMenuOpen
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 hover:border-amber-300'
            }`}
            title="انقر لتغيير الدرس أو الانتقال لدرس آخر في نفس الباب"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-cairo text-xs sm:text-sm line-clamp-1 max-w-[130px] sm:max-w-[220px]">
              الدرس {activeLesson.order}: {activeLesson.title}
            </span>
            <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isLessonMenuOpen ? 'rotate-180 text-amber-700' : ''}`} />
          </button>

          {/* Lesson Dropdown Menu with Motion */}
          <AnimatePresence>
            {isLessonMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-72 sm:w-84 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 space-y-1.5 z-50 overflow-hidden"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-stone-500 border-b border-stone-100 flex items-center justify-between">
                  <span>دروس {activeDoor.shortTitle} ({activeDoor.lessons.length})</span>
                  <span className="text-amber-700 font-mono font-bold">انتقال فوري</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 p-0.5">
                  {activeDoor.lessons.map((lesson, lIdx) => {
                    const isCompleted = progress.completedLessonIds.includes(lesson.id);
                    const isSelected = lesson.id === activeLesson.id;
                    const isUnlocked = lIdx === 0 || progress.completedLessonIds.includes(activeDoor.lessons[lIdx - 1].id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (isUnlocked) {
                            onSelectLesson(lesson.id);
                            setIsLessonMenuOpen(false);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`w-full text-right px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                            : isCompleted
                            ? 'hover:bg-stone-50 text-stone-800 border border-transparent'
                            : isUnlocked
                            ? 'hover:bg-stone-50 text-stone-700 border border-transparent'
                            : 'text-stone-400 opacity-50 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : isSelected 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {lesson.order}
                          </span>
                          <span className="font-cairo line-clamp-1">{lesson.title}</span>
                        </div>

                        <div>
                          {!isUnlocked ? (
                            <Lock className="w-3.5 h-3.5 text-stone-400" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <span className="text-[10px] text-amber-800 font-bold px-1.5 py-0.5 rounded bg-amber-100">
                              جاري
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lesson Status Badge */}
        <span className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
          isCurrentLessonCompleted 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {isCurrentLessonCompleted ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>مُتقن</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>قيد التحصيل</span>
            </>
          )}
        </span>

      </div>

      {/* Right / End: Quick Previous / Next Lesson Shortcuts */}
      <div className="flex items-center gap-1.5 mr-auto">
        {hasPrevLesson && (
          <button
            onClick={onPrevLesson}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="الانتقال إلى الدرس السابق"
          >
            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden xl:inline">الدرس السابق</span>
          </button>
        )}

        {hasNextLesson && (
          <button
            onClick={onNextLesson}
            disabled={!isNextLessonUnlocked}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs border cursor-pointer ${
              isNextLessonUnlocked
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                : 'bg-stone-100 text-stone-400 border-stone-200 opacity-60 cursor-not-allowed'
            }`}
            title={isNextLessonUnlocked ? 'الانتقال إلى الدرس التالي' : 'مغلق حتى إتقان الدرس الحالي'}
          >
            <span className="hidden xl:inline">الدرس التالي</span>
            <ArrowLeft className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

    </nav>
  );
};
