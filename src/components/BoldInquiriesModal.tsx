import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  HelpCircle, 
  ShieldAlert, 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Quote, 
  Send, 
  Share2, 
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Search,
  ZoomIn,
  ZoomOut,
  Layers,
  BookMarked,
  RotateCcw,
  Check
} from 'lucide-react';
import { BoldDilemma } from '../types';
import { BOLD_DILEMMAS } from '../data/boldDilemmasData';

interface BoldInquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsultScholar: (prompt: string) => void;
  initialDilemmaId?: string;
}

export const BoldInquiriesModal: React.FC<BoldInquiriesModalProps> = ({
  isOpen,
  onClose,
  onConsultScholar,
  initialDilemmaId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialDilemmaId || BOLD_DILEMMAS[0].id);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Reader customization states
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [activeSectionFilter, setActiveSectionFilter] = useState<'all' | 'dilemma' | 'rational' | 'scripture' | 'rule'>('all');
  const [isIndexDropdownOpen, setIsIndexDropdownOpen] = useState<boolean>(false);

  // Sync initialDilemmaId if changed
  useEffect(() => {
    if (initialDilemmaId) {
      setSelectedId(initialDilemmaId);
    }
  }, [initialDilemmaId]);

  // Keyboard navigation for comfortable reading
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isIndexDropdownOpen) {
          setIsIndexDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isIndexDropdownOpen]);

  if (!isOpen) return null;

  const filteredDilemmas = BOLD_DILEMMAS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.boldQuestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.theDilemma.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentIndex = BOLD_DILEMMAS.findIndex(d => d.id === selectedId);
  const activeDilemma = BOLD_DILEMMAS[currentIndex] || BOLD_DILEMMAS[0];

  const prevDilemma = currentIndex > 0 ? BOLD_DILEMMAS[currentIndex - 1] : null;
  const nextDilemma = currentIndex < BOLD_DILEMMAS.length - 1 ? BOLD_DILEMMAS[currentIndex + 1] : null;

  const handleCopySummary = (dilemma: BoldDilemma) => {
    const text = `
📜 *مسألة فكرية وتأصيل شرعي محكم:*
📌 *${dilemma.title}*
❓ السؤال الجريء: ${dilemma.boldQuestion}
⚖️ الضابط الحاسم: ${dilemma.decisiveRule}
💡 الأثر المعرفي: ${dilemma.practicalTakeaway}
من منصة «مِنهَاجُ المُتَفَقِّه»
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedId(dilemma.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getFontSizeClasses = () => {
    switch (fontSizeLevel) {
      case 'xlarge':
        return {
          body: 'text-lg sm:text-xl leading-loose',
          heading: 'text-2xl sm:text-3xl',
          quran: 'text-2xl sm:text-3xl leading-loose',
        };
      case 'large':
        return {
          body: 'text-base sm:text-lg leading-relaxed',
          heading: 'text-xl sm:text-2xl',
          quran: 'text-xl sm:text-2xl leading-loose',
        };
      default:
        return {
          body: 'text-sm sm:text-base leading-relaxed',
          heading: 'text-lg sm:text-xl',
          quran: 'text-lg sm:text-xl leading-relaxed',
        };
    }
  };

  const fontClasses = getFontSizeClasses();

  return (
    <div 
      id="bold-inquiries-page"
      className="min-h-screen h-screen w-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden select-text"
    >
      {/* TOP HEADER: Clean Pure White Bar with Navigation & Tools */}
      <header className="relative px-4 sm:px-8 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 shadow-sm z-30">
        
        {/* Left Side: Prominent Return Button + Applet Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white border border-amber-600 text-xs sm:text-sm font-bold transition-colors shadow-sm group cursor-pointer"
            title="الرجوع إلى القائمة الرئيسية للمنهاج"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:-translate-x-0.5 transition-transform" />
            <span>الرجوع للقائمة الرئيسية</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 text-white shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-amiri font-bold text-base sm:text-xl bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-800 bg-clip-text text-transparent">
                  مِنبَرُ المَبَاحِثِ الجَرِيئَةِ والنَّوَازِلِ الكُبْرَى
                </h2>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  صفحة قراءة موسعة
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Index Picker, Font Sizer, and Exit */}
        <div className="flex items-center gap-2">
          
          {/* Index Selector Popup Trigger */}
          <button
            onClick={() => setIsIndexDropdownOpen(!isIndexDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              isIndexDropdownOpen
                ? 'bg-amber-600 text-white border-amber-600 shadow-amber-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50'
            }`}
            title="فتح قائمة كل المسائل العشر للاختيار المباشر"
          >
            <BookMarked className="w-4 h-4 text-amber-600" />
            <span>فهرس المسائل ({BOLD_DILEMMAS.length})</span>
          </button>

          {/* Font Sizer */}
          <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5">
            <button
              onClick={() => setFontSizeLevel(prev => prev === 'xlarge' ? 'large' : 'normal')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${fontSizeLevel === 'normal' ? 'text-amber-800 font-bold bg-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="تصغير حجم الخط"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-bold text-slate-700 select-none hidden sm:inline">
              {fontSizeLevel === 'normal' ? 'خط عادي' : fontSizeLevel === 'large' ? 'خط مريح' : 'خط واسع'}
            </span>
            <button
              onClick={() => setFontSizeLevel(prev => prev === 'normal' ? 'large' : 'xlarge')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${fontSizeLevel !== 'normal' ? 'text-amber-800 font-bold bg-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="تكبير حجم الخط لراحة القراءة"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Exit */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all hover:rotate-90 shadow-sm"
            title="إغلاق وقفل المنبر"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* HORIZONTAL QUICK SELECTOR STRIP (Full Width - No split screen!) */}
      <div className="px-4 sm:px-8 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0 z-20 shadow-xs">
        
        {/* Previous Button */}
        <button
          onClick={() => prevDilemma && setSelectedId(prevDilemma.id)}
          disabled={!prevDilemma}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
            prevDilemma
              ? 'bg-slate-100 hover:bg-amber-100 text-slate-800 border-slate-300 hover:border-amber-400 shadow-xs'
              : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-40'
          }`}
        >
          <ChevronRight className="w-4 h-4 text-amber-600" />
          <span className="hidden sm:inline">السابقة</span>
        </button>

        {/* Quick Chapter Selector & Neighbor Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar max-w-4xl mx-auto px-2">
          {/* Chapter Quick Jump */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { label: '١-١٠٠', startId: 'dilemma-1', name: 'العقيدة' },
              { label: '١٠١-٢٠٠', startId: 'dilemma-101', name: 'التقنية' },
              { label: '٢٠١-٣٠٠', startId: 'dilemma-201', name: 'الطب' },
              { label: '٣٠١-٤٠٠', startId: 'dilemma-301', name: 'المال' },
              { label: '٤٠١-٥٠٠', startId: 'dilemma-401', name: 'المجتمع' },
              { label: '٥٠١-٦٠٠', startId: 'dilemma-501', name: 'التزكية' },
            ].map(ch => {
              const isCurrentChapter = (() => {
                const idx = parseInt(activeDilemma.id.replace('dilemma-', ''), 10) || 1;
                if (ch.startId === 'dilemma-1') return idx >= 1 && idx <= 100;
                if (ch.startId === 'dilemma-101') return idx >= 101 && idx <= 200;
                if (ch.startId === 'dilemma-201') return idx >= 201 && idx <= 300;
                if (ch.startId === 'dilemma-301') return idx >= 301 && idx <= 400;
                if (ch.startId === 'dilemma-401') return idx >= 401 && idx <= 500;
                if (ch.startId === 'dilemma-501') return idx >= 501 && idx <= 600;
                return false;
              })();
              return (
                <button
                  key={ch.startId}
                  onClick={() => {
                    setSelectedId(ch.startId);
                    setActiveSectionFilter('all');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                    isCurrentChapter
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title={`${ch.name} (${ch.label})`}
                >
                  {ch.name}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Active Neighborhood Pills (± 3 items) */}
          {(() => {
            const start = Math.max(0, currentIndex - 3);
            const end = Math.min(BOLD_DILEMMAS.length, currentIndex + 4);
            const slice = BOLD_DILEMMAS.slice(start, end);
            return slice.map((item) => {
              const isSelected = item.id === selectedId;
              const itemNum = parseInt(item.id.replace('dilemma-', ''), 10) || 1;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setActiveSectionFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 shadow-md shadow-amber-600/25 scale-102'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {itemNum}
                  </span>
                  <span className="max-w-[110px] sm:max-w-[150px] truncate">{item.title}</span>
                </button>
              );
            });
          })()}
        </div>

        {/* Next Button */}
        <button
          onClick={() => nextDilemma && setSelectedId(nextDilemma.id)}
          disabled={!nextDilemma}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
            nextDilemma
              ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-sm shadow-amber-600/20'
              : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-40'
          }`}
        >
          <span className="hidden sm:inline">التالية</span>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* DROPDOWN / MODAL POPUP FOR FULL INDEX (Does not take half screen!) */}
      {isIndexDropdownOpen && (
        <div className="absolute top-[108px] right-4 sm:right-8 z-40 w-96 max-w-[90vw] max-h-[75vh] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-sm text-slate-900">فهرس المباحث الـ 600</span>
            </div>
            <button 
              onClick={() => setIsIndexDropdownOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Direct Number Jump */}
          <div className="p-3 border-b border-slate-200 bg-white space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في 600 مسألة وشبهة..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Category Pills inside Drawer */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                { id: 'all', label: 'الكل (600)' },
                { id: 'aqeedah', label: 'العقيدة (100)' },
                { id: 'philosophy', label: 'الفلسفة' },
                { id: 'modernity', label: 'التقنية (100)' },
                { id: 'fiqh', label: 'الطب والمال (200)' },
                { id: 'ethics', label: 'المجتمع والأسرة (100)' },
                { id: 'psychology', label: 'علم النفس (100)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                    activeCategory === tab.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredDilemmas.map((dilemma) => {
              const itemNum = parseInt(dilemma.id.replace('dilemma-', ''), 10) || 1;
              return (
                <button
                  key={dilemma.id}
                  onClick={() => {
                    setSelectedId(dilemma.id);
                    setIsIndexDropdownOpen(false);
                    setActiveSectionFilter('all');
                  }}
                  className={`w-full text-right p-3 rounded-2xl transition-all flex flex-col gap-1 border ${
                    dilemma.id === selectedId
                      ? 'bg-amber-50 border-amber-400 shadow-sm text-amber-950 font-bold'
                      : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded font-bold">
                      مسألة {itemNum}
                    </span>
                    <span className="text-slate-500 font-medium text-[10px]">
                      {dilemma.categoryLabel}
                    </span>
                  </div>
                  <h4 className="font-amiri font-bold text-sm leading-snug">
                    {dilemma.title}
                  </h4>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN READING CANVAS (100% Full Width, Clean White, Spacious, Grand Luxury) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 space-y-8 bg-slate-50/80 scroll-smooth">
        
        {/* Max-Width Content Area with Generous Spacing for Reading Comfort */}
        <div className="mx-auto w-full max-w-5xl space-y-8 pb-16">
          
          {/* 1. HERO ARTICLE TITLE & QUESTION CARD (White Card + Soft Glow + Text Gradient) */}
          <article className="p-6 sm:p-10 rounded-3xl bg-white border border-amber-200/80 shadow-xl shadow-amber-900/5 relative space-y-6 overflow-hidden">
            
            {/* Ambient Soft Gold Glow */}
            <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-bl from-amber-100/60 via-amber-50/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header metadata row */}
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                  {activeDilemma.categoryLabel}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {activeDilemma.badgeText}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  المسألة {currentIndex + 1} من {BOLD_DILEMMAS.length}
                </span>
              </div>

              {/* Share / Copy Button */}
              <button
                onClick={() => handleCopySummary(activeDilemma)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 text-xs font-bold border border-slate-200 hover:border-amber-300 transition-all shadow-xs"
                title="نسخ ملخص التأصيل والضابط"
              >
                {copiedId === activeDilemma.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">تم نسخ التأصيل بنجاح</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-amber-700" />
                    <span>مشاركة التأصيل</span>
                  </>
                )}
              </button>
            </div>

            {/* Large Display Title with Soft Radiant Gradient */}
            <h1 className="font-amiri font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight bg-gradient-to-r from-slate-900 via-stone-800 to-amber-900 bg-clip-text text-transparent relative z-10">
              {activeDilemma.title}
            </h1>

            {/* The Central Bold Question Box (Highlighted with soft glow) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-50/90 via-yellow-50/50 to-amber-50/90 border border-amber-300/80 shadow-md shadow-amber-500/5 flex items-start gap-4 relative z-10">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/30 shrink-0 mt-1">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block font-tajawal">
                  السؤال الفكري والشبهة المطروحة:
                </span>
                <p className="font-amiri font-bold text-lg sm:text-2xl text-slate-900 leading-relaxed">
                  «{activeDilemma.boldQuestion}»
                </p>
              </div>
            </div>

            {/* Section Tabs Navigator for quick jumping */}
            <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-100 text-xs relative z-10">
              <button
                onClick={() => setActiveSectionFilter('all')}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeSectionFilter === 'all'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                عرض المبحث كاملاً
              </button>
              <button
                onClick={() => setActiveSectionFilter('dilemma')}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeSectionFilter === 'dilemma'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                ١. جوهر الإشكالية
              </button>
              <button
                onClick={() => setActiveSectionFilter('rational')}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeSectionFilter === 'rational'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                ٢. التفكيك العقلي ({activeDilemma.rationalDeconstruction.length})
              </button>
              <button
                onClick={() => setActiveSectionFilter('scripture')}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeSectionFilter === 'scripture'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                ٣. الأدلة الشرعية ({activeDilemma.scripturalFoundations.length})
              </button>
              <button
                onClick={() => setActiveSectionFilter('rule')}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeSectionFilter === 'rule'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                ٤. الضابط الحاسم
              </button>
            </div>

          </article>

          {/* 2. SECTION: THE DILEMMA CORE (تشريح الإشكالية وخلفيتها) */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'dilemma') && (
            <section className="p-6 sm:p-9 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-slate-900/5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-amber-800 font-bold text-base sm:text-lg font-amiri">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>١. تشريح الإشكالية وخلفيتها الفلسفية والتاريخية</span>
              </div>

              <div className={`text-slate-800 ${fontClasses.body} font-tajawal`}>
                <p className="p-5 sm:p-7 rounded-2xl bg-amber-50/40 border border-amber-200/60 leading-loose text-slate-800">
                  {activeDilemma.theDilemma}
                </p>
              </div>
            </section>
          )}

          {/* 3. SECTION: RATIONAL DECONSTRUCTION (التفكيك العقلي والمنطقي) */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'rational') && (
            <section className="p-6 sm:p-9 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-slate-900/5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-indigo-900 font-bold text-base sm:text-lg font-amiri">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <span>٢. ركائز التفكيك العقلي، المنطقي، والفلسفي</span>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold shadow-xs">
                  حجج وبراهين عقلية
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {activeDilemma.rationalDeconstruction.map((point, idx) => (
                  <div 
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/30 border border-slate-200 hover:border-indigo-300 transition-all flex items-start gap-4 shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 font-mono shadow-md shadow-indigo-600/20">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-slate-800 font-tajawal ${fontClasses.body}`}>
                        {point}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. SECTION: SCRIPTURAL FOUNDATIONS (الأدلة الشرعية المحكمة) */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'scripture') && (
            <section className="p-6 sm:p-9 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-slate-900/5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base sm:text-lg font-amiri">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>٣. الأدلة الشرعية المحكمة وصحيح المنقول</span>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold shadow-xs">
                  أصول الوحي المعصوم
                </span>
              </div>

              <div className="space-y-4">
                {activeDilemma.scripturalFoundations.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-emerald-50/40 to-white border border-emerald-200 space-y-4 shadow-sm"
                  >
                    {/* Quran / Hadith Text in dignified typography */}
                    <div className="text-center py-5 px-6 bg-white rounded-xl border border-emerald-200/90 shadow-sm">
                      <p className={`font-quran text-emerald-950 font-medium ${fontClasses.quran}`}>
                        {item.text}
                      </p>
                    </div>

                    {/* Source and Point of Evidence */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald-100 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <Quote className="w-4 h-4 text-emerald-600" />
                        <span>المصدر: {item.source}</span>
                      </div>
                      <div className="text-slate-700">
                        <strong className="text-amber-800 ml-1">وجه الدلالة والتأصيل:</strong>
                        <span>{item.pointOfEvidence || (item as any).evidence}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. SECTION: DECISIVE SCHOLARLY RULE (الضابط الكلي والخلاصة الذهبية) */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'rule') && (
            <section className="p-6 sm:p-9 rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/60 border-2 border-amber-400 shadow-xl shadow-amber-900/10 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-amber-950 font-bold text-base sm:text-lg font-amiri">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>٤. الضابط الكلي الحاسم والأثر المعرفي والعملي</span>
                </div>
                <span className="text-xs px-3.5 py-1 rounded-full bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30">
                  قاعدة محكمة
                </span>
              </div>

              {/* The Golden Rule Quote */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-amber-300 shadow-md">
                <p className="font-amiri font-bold text-lg sm:text-2xl text-amber-950 leading-relaxed text-center sm:text-right">
                  {activeDilemma.decisiveRule}
                </p>
              </div>

              {/* Practical Takeaway */}
              <div className="p-5 sm:p-6 rounded-xl bg-white/90 border border-amber-300/80 flex items-start gap-3.5 shadow-sm">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-tajawal">
                  <strong className="text-amber-900 font-bold block mb-1">الأثر المعرفي والعملي لتطبيق هذا الضابط:</strong>
                  <span>{activeDilemma.practicalTakeaway}</span>
                </div>
              </div>

              {/* Interactive AI Scholar Consultation Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-right flex-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>المُدارسة البرهانية والتوسع الأكاديمي المباشر:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 font-tajawal leading-relaxed">
                    «{activeDilemma.suggestedScholarPrompt}»
                  </p>
                </div>
                <button
                  onClick={() => {
                    onConsultScholar(activeDilemma.suggestedScholarPrompt);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>طرح المسألة على المعلم الذكي</span>
                </button>
              </div>
            </section>
          )}

          {/* 6. BOTTOM STEPPER (التنقل إلى المسألة التالية والسابقة) */}
          <footer className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
            {prevDilemma ? (
              <button
                onClick={() => {
                  setSelectedId(prevDilemma.id);
                  setActiveSectionFilter('all');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                <ArrowRight className="w-4 h-4 text-amber-600" />
                <span>السابق: {prevDilemma.title}</span>
              </button>
            ) : (
              <div />
            )}

            {nextDilemma ? (
              <button
                onClick={() => {
                  setSelectedId(nextDilemma.id);
                  setActiveSectionFilter('all');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-sm font-bold transition-all shadow-xl shadow-amber-600/30 hover:scale-105"
              >
                <span>التالي: {nextDilemma.title}</span>
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            ) : (
              <div />
            )}
          </footer>

        </div>

      </main>

    </div>
  );
};
