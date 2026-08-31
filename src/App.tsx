import React, { useState, useEffect, useRef } from 'react';
import { CURRICULUM_DOORS } from './data/curriculumData';
import { BOLD_DILEMMAS } from './data/boldDilemmasData';
import { UserProgress, Door, LessonContent } from './types';
import { loadUserProgress, saveUserProgress, INITIAL_PROGRESS } from './utils/storage';
import { Header } from './components/Header';
import { DoorNavigator } from './components/DoorNavigator';
import { LessonViewer } from './components/LessonViewer';
import { QuizModal } from './components/QuizModal';
import { AiScholarDrawer } from './components/AiScholarDrawer';
import { ProgressDashboard } from './components/ProgressDashboard';
import { CertificateModal } from './components/CertificateModal';
import { BoldInquiriesHomeView } from './components/BoldInquiriesHomeView';
import { CurriculumSidebarDrawer } from './components/CurriculumSidebarDrawer';
import { FlashcardsView } from './components/FlashcardsView';
import { SearchModal } from './components/SearchModal';
import { Breadcrumbs } from './components/Breadcrumbs';
import { AuthScreen } from './components/AuthScreen';
import { getSession, endSession, SessionUser } from './utils/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Flame, 
  HelpCircle, 
  Brain, 
  ArrowLeft,
  ArrowRight,
  Compass,
  BookOpen,
  Layers,
  Search,
  Menu,
  MoreVertical
} from 'lucide-react';

