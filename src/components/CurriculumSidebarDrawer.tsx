import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck, 
  Scale, 
  HeartHandshake, 
  BookOpenCheck, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Sparkles, 
  Flame, 
  Award, 
  BookOpen, 
  Layers,
  GraduationCap,
  ArrowRight,
  Compass
} from 'lucide-react';
import { Door, UserProgress, LessonContent } from '../types';
import { CURRICULUM_DOORS } from '../data/curriculumData';
import { BOLD_DILEMMAS } from '../data/boldDilemmasData';

interface CurriculumSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoorId: string;
  activeLessonId: string;
  progress: UserProgress;
  onSelectDoorAndLesson: (doorId: string, lessonId: string) => void;
  onOpenScholar?: (prompt?: string) => void;
  onOpenFlashcards?: () => void;
  onOpenDashboard?: () => void;
  onOpenBoldInquiries?: (dilemmaId?: string) => void;
}

export const CurriculumSidebarDrawer: React.FC<CurriculumSidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeDoorId,
  activeLessonId,
  progress,
  onSelectDoorAndLesson,
  onOpenScholar,
  onOpenFlashcards,
  onOpenDashboard,
  onOpenBoldInquiries,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'aqeedah' | 'fiqh' | 'tazkiyah' | 'uloom' | 'bold'>('all');
  const [expandedDoors, setExpandedDoors] = useState<Record<string, boolean>>({
    'door-aqeedah': true,
    'door-fiqh': true,
    'door-tazkiyah': true,
    'door-uloom': true,
    'bold-inquiries': true,
  });

  const toggleDoor = (doorId: string) => {
    setExpandedDoors(prev => ({
      ...prev,
      [doorId]: !prev[doorId],
    }));
  };

  const getDoorIcon = (iconName: string, category: string) => {
    switch (category) {
      case 'aqeedah':
        return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
      case 'fiqh':
        return <Scale className="w-5 h-5 text-amber-700" />;
      case 'tazkiyah':
        return <HeartHandshake className="w-5 h-5 text-rose-700" />;
      case 'uloom':
        return <BookOpenCheck className="w-5 h-5 text-indigo-700" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-700" />;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return { text: 'تأسيسي', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'intermediate': return { text: 'تأصيلي', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'advanced': return { text: 'تحقيقي', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default: return { text: 'عام', color: 'bg-stone-50 text-stone-700 border-stone-200' };
    }
  };

  // Filtered Doors & Lessons
  const filteredCurriculum = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return CURRICULUM_DOORS.map(door => {
      // Category filter check
      if (selectedCategoryFilter !== 'all' && selectedCategoryFilter !== 'bold' && door.category !== selectedCategoryFilter) {
        return null;
      }
      if (selectedCategoryFilter === 'bold') {
        return null;
      }

      // If query is present, search within door title and lessons
      const matchedLessons = door.lessons.filter(lesson => {
        if (!query) return true;
        return (
          lesson.title.toLowerCase().includes(query) ||
          lesson.subtitle.toLowerCase().includes(query) ||
          lesson.centralRule.toLowerCase().includes(query)
        );
      });

      const matchesDoorTitle = door.title.toLowerCase().includes(query) || door.description.toLowerCase().includes(query);

      if (query && !matchesDoorTitle && matchedLessons.length === 0) {
        return null;
      }

      return {
        ...door,
        lessons: query && !matchesDoorTitle ? matchedLessons : door.lessons,
      };
    }).filter(Boolean) as Door[];
  }, [searchQuery, selectedCategoryFilter]);

  // Filtered Bold Dilemmas
  const filteredBoldDilemmas = useMemo(() => {
    if (selectedCategoryFilter !== 'all' && selectedCategoryFilter !== 'bold') {
      return [];
    }
    const query = searchQuery.trim().toLowerCase();
    if (!query) return BOLD_DILEMMAS;
    return BOLD_DILEMMAS.filter(d => 
      d.title.toLowerCase().includes(query) || 
      d.boldQuestion.toLowerCase().includes(query) ||
      d.categoryLabel.toLowerCase().includes(query)
    );
  }, [searchQuery, selectedCategoryFilter]);

  // Total lesson stats
  const totalLessons = CURRICULUM_DOORS.reduce((acc, d) => acc + d.lessons.length, 0);
  const completedLessonsCount = progress.completedLessonIds.length;
  const overallProgressPercent = Math.round((completedLessonsCount / totalLessons) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs cursor-pointer z-50"
          />

          {/* Drawer Container (Opens from the Right naturally in Arabic RTL) */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pr-0 z-50 pointer-events-none">
            <motion.div
              initial={{ x: '100%', opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-screen max-w-md sm:max-w-lg bg-white border-l border-stone-200 text-stone-900 shadow-2xl flex flex-col h-full overflow-hidden pointer-events-auto"
            >
              
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-amiri font-bold text-lg sm:text-xl text-stone-900 leading-tight">
                      أبواب الفقه والمنهاج الشامل
                    </h2>
                    <p className="text-xs text-stone-500 font-sans">
                      انقر على أي باب أو درس للدخول المباشر والمدارسة
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                  title="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overall Progress Mini Strip */}
              <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-200/80 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-amber-950 font-cairo">الإنجاز الأكاديمي الكلي:</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgressPercent}%` }}
                    />
                  </div>
                  <span className="font-bold font-mono text-emerald-800">{completedLessonsCount}/{totalLessons}</span>
                </div>
              </div>

              {/* Search Box */}
              <div className="p-3 bg-white border-b border-stone-200 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن درس، باب، ضابط فقهي، أو مسألة..."
                    className="w-full pr-10 pl-8 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Quick Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 text-xs">
                  <button
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    الكل ({totalLessons})
                  </button>
                  <button
                    onClick={() => setSelectedCategoryFilter('aqeedah')}
                    className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === 'aqeedah'
                        ? 'bg-emerald-700 text-white font-bold shadow-xs'
                        : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/60'
                    }`}
                  >
                    العقيدة
                  </button>
                  <button
                    onClick={() => setSelectedCategoryFilter('fiqh')}
                    className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === 'fiqh'
                        ? 'bg-amber-700 text-white font-bold shadow-xs'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                    }`}
                  >
                    الفقه والأصول
                  </button>
                  <button
                    onClick={() => setSelectedCategoryFilter('tazkiyah')}
                    className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === 'tazkiyah'
                        ? 'bg-rose-700 text-white font-bold shadow-xs'
                        : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200/60'
                    }`}
                  >
                    التزكية
                  </button>
                  <button
                    onClick={() => setSelectedCategoryFilter('uloom')}
                    className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === 'uloom'
                        ? 'bg-indigo-700 text-white font-bold shadow-xs'
                        : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200/60'
                    }`}
                  >
                    علوم الوحي
                  </button>
                  <button
                    onClick={() => setSelectedCategoryFilter('bold')}
                    className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === 'bold'
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'bg-orange-50 text-orange-900 hover:bg-orange-100 border border-orange-200/60'
                    }`}
                  >
                    المباحث الجريئة
                  </button>
                </div>
              </div>

              {/* Main Scrollable Content: Hierarchy List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-stone-50/50">
                
                {/* Curriculum Doors */}
                {filteredCurriculum.map((door) => {
                  const isExpanded = expandedDoors[door.id] ?? true;
                  const isUnlocked = progress.unlockedDoorIds.includes(door.id);
                  const isCurrentDoor = activeDoorId === door.id;
                  
                  const completedInDoor = door.lessons.filter(l => progress.completedLessonIds.includes(l.id)).length;
                  const isDoorMastered = completedInDoor === door.lessons.length && door.lessons.length > 0;
                  const percent = Math.round((completedInDoor / door.lessons.length) * 100);

                  return (
                    <div 
                      key={door.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isCurrentDoor 
                          ? 'border-amber-400 bg-white shadow-sm' 
                          : 'border-stone-200 bg-white shadow-2xs'
                      }`}
                    >
                      {/* Door Header with Direct Navigation & Toggle */}
                      <div className="w-full p-3.5 text-right flex items-center justify-between gap-3 hover:bg-stone-50/90 transition-colors">
                        <div 
                          onClick={() => {
                            const firstLesson = door.lessons[0];
                            if (firstLesson) {
                              onSelectDoorAndLesson(door.id, firstLesson.id);
                              onClose();
                            }
                          }}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
                          title="انقر لدخول هذا الباب مباشرة"
                        >
                          <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                            isDoorMastered 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : isCurrentDoor 
                              ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400/40' 
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {getDoorIcon(door.iconName, door.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-amiri font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors truncate">
                                {door.title}
                              </h3>
                              {isDoorMastered && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                  مُتقن ✓
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                              <span className="text-amber-800 font-bold group-hover:underline">دخول الباب ({door.lessons.length} دروس) ←</span>
                              <span>•</span>
                              <span className="font-mono text-emerald-700 font-semibold">{completedInDoor} مكتمل</span>
                            </div>
                          </div>
                        </div>

                        {/* Accordion toggle button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDoor(door.id);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer shrink-0"
                          title={isExpanded ? 'طي الدروس' : 'عرض الدروس'}
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Lessons List inside Door */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-stone-100 bg-stone-50/60 p-2 space-y-1.5"
                          >
                            {door.lessons.map((lesson, idx) => {
                              const isCompleted = progress.completedLessonIds.includes(lesson.id);
                              const isSelected = activeLessonId === lesson.id;
                              const isLessonUnlocked = true; // All lessons accessible to visitors for reading
                              const levelBadge = getLevelLabel(lesson.level);
                              const quizScore = progress.lessonQuizScores[lesson.id];

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => {
                                    onSelectDoorAndLesson(door.id, lesson.id);
                                    onClose();
                                  }}
                                  className={`w-full text-right p-3 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs sm:text-sm group cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs font-semibold'
                                      : 'bg-white hover:bg-amber-50/50 border-stone-200/80 text-stone-800 hover:border-amber-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                    {/* Number / Status Icon */}
                                    <div className="mt-0.5 shrink-0">
                                      {isCompleted ? (
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                      ) : isLessonUnlocked ? (
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                                          isSelected ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'
                                        }`}>
                                          {idx + 1}
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-400 flex items-center justify-center">
                                          <Lock className="w-3 h-3" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Title and metadata */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-bold truncate text-stone-900 leading-snug">
                                          {lesson.title}
                                        </p>
                                        {isSelected && (
                                          <span className="px-2 py-0.2 rounded-full bg-amber-200 text-amber-950 text-[10px] font-bold shrink-0">
                                            الدرس الحالي
                                          </span>
                                        )}
                                      </div>
                                      
                                      <p className="text-[11px] text-stone-500 line-clamp-1">
                                        {lesson.subtitle}
                                      </p>

                                      <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                                        <span className={`px-2 py-0.5 rounded border font-medium ${levelBadge.color}`}>
                                          {levelBadge.text}
                                        </span>
                                        <span className="flex items-center gap-1 text-stone-400">
                                          <Clock className="w-3 h-3" />
                                          {lesson.estimatedMinutes} دقيقة
                                        </span>
                                        {quizScore && (
                                          <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                            درجة الاختبار: {quizScore.score}/{quizScore.total}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 mt-1 text-stone-400 group-hover:text-amber-700 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                  </div>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Section: Bold Inquiries (المباحث الجريئة والنوازل المعاصرة) */}
                {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'bold') && filteredBoldDilemmas.length > 0 && (
                  <div className="rounded-2xl border border-orange-200 bg-white shadow-2xs overflow-hidden">
                    <button
                      onClick={() => toggleDoor('bold-inquiries')}
                      className="w-full p-3.5 text-right flex items-center justify-between gap-3 hover:bg-orange-50/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-xl bg-orange-100 text-orange-800 shrink-0 border border-orange-200">
                          <Flame className="w-5 h-5 text-orange-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-amiri font-bold text-base text-stone-900 truncate">
                              منبر المباحث الجريئة والنوازل الكبرى
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[10px] font-bold border border-orange-200">
                              {filteredBoldDilemmas.length} مسائل
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 truncate mt-0.5">
                            معضلة الشر، الذكاء الاصطناعي، التطور، الهندسة الوراثية
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-stone-400">
                          {expandedDoors['bold-inquiries'] ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {(expandedDoors['bold-inquiries'] ?? true) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-orange-100 bg-orange-50/30 p-2 space-y-1.5"
                        >
                          {filteredBoldDilemmas.map((dilemma, idx) => (
                            <button
                              key={dilemma.id}
                              onClick={() => {
                                onOpenBoldInquiries && onOpenBoldInquiries(dilemma.id);
                                onClose();
                              }}
                              className="w-full text-right p-3 rounded-xl bg-white hover:bg-orange-50 border border-stone-200 hover:border-orange-300 text-xs sm:text-sm transition-all flex items-start justify-between gap-3 group shadow-2xs cursor-pointer"
                            >
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5 border border-orange-200">
                                  {idx + 1}
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-bold text-stone-900 truncate">
                                      {dilemma.title}
                                    </p>
                                    <span className="px-2 py-0.2 rounded bg-orange-100 text-orange-900 text-[10px] font-semibold shrink-0">
                                      {dilemma.categoryLabel}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-500 line-clamp-1">
                                    {dilemma.boldQuestion}
                                  </p>
                                </div>
                              </div>
                              <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-orange-700 transition-colors shrink-0 mt-1" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Empty State */}
                {filteredCurriculum.length === 0 && filteredBoldDilemmas.length === 0 && (
                  <div className="text-center py-12 px-4 space-y-3">
                    <Compass className="w-10 h-10 text-stone-400 mx-auto" />
                    <p className="font-bold text-stone-700 text-sm">
                      لم يتم العثور على دروس تطابق «{searchQuery}»
                    </p>
                    <p className="text-xs text-stone-500">
                      جرب البحث بكلمات أخرى أو مسح شريط البحث.
                    </p>
                  </div>
                )}

              </div>

              {/* Drawer Bottom Quick Action Bar */}
              <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2 shrink-0">
                <button
                  onClick={() => {
                    onOpenScholar && onOpenScholar();
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs shadow-xs hover:from-amber-700 hover:to-amber-800 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اسأل العالم الذكي</span>
                </button>

                <button
                  onClick={() => {
                    onOpenFlashcards && onOpenFlashcards();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200 shadow-2xs transition-all cursor-pointer"
                  title="بطاقات استحضار الضوابط"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-700" />
                  <span className="hidden sm:inline">البطاقات</span>
                </button>

                <button
                  onClick={() => {
                    onOpenDashboard && onOpenDashboard();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 shadow-2xs transition-all cursor-pointer"
                  title="سجل الإنجاز والشهادات"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">الشهادات</span>
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      )}
    </AnimatePresence>
  );
};
