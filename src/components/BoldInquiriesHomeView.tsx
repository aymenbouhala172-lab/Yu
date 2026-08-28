import React, { useState, useMemo, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  Search, 
  BookMarked, 
  Share2, 
  Brain, 
  ShieldAlert, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Quote, 
  Layers, 
  HelpCircle, 
  Lightbulb, 
  ZoomIn, 
  ZoomOut,
  Send,
  MoreVertical,
  Check,
  Compass,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { BoldDilemma } from '../types';
import { BOLD_DILEMMAS } from '../data/boldDilemmasData';

interface BoldInquiriesHomeViewProps {
  onConsultScholar: (prompt: string) => void;
  onOpenCurriculumDrawer: () => void;
}

export const BoldInquiriesHomeView: React.FC<BoldInquiriesHomeViewProps> = ({
  onConsultScholar,
  onOpenCurriculumDrawer,
}) => {
  const [selectedId, setSelectedId] = useState<string>(BOLD_DILEMMAS[0]?.id || 'dilemma-1');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeViewTab, setActiveViewTab] = useState<'reader' | 'grid'>('reader');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Chapters Definition for the 600 Inquiries
  const chapters = [
    { id: 'all', label: 'كافة المسائل (٦٠٠)', count: BOLD_DILEMMAS.length, icon: '🔥' },
    { id: 'aqeedah-philosophy', range: '١-١٠٠', label: 'العقيدة والفلسفة', count: 100, icon: '🛡️' },
    { id: 'tech-modernity', range: '١٠١-٢٠٠', label: 'الذكاء الاصطناعي والتقنية', count: 100, icon: '🤖' },
    { id: 'bioethics-medicine', range: '٢٠١-٣٠٠', label: 'الطب والجينات والبيولوجيا', count: 100, icon: '🧬' },
    { id: 'economy-finance', range: '٣٠١-٤٠٠', label: 'المال والعملات المشفرة', count: 100, icon: '🪙' },
    { id: 'ethics-society', range: '٤٠١-٥٠٠', label: 'المجتمع والحريات والقانون', count: 100, icon: '⚖️' },
    { id: 'psychology-fiqh-life', range: '٥٠١-٦٠٠', label: 'النفس والواقع المعاصر', count: 100, icon: '🌱' },
  ];

  // Filtered dilemmas based on category and search query
  const filteredDilemmas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return BOLD_DILEMMAS.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      const matchesSearch = 
        item.title.toLowerCase().includes(query) ||
        item.boldQuestion.toLowerCase().includes(query) ||
        item.theDilemma.toLowerCase().includes(query) ||
        item.rationalDeconstruction.some(r => r.toLowerCase().includes(query)) ||
        item.decisiveRule.toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Current active dilemma
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
    <div className="w-full space-y-6">
      
      {/* Hero Intro Header for Bold Inquiries 600 */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-4xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-950 border border-orange-200 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              مِنبَرُ المَبَاحِثِ الجَرِيئَةِ والنَّوَازِلِ الكُبْرَى (٦٠٠ مَسْأَلَة)
            </span>
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              • موسوعة التفكيك الفكري والنوازل الشائكة المؤصلة بالبرهان
            </span>
          </div>

          <h2 className="font-amiri font-bold text-2xl sm:text-3xl lg:text-4xl text-stone-900 leading-snug">
            طرح فكري وعقدي جريء يفند الشبهات ويستكشف معضلات العصر
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-3xl">
            من معضلة الشر، والذكاء الاصطناعي وماهية الوعي، إلى نقد الداروينية والعملات المشفرة والهندسة الوراثية (CRISPR). تفكيك رصين يجمع بين البرهان العقلي الصريح والنقل القرآني والنبوي المحكم.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenCurriculumDrawer}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <MoreVertical className="w-4 h-4 text-amber-700" />
              <span>أبواب الفقه والعقيدة والقراءة (في القائمة ☰)</span>
            </button>

            <button
              onClick={() => onConsultScholar(`أريد مدارسة المسألة الفكرية: ${activeDilemma.title} (${activeDilemma.boldQuestion})`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Brain className="w-4 h-4 text-white" />
              <span>مناظرة العالم الذكي حول المسألة الحالية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Filter & Navigation Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-4">
        
        {/* Search and View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الـ 600 مسألة: معضلة الشر، الذكاء الاصطناعي، التطور، البتكوين، الجينات..."
              className="w-full pr-10 pl-8 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Tab Switcher & Font Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setActiveViewTab('reader')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeViewTab === 'reader'
                    ? 'bg-white text-amber-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                📖 وضع القراءة الموسعة
              </button>
              <button
                onClick={() => setActiveViewTab('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeViewTab === 'grid'
                    ? 'bg-white text-amber-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🗂️ فهرس البطاقات ({filteredDilemmas.length})
              </button>
            </div>

            {/* Font Sizer (In Reader Mode) */}
            {activeViewTab === 'reader' && (
              <div className="hidden sm:flex items-center bg-stone-100 rounded-xl border border-stone-200 p-0.5">
                <button
                  onClick={() => setFontSizeLevel(prev => prev === 'xlarge' ? 'large' : 'normal')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${fontSizeLevel === 'normal' ? 'text-amber-800 font-bold bg-white shadow-2xs' : 'text-stone-500 hover:text-stone-900'}`}
                  title="تصغير الخط"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFontSizeLevel(prev => prev === 'normal' ? 'large' : 'xlarge')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${fontSizeLevel !== 'normal' ? 'text-amber-800 font-bold bg-white shadow-2xs' : 'text-stone-500 hover:text-stone-900'}`}
                  title="تكبير الخط"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 6 Chapters Horizontal Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          {chapters.map(ch => {
            const isSelected = activeCategory === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveCategory(ch.id);
                  // Set selected to first dilemma in this chapter if outside
                  if (ch.id !== 'all') {
                    const firstInCh = BOLD_DILEMMAS.find(d => d.category === ch.id);
                    if (firstInCh) setSelectedId(firstInCh.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span>{ch.icon}</span>
                <span>{ch.label}</span>
                {ch.range && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-amber-700 text-amber-100' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {ch.range}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN VIEW MODE: 1. EXPANSIVE READER (DEFAULT) */}
      {activeViewTab === 'reader' && activeDilemma && (
        <div className="space-y-6">
          
          {/* Dilemma Header & Pagination Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs flex items-center justify-between gap-3">
            <button
              onClick={() => prevDilemma && setSelectedId(prevDilemma.id)}
              disabled={!prevDilemma}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                prevDilemma
                  ? 'bg-stone-50 hover:bg-amber-50 text-stone-800 border-stone-300 hover:border-amber-400 shadow-2xs'
                  : 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronRight className="w-4 h-4 text-amber-700" />
              <span>المسألة السابقة</span>
            </button>

            {/* Current Dilemma Title & Meta */}
            <div className="text-center px-2 min-w-0">
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  المسألة {currentIndex + 1} من {BOLD_DILEMMAS.length}
                </span>
                <span className="text-xs text-stone-500 font-semibold hidden sm:inline">
                  • {activeDilemma.categoryLabel}
                </span>
              </div>
              <h3 className="font-amiri font-bold text-base sm:text-xl text-stone-900 truncate mt-1">
                {activeDilemma.title}
              </h3>
            </div>

            <button
              onClick={() => nextDilemma && setSelectedId(nextDilemma.id)}
              disabled={!nextDilemma}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                nextDilemma
                  ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
              }`}
            >
              <span>المسألة التالية</span>
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Deep Reading Container */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* Top Question Highlight Box */}
            <div className="rounded-2xl bg-amber-50/80 border border-amber-300/80 p-5 sm:p-6 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  السؤال الفلسفي / الإشكال الجريء:
                </span>
                <button
                  onClick={() => handleCopySummary(activeDilemma)}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                  title="نسخ ملخص المسألة"
                >
                  {copiedId === activeDilemma.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>مشاركة المسألة</span>
                    </>
                  )}
                </button>
              </div>

              <p className={`font-amiri font-bold text-stone-950 ${fontClasses.heading} leading-relaxed`}>
                « {activeDilemma.boldQuestion} »
              </p>
            </div>

            {/* Section 1: The Core Dilemma (الإشكال وحقيقة النزاع) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-stone-900 border-b border-stone-200 pb-2">
                <ShieldAlert className="w-5 h-5 text-orange-700" />
                <h4 className="font-amiri font-bold text-lg sm:text-xl text-stone-900">
                  ١. تصوير الإشكال وتحرير محل النزاع
                </h4>
              </div>
              <p className={`text-stone-700 ${fontClasses.body} font-sans leading-relaxed`}>
                {activeDilemma.theDilemma}
              </p>
            </div>

            {/* Section 2: Rational & Intellectual Breakdown (البرهان العقلي والفلسفي) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-stone-900 border-b border-stone-200 pb-2">
                <Brain className="w-5 h-5 text-indigo-700" />
                <h4 className="font-amiri font-bold text-lg sm:text-xl text-stone-900">
                  ٢. التفكيك العقلي والمحاكمة البرهانية
                </h4>
              </div>
              <div className="bg-indigo-50/40 rounded-2xl p-5 border border-indigo-100 space-y-2.5">
                {activeDilemma.rationalDeconstruction.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className={`text-stone-800 ${fontClasses.body} font-sans leading-relaxed`}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Scriptural Grounding & Evidence (النقل المحكم والآيات والأحاديث) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-stone-900 border-b border-stone-200 pb-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h4 className="font-amiri font-bold text-lg sm:text-xl text-stone-900">
                  ٣. الشاهد القرآني والنبوي وتأصيل الوحي
                </h4>
              </div>
              
              <div className="space-y-3">
                {activeDilemma.scripturalFoundations.map((scr, idx) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-900 font-bold font-mono">
                      <span>{scr.source}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        دليل محكم
                      </span>
                    </div>
                    <p className={`font-amiri font-bold text-emerald-950 ${fontClasses.quran} leading-relaxed`}>
                      « {scr.text} »
                    </p>
                    <p className="text-xs sm:text-sm text-stone-700 font-sans pt-1">
                      <span className="font-bold text-emerald-800">وجه الدلالة: </span>
                      {scr.pointOfEvidence}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Decisive Rule & Practical Takeaway (الضابط الحاسم والأثر العملي) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-200">
              {/* Decisive Rule */}
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                  القاعدة المحكمة والضابط الحاسم:
                </span>
                <p className="font-amiri font-bold text-base sm:text-lg text-amber-950 leading-relaxed">
                  « {activeDilemma.decisiveRule} »
                </p>
              </div>

              {/* Practical Takeaway */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-300 space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-stone-900 uppercase flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  الثمرة المعرفية والعملية:
                </span>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                  {activeDilemma.practicalTakeaway}
                </p>
              </div>
            </div>

            {/* Interactive AI Scholar Consultation Footer */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="space-y-1 text-center sm:text-right">
                <h5 className="font-amiri font-bold text-lg sm:text-xl">
                  هل ترغب في محاورة العالم الذكي حول هذه المسألة؟
                </h5>
                <p className="text-xs text-amber-100">
                  اطرح اعتراضاتك، استفسر عن تفريعات معاصرة، أو اطلب مناظرة فكرية تفكك الشبهة بعمق.
                </p>
              </div>

              <button
                onClick={() => onConsultScholar(`أود التوسع والمناظرة في مسألة: ${activeDilemma.title} - السؤال: ${activeDilemma.boldQuestion}`)}
                className="px-6 py-3 rounded-xl bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>بدء الحوار والتأصيل</span>
              </button>
            </div>

          </div>

          {/* Bottom Navigator */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => prevDilemma && setSelectedId(prevDilemma.id)}
              disabled={!prevDilemma}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                prevDilemma
                  ? 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300 shadow-2xs'
                  : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronRight className="w-4 h-4 text-amber-700" />
              <span>المسألة السابقة</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-stone-500 hover:text-amber-800 font-semibold cursor-pointer"
            >
              ↑ الرجوع لأعلى الصفحة
            </button>

            <button
              onClick={() => nextDilemma && setSelectedId(nextDilemma.id)}
              disabled={!nextDilemma}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                nextDilemma
                  ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50'
              }`}
            >
              <span>المسألة التالية</span>
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>
      )}

      {/* VIEW MODE: 2. INTERACTIVE GRID CATALOG */}
      {activeViewTab === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>عرض {filteredDilemmas.length} مسألة</span>
            <span>انقر على أي بطاقة للانتقال الفوري لقراءتها</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDilemmas.map((item, idx) => {
              const isCurrent = activeDilemma.id === item.id;
              const globalIdx = BOLD_DILEMMAS.findIndex(d => d.id === item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setActiveViewTab('reader');
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 group cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-2 ring-amber-300/40'
                      : 'bg-white hover:bg-amber-50/30 border-stone-200 hover:border-amber-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                        مسألة {globalIdx + 1}
                      </span>
                      <span className="text-stone-500 font-medium">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <h4 className="font-amiri font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-stone-600 line-clamp-2 font-sans leading-relaxed">
                      {item.boldQuestion}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-amber-800 font-bold">
                      قراءة التحليل والبرهان ←
                    </span>
                    <span className="text-stone-400 group-hover:text-amber-700 transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDilemmas.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
              <Compass className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="font-bold text-stone-700 text-sm">
                لم يتم العثور على مسائل تطابق «{searchQuery}»
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
              >
                مسح شروط البحث وعرض كافة الـ ٦٠٠ مسألة
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
