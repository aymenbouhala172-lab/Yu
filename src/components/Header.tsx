import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Flame, 
  GraduationCap,
  History,
  MoreVertical,
  Menu,
  Layers,
  Search
} from 'lucide-react';
import { UserProgress } from '../types';
import { CURRICULUM_DOORS } from '../data/curriculumData';

interface HeaderProps {
  progress: UserProgress;
  activeDoorId: string;
  onSelectDoor: (doorId: string) => void;
  onOpenScholar: (prompt?: string, openHistory?: boolean) => void;
  onOpenDashboard: () => void;
  onOpenBoldInquiries?: () => void;
  onOpenCurriculumDrawer?: () => void;
  onOpenFlashcards?: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  activeDoorId,
  onSelectDoor,
  onOpenScholar,
  onOpenDashboard,
  onOpenBoldInquiries,
  onOpenCurriculumDrawer,
  onOpenFlashcards,
  onOpenSearch,
}) => {
  const totalLessons = CURRICULUM_DOORS.reduce((acc, d) => acc + d.lessons.length, 0);
  const completedCount = progress.completedLessonIds.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-900 shadow-xs">
      {/* Top Attribution Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-b border-amber-200/80 py-1.5 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-700 hidden sm:inline" />
          <p className="text-xs sm:text-sm font-bold text-amber-900 tracking-wide font-cairo">
            تم إنشاؤه بواسطة أيمن بوحالة amen bouhala (بارك الله في جهوده)
          </p>
          <Sparkles className="w-3.5 h-3.5 text-amber-700 hidden sm:inline" />
        </div>
      </div>

      {/* Top Banner / Brand & Global Controls */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Right Side (in RTL): Brand & 3-Dots Menu Trigger Button */}
        <div className="flex items-center gap-3">
          
          {/* Prominent Three-Dots / Menu Button for Curriculum Doors */}
          {onOpenCurriculumDrawer && (
            <button
              onClick={onOpenCurriculumDrawer}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl bg-amber-100/80 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs sm:text-sm font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer group"
              title="انقر لفتح قائمة أبواب الفقه والعقيدة والقراءة (أو اسحب لليسار)"
            >
              <div className="flex items-center text-amber-800 group-hover:text-amber-950">
                <MoreVertical className="w-5 h-5 -ml-1" />
                <Menu className="w-4 h-4" />
              </div>
              <span className="font-cairo hidden sm:inline font-bold">أبواب الفقه والمنهاج</span>
              <span className="sm:hidden font-cairo text-xs">الأبواب ☰</span>
            </button>
          )}

          {/* Logo & Main Title */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-600/20 border border-amber-500">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-amiri font-bold text-lg sm:text-xl text-stone-900 tracking-wide">
                  مِنهَاجُ المُتَفَقِّه
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-orange-100 text-orange-950 border border-orange-200">
                  المباحث الجريئة ٦٠٠
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-sans hidden md:block">
                منبر المباحث الجريئة والنوازل الكبرى الـ 600 • تأصيل رصين بالبرهان العقلي والنقل المحكم
              </p>
            </div>
          </div>
        </div>

        {/* Left Side (in RTL): Action Buttons & AI Scholar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Search */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="البحث في المسائل والضوابط"
            >
              <Search className="w-4 h-4 text-stone-500" />
              <span className="hidden md:inline">بحث</span>
            </button>
          )}

          {/* Flashcards */}
          {onOpenFlashcards && (
            <button
              onClick={onOpenFlashcards}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer hidden sm:flex"
              title="بطاقات استحضار الضوابط الفقهية"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-700" />
              <span>البطاقات</span>
            </button>
          )}

          {/* Overall Progress pill */}
          <button
            onClick={onOpenDashboard}
            title="انقر لعرض لوحة الإنجاز والشهادات"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs transition-colors shadow-xs cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-emerald-800 font-mono">{progressPercent}%</span>
          </button>

          {/* AI Scholar Mentor Button */}
          <div className="flex items-center">
            <button
              onClick={() => onOpenScholar(undefined, false)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-r-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-sm border border-amber-600 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              title="حوار وتأصيل واستنباط فوري مع الشيخ الذكي"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="font-cairo">اسأل العالم الذكي</span>
            </button>
            {/* Direct History Access Button */}
            <button
              onClick={() => onOpenScholar(undefined, true)}
              className="flex items-center justify-center px-2.5 py-1.5 sm:py-2 rounded-l-xl bg-amber-800 hover:bg-amber-900 text-amber-100 border-y border-l border-amber-800 transition-all shadow-xs cursor-pointer"
              title="سجل المحادثات والمجالس السابقة"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