export default function App() {
  // Authentication gate: user must register/login before entering the app
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(getSession);

  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);
  const [activeDoorId, setActiveDoorId] = useState<string>('door-aqeedah');
  const [activeLessonId, setActiveLessonId] = useState<string>('aqeedah-1');

  // Page View Modes: 'bold-inquiries' (DEFAULT: Main 600 Inquiries Hub) | 'lesson' (Focused Study View) | 'scholar' (Full Screen Scholar)
  const [viewMode, setViewMode] = useState<'bold-inquiries' | 'lesson' | 'scholar'>('bold-inquiries');

  // Modal & Drawer States
  const [isCurriculumDrawerOpen, setIsCurriculumDrawerOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [scholarInitialPrompt, setScholarInitialPrompt] = useState<string | undefined>(undefined);
  const [scholarInitialHistoryOpen, setScholarInitialHistoryOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [certificateDoorId, setCertificateDoorId] = useState<string>('door-aqeedah');
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);

  // Touch Swipe Gesture Detection (Swipe left -> opens 3-dots drawer)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX.current - touchEndX; // positive = swiped left
    const deltaY = Math.abs(touchStartY.current - touchEndY);

    // If horizontal swipe is dominant and significant
    if (Math.abs(deltaX) > 65 && deltaY < 60) {
      if (deltaX > 0) {
        // Swiped leftwards -> Open the curriculum hierarchy drawer
        setIsCurriculumDrawerOpen(true);
      } else {
        // Swiped rightwards -> Close the drawer if open
        setIsCurriculumDrawerOpen(false);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Sync progress changes to LocalStorage
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Current active Door & Lesson objects
  const activeDoor = CURRICULUM_DOORS.find(d => d.id === activeDoorId) || CURRICULUM_DOORS[0];
  const activeLesson = activeDoor.lessons.find(l => l.id === activeLessonId) || activeDoor.lessons[0];

  // Navigate to specific door
  const handleSelectDoor = (doorId: string) => {
    const door = CURRICULUM_DOORS.find(d => d.id === doorId);
    if (!door) return;
    setActiveDoorId(doorId);

    const firstUncompleted = door.lessons.find(l => !progress.completedLessonIds.includes(l.id));
    setActiveLessonId(firstUncompleted ? firstUncompleted.id : door.lessons[0].id);
    setViewMode('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to specific lesson
  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setViewMode('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Combined selector for drawer navigation (from 3-dots menu)
  const handleSelectDoorAndLesson = (doorId: string, lessonId: string) => {
    setActiveDoorId(doorId);
    setActiveLessonId(lessonId);
    setIsCurriculumDrawerOpen(false);
    setViewMode('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pass a lesson quiz and handle sequential gating
  const handlePassLesson = (lessonId: string, score: number, total: number) => {
    setProgress(prev => {
      const nextCompleted = prev.completedLessonIds.includes(lessonId)
        ? prev.completedLessonIds
        : [...prev.completedLessonIds, lessonId];

      const nextScores = {
        ...prev.lessonQuizScores,
        [lessonId]: { score, total, passed: true, completedAt: new Date().toISOString() },
      };

      // Check if current door is completely finished
      let nextUnlockedDoors = [...prev.unlockedDoorIds];
      const allLessonsInDoor = activeDoor.lessons.map(l => l.id);
      const isDoorFullyCompleted = allLessonsInDoor.every(id => nextCompleted.includes(id));

      if (isDoorFullyCompleted) {
        // Unlock next door in sequence if available
        const currentDoorIndex = CURRICULUM_DOORS.findIndex(d => d.id === activeDoor.id);
        if (currentDoorIndex < CURRICULUM_DOORS.length - 1) {
          const nextDoor = CURRICULUM_DOORS[currentDoorIndex + 1];
          if (!nextUnlockedDoors.includes(nextDoor.id)) {
            nextUnlockedDoors.push(nextDoor.id);
            setCompletionBanner(`هنيئاً لك! أتممت إتقان ${activeDoor.title} بالكامل، وتم فتح ${nextDoor.title} لمواصلة التحصيل.`);
          }
        } else {
          setCompletionBanner(`ما شاء الله تبارك الله! لقد أتممت جميع أبواب المنهاج الشرعي وتأهلت لشهادة الإتقان الكبرى!`);
        }
      }

      return {
        ...prev,
        completedLessonIds: nextCompleted,
        lessonQuizScores: nextScores,
        unlockedDoorIds: nextUnlockedDoors,
      };
    });

    // Automatically transition to next lesson if in same door
    const currentLessonIndex = activeDoor.lessons.findIndex(l => l.id === lessonId);
    if (currentLessonIndex < activeDoor.lessons.length - 1) {
      const nextLesson = activeDoor.lessons[currentLessonIndex + 1];
      setActiveLessonId(nextLesson.id);
    }
  };

  // Bookmarking
  const handleToggleBookmark = (lessonId: string) => {
    setProgress(prev => {
      const isBookmarked = prev.bookmarkedLessons.includes(lessonId);
      return {
        ...prev,
        bookmarkedLessons: isBookmarked
          ? prev.bookmarkedLessons.filter(id => id !== lessonId)
          : [...prev.bookmarkedLessons, lessonId],
      };
    });
  };

  // Open Scholar directly
  const handleOpenScholarWithPrompt = (prompt?: string, openHistory = false) => {
    setIsQuizOpen(false);
    setIsDashboardOpen(false);
    setIsCertificateOpen(false);
    setIsCurriculumDrawerOpen(false);
    setScholarInitialPrompt(prompt);
    setScholarInitialHistoryOpen(openHistory);
    setViewMode('scholar');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Open Certificate for specific door
  const handleOpenCertificate = (doorId: string) => {
    setCertificateDoorId(doorId);
    setIsCertificateOpen(true);
  };

  // Reset Progress
  const handleResetProgress = () => {
    setProgress(INITIAL_PROGRESS);
    setActiveDoorId('door-aqeedah');
    setActiveLessonId('aqeedah-1');
    setIsDashboardOpen(false);
  };

  const certificateDoor = CURRICULUM_DOORS.find(d => d.id === certificateDoorId) || activeDoor;

  // Previous & Next Lesson navigation helpers
  const currentLessonIndex = activeDoor.lessons.findIndex(l => l.id === activeLesson.id);
  const prevLesson = currentLessonIndex > 0 ? activeDoor.lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < activeDoor.lessons.length - 1 ? activeDoor.lessons[currentLessonIndex + 1] : null;
  const isNextLessonUnlocked = true; // Freely navigate between lessons for reading

  // 0. AUTH GATE: Require registration / login before accessing the app
  if (!currentUser) {
    return <AuthScreen onAuthenticated={(user) => setCurrentUser(user)} />;
  }

  // 1. FULL PAGE VIEW: AI SCHOLAR MENTOR
  if (viewMode === 'scholar') {
    return (
      <AiScholarDrawer
        isOpen={true}
        onClose={() => {
          setViewMode('bold-inquiries');
          setScholarInitialPrompt(undefined);
          setScholarInitialHistoryOpen(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        currentLesson={activeLesson}
        doorTitle={activeDoor.title}
        initialPrompt={scholarInitialPrompt}
        startWithHistoryOpen={scholarInitialHistoryOpen}
      />
    );
  }

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-stone-50 text-stone-900 font-cairo selection:bg-amber-500/20 selection:text-amber-950"
    >
      
      {/* Global Clean Header featuring the 3-Dots / Menu button */}
      <Header
        progress={progress}
        activeDoorId={activeDoorId}
        onSelectDoor={handleSelectDoor}
        onOpenScholar={(prompt, openHistory) => handleOpenScholarWithPrompt(prompt, openHistory)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenCurriculumDrawer={() => setIsCurriculumDrawerOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLogout={() => {
          endSession();
          setCurrentUser(null);
        }}
      />

      {/* Floating Side Pull Tab for Fast Drawer Access & Gesture Hint */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 z-30 hidden sm:block">
        <button
          onClick={() => setIsCurriculumDrawerOpen(true)}
          className="flex items-center gap-1.5 py-3 px-2 rounded-r-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-lg shadow-amber-900/10 border-y border-r border-amber-500 transition-all hover:pl-3 cursor-pointer group"
          title="انقر أو اسحب لليسار لفتح قائمة أبواب الفقه والقراءة"
        >
          <div className="flex flex-col items-center gap-1">
            <MoreVertical className="w-4 h-4" />
            <span className="[writing-mode:vertical-rl] tracking-wider text-[11px] font-cairo font-bold">
              أبواب الفقه ☰
            </span>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1550px] mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Completion Banner if any */}
        {completionBanner && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-2 border-emerald-500/70 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="font-cairo font-bold text-sm sm:text-base text-emerald-950 leading-relaxed">
                {completionBanner}
              </p>
            </div>
            <button
              onClick={() => setCompletionBanner(null)}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              متابعة التحصيل
            </button>
          </div>
        )}

        {/* 1. PRIMARY HOMEPAGE VIEW: BOLD INQUIRIES 600 ONLY */}
        {viewMode === 'bold-inquiries' && (
          <BoldInquiriesHomeView
            onConsultScholar={(prompt) => handleOpenScholarWithPrompt(prompt)}
            onOpenCurriculumDrawer={() => setIsCurriculumDrawerOpen(true)}
          />
        )}

        {/* 2. DEDICATED LESSON STUDY VIEW (Triggered from the 3-Dots Menu) */}
        {viewMode === 'lesson' && (
          <div className="space-y-6">
            
            {/* Top Navigation Bar: Return to Bold Inquiries 600 Hub */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <button
                onClick={() => {
                  setViewMode('bold-inquiries');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-white" />
                <span>العودة إلى الواجهة الرئيسية (المباحث الجريئة ٦٠٠)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCurriculumDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4 text-amber-700" />
                  <span>فهرس الأبواب والدروس ☰</span>
                </button>

                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4 text-stone-500" />
                  <span>بحث</span>
                </button>
              </div>
            </div>

            {/* Breadcrumbs for Lesson Context */}
            <Breadcrumbs
              activeDoor={activeDoor}
              activeLesson={activeLesson}
              progress={progress}
              onSelectDoor={handleSelectDoor}
              onSelectLesson={handleSelectLesson}
              onPrevLesson={prevLesson ? () => handleSelectLesson(prevLesson.id) : undefined}
              onNextLesson={nextLesson ? () => isNextLessonUnlocked && handleSelectLesson(nextLesson.id) : undefined}
              hasPrevLesson={!!prevLesson}
              hasNextLesson={!!nextLesson}
              isNextLessonUnlocked={isNextLessonUnlocked}
            />

            {/* Door Navigator */}
            <DoorNavigator
              door={activeDoor}
              activeLessonId={activeLesson.id}
              progress={progress}
              onSelectLesson={handleSelectLesson}
              onRequestCertificate={handleOpenCertificate}
            />

            {/* Lesson Viewer */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLesson.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <LessonViewer
                  lesson={activeLesson}
                  doorTitle={activeDoor.title}
                  progress={progress}
                  onOpenQuiz={() => setIsQuizOpen(true)}
                  onToggleBookmark={handleToggleBookmark}
                />
              </motion.div>
            </AnimatePresence>

            {/* Next / Prev Pagination Bar */}
            <div className="flex items-center justify-between gap-4 py-4 px-2 text-xs sm:text-sm">
              {prevLesson ? (
                <button
                  onClick={() => handleSelectLesson(prevLesson.id)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 transition-all shadow-2xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-amber-700" />
                  <span>الدرس السابق: {prevLesson.title}</span>
                </button>
              ) : (
                <div />
              )}

              {nextLesson && (
                <button
                  onClick={() => isNextLessonUnlocked && handleSelectLesson(nextLesson.id)}
                  disabled={!isNextLessonUnlocked}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all shadow-xs ${
                    isNextLessonUnlocked
                      ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold border-amber-600 cursor-pointer'
                      : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>الدرس التالي: {nextLesson.title}</span>
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            {/* Bottom Return to Home Bar */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setViewMode('bold-inquiries');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-stone-700" />
                <span>العودة إلى منبر المباحث الجريئة ٦٠٠</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Modals & Drawers */}
      
      {/* 1. Slide-out Curriculum Hierarchy Drawer (Triggered by 3-Dots / Menu / Swipe) */}
      <CurriculumSidebarDrawer
        isOpen={isCurriculumDrawerOpen}
        onClose={() => setIsCurriculumDrawerOpen(false)}
        activeDoorId={activeDoorId}
        activeLessonId={activeLessonId}
        progress={progress}
        onSelectDoorAndLesson={handleSelectDoorAndLesson}
        onOpenScholar={(prompt) => handleOpenScholarWithPrompt(prompt)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenBoldInquiries={() => {
          setIsCurriculumDrawerOpen(false);
          setViewMode('bold-inquiries');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Flashcards View */}
      {isFlashcardsOpen && (
        <FlashcardsView
          isOpen={isFlashcardsOpen}
          onClose={() => setIsFlashcardsOpen(false)}
          savedCardIds={progress.savedFlashcards}
          onToggleSaveCard={(cardId) => {
            setProgress(prev => ({
              ...prev,
              savedFlashcards: prev.savedFlashcards.includes(cardId)
                ? prev.savedFlashcards.filter(id => id !== cardId)
                : [...prev.savedFlashcards, cardId]
            }));
          }}
        />
      )}

      {/* 3. Global Search Modal */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectLesson={(doorId, lessonId) => handleSelectDoorAndLesson(doorId, lessonId)}
        />
      )}

      {/* 4. Gated Quiz Modal */}
      {isQuizOpen && (
        <QuizModal
          lesson={activeLesson}
          doorTitle={activeDoor.title}
          onClose={() => setIsQuizOpen(false)}
          onPassLesson={handlePassLesson}
        />
      )}

      {/* 5. Progress & Mastery Dashboard */}
      <ProgressDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        progress={progress}
        onOpenCertificate={handleOpenCertificate}
        onResetProgress={handleResetProgress}
      />

      {/* 6. Certificate of Mastery Modal */}
      {isCertificateOpen && (
        <CertificateModal
          door={certificateDoor}
          progress={progress}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}

    </div>
  );
}
