import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  Compass, 
  Star, 
  ArrowLeft, 
  ChevronDown, 
  Quote, 
  Lightbulb, 
  Brain, 
  Share2, 
  Flame, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';
import { LessonContent, UserProgress } from '../types';
import { fetchNaturalScholarAudio } from '../utils/speechEngine';

interface LessonViewerProps {
  lesson: LessonContent;
  doorTitle: string;
  progress: UserProgress;
  onOpenQuiz: () => void;
  onToggleBookmark: (lessonId: string) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  doorTitle,
  progress,
  onOpenQuiz,
  onToggleBookmark,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [activeTab, setActiveTab] = useState<'all' | 'explanation' | 'evidences' | 'rules' | 'doubts' | 'applications'>('all');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const isCompleted = progress.completedLessonIds.includes(lesson.id);
  const isBookmarked = progress.bookmarkedLessons.includes(lesson.id);
  const quizScore = progress.lessonQuizScores[lesson.id];

  // Prepare focused, concise scholarly recitation text (~250-350 chars for rapid generation)
  const textToRead = `${lesson.title}. الضابط المركزي: ${lesson.centralRule}. الخلاصة: ${lesson.goldenSummary.slice(0, 2).join('. ')}`;

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Natural Human Sheikh Recitation for reading summary or lesson text
  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlayingAudio(false);
      return;
    }

    setAudioError(null);
    setIsLoadingAudio(true);

    try {
      const res = await fetchNaturalScholarAudio(textToRead, 'charon');
      setIsLoadingAudio(false);

      if (res.success && res.audioUrl) {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
          audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
          audioPlayerRef.current.onerror = () => {
            setIsPlayingAudio(false);
            setAudioError('تعذر تشغيل التسجيل الصوتي للشيخ.');
          };
        }
        audioPlayerRef.current.src = res.audioUrl;
        await audioPlayerRef.current.play().catch(() => setIsPlayingAudio(false));
        setIsPlayingAudio(true);
      } else {
        setAudioError(res.error || 'تعذر تشغيل تلاوة الشيخ، اضغط زر الاستماع لإعادة المحاولة.');
      }
    } catch {
      setIsLoadingAudio(false);
      setAudioError('حدث خطأ في الاتصال، يرجى إعادة المحاولة.');
    }
  };

  const getFontSizeClass = () => {
    switch (fontSizeLevel) {
      case 'large': return 'text-base sm:text-lg leading-relaxed';
      case 'xlarge': return 'text-lg sm:text-xl leading-loose';
      default: return 'text-sm sm:text-base leading-relaxed';
    }
  };

  return (
    <article className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-7 relative overflow-hidden">
      
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold border border-amber-200">
            {doorTitle}
          </span>
          <span>•</span>
          <span className="font-semibold text-stone-700">الدرس رقم {lesson.order}</span>
          <span>•</span>
          <span className="text-stone-500">{lesson.estimatedMinutes} دقيقة تحصيل</span>
        </div>

        <div className="flex items-center gap-2">
          
          {/* Font Size Adjuster */}
          <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 p-0.5">
            <button
              onClick={() => setFontSizeLevel(prev => prev === 'xlarge' ? 'large' : 'normal')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${fontSizeLevel === 'normal' ? 'text-amber-900 font-bold bg-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'}`}
              title="حجم خط قياسي"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFontSizeLevel(prev => prev === 'normal' ? 'large' : 'xlarge')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${fontSizeLevel !== 'normal' ? 'text-amber-900 font-bold bg-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'}`}
              title="تكبير الخط"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Audio Reader with natural human reciter */}
          <button
            onClick={handleToggleAudio}
            disabled={isLoadingAudio}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : isLoadingAudio
                ? 'bg-stone-50 text-stone-400 border-stone-200 cursor-wait'
                : 'bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-900 border-stone-200'
            }`}
            title={audioError || "استماع صوتي لخلاصة الدرس والضوابط بصوت الشيخ البشري"}
          >
            {isLoadingAudio ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span>جاري استدعاء صوت الشيخ...</span>
              </>
            ) : isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4 text-white" />
                <span>إيقاف القراءة</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-stone-500" />
                <span>قارئ المتن الصوتي (الشيخ)</span>
              </>
            )}
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={() => onToggleBookmark(lesson.id)}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-stone-200'
            }`}
            title={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-700" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Title & Central Rule Header */}
      <header className="space-y-4">
        <div>
          <h1 className="font-amiri font-bold text-2xl sm:text-3xl lg:text-4xl text-stone-900 leading-tight">
            {lesson.title}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 font-sans">
            {lesson.subtitle}
          </p>
        </div>

        {/* Central Rule Callout (الضابط الإجمالي) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border-r-4 border-amber-600 border-t border-b border-l border-amber-200 text-stone-900 shadow-2xs relative overflow-hidden">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-amber-700" />
            <span>الضابط المركزي والقاعدة المحكمة للدرس</span>
          </div>
          <p className="font-amiri text-lg sm:text-2xl font-bold text-amber-950 leading-relaxed">
            {lesson.centralRule}
          </p>
        </div>

        {/* Objectives */}
        <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
          <h4 className="text-xs font-bold text-stone-700 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-600" />
            <span>المقاصد والغايات الإتقانية لهذا الدرس:</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {lesson.objectives.map((obj, i) => (
              <li key={i} className="text-xs text-stone-700 flex items-start gap-2 bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-emerald-600 font-bold text-xs">✓</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Filter Tabs for quick jumping */}
      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-stone-200 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
            activeTab === 'all' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          عرض الدرس كاملاً
        </button>
        <button
          onClick={() => setActiveTab('explanation')}
          className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
            activeTab === 'explanation' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          الشرح والتحقيق
        </button>
        <button
          onClick={() => setActiveTab('evidences')}
          className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
            activeTab === 'evidences' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          الأدلة المحكمة ({lesson.quranEvidences.length + lesson.hadithEvidences.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
            activeTab === 'rules' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          القواعد والضوابط ({lesson.principles.length})
        </button>
        {lesson.contemporaryDoubtsAndClarifications && lesson.contemporaryDoubtsAndClarifications.length > 0 && (
          <button
            onClick={() => setActiveTab('doubts')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
              activeTab === 'doubts' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            تفكيك الشبهات ({lesson.contemporaryDoubtsAndClarifications.length})
          </button>
        )}
      </nav>

      {/* 1. Introduction & Systematic Explanation */}
      {(activeTab === 'all' || activeTab === 'explanation') && (
        <section className="space-y-5">
          <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 text-stone-800 leading-relaxed font-sans text-sm sm:text-base">
            <h3 className="text-amber-900 font-bold text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>المدخل والتمهيد التأصيلي</span>
            </h3>
            <p className={getFontSizeClass()}>{lesson.introduction}</p>
          </div>

          <div className="space-y-4">
            {lesson.detailedExplanation.map((sec, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3.5">
                <div className="pb-3 border-b border-stone-100">
                  <h3 className="font-amiri font-bold text-lg sm:text-xl text-stone-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    {sec.sectionTitle}
                  </h3>
                </div>
                <div className={`space-y-3 text-stone-700 ${getFontSizeClass()}`}>
                  {sec.content.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Quranic and Hadith Evidences */}
      {(activeTab === 'all' || activeTab === 'evidences') && (
        <section className="space-y-5">
          <h2 className="font-amiri font-bold text-xl sm:text-2xl text-stone-900 flex items-center gap-2">
            <Quote className="w-5 h-5 text-amber-700" />
            <span>الأدلة الشرعية من الكتاب والسنة مع بيان وجه الاستدلال</span>
          </h2>

          {/* Quranic Ayahs */}
          <div className="grid grid-cols-1 gap-4">
            {lesson.quranEvidences.map((q, i) => (
              <div key={i} className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-200 relative overflow-hidden shadow-2xs">
                <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-600"></div>
                
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-3">
                  <span className="font-bold">سورة {q.surah} - الآية [{q.ayahNumber}]</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[11px] font-bold text-emerald-800">
                    دليل قطعي الثبوت
                  </span>
                </div>

                <div className="text-center py-4 px-4 my-2 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <p className="font-quran text-2xl sm:text-3xl text-emerald-950 leading-loose tracking-wide">
                    ﴿ {q.arabicText} ﴾
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/80 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <span className="font-bold text-amber-900 ml-1">وجه الدلالة والتأصيل:</span>
                  <span>{q.explanation}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hadiths */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            {lesson.hadithEvidences.map((h, i) => (
              <div key={i} className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200 relative overflow-hidden shadow-2xs">
                <div className="absolute top-0 right-0 left-0 h-1 bg-amber-600"></div>
                
                <div className="flex items-center justify-between text-xs text-amber-900 font-semibold mb-3">
                  <span>تخريج الحديث: {h.source}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[11px] font-bold font-mono text-amber-900">
                    الدرجة: {h.grade}
                  </span>
                </div>

                <div className="py-3.5 px-5 my-2 bg-white rounded-xl border border-amber-200 text-right shadow-2xs">
                  <p className="font-amiri font-bold text-lg sm:text-xl text-stone-900 leading-relaxed">
                    {h.hadithText}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/80 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <span className="font-bold text-amber-900 ml-1">وجه الاستدلال الشرعي:</span>
                  <span>{h.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Principles and Scholarly Rules */}
      {(activeTab === 'all' || activeTab === 'rules') && lesson.principles.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-amiri font-bold text-xl sm:text-2xl text-stone-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-700" />
            <span>القواعد والضوابط الفقهية والأصولية المقررة</span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {lesson.principles.map((pr, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <div>
                  <h4 className="font-cairo font-bold text-amber-900 text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 text-xs flex items-center justify-center font-mono font-bold">
                      {idx + 1}
                    </span>
                    {pr.title}
                  </h4>
                </div>
                
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 font-amiri font-bold text-lg text-amber-950">
                  « {pr.rule} »
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <strong className="text-stone-900">البيان والتأصيل: </strong>{pr.explanation}
                </p>
                <div className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <strong className="text-amber-900 font-bold">مثال تطبيقي عملي: </strong>{pr.example}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Contemporary Doubts & Rebuttals (معالجة الشبهات) */}
      {(activeTab === 'all' || activeTab === 'doubts') && lesson.contemporaryDoubtsAndClarifications && lesson.contemporaryDoubtsAndClarifications.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-amiri font-bold text-xl sm:text-2xl text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>معالجة الشبهات المعاصرة وتفنيدها بالبرهان</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold">
              حوار منهجي شجاع
            </span>
          </div>

          <div className="space-y-4">
            {lesson.contemporaryDoubtsAndClarifications.map((d, i) => (
              <div key={i} className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3.5 shadow-2xs">
                <div className="flex items-start gap-2.5 text-rose-900 text-sm font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 text-xs border border-rose-300 shrink-0 font-bold">
                    الشبهة المطروحة
                  </span>
                  <p className="text-stone-900 font-medium">{d.doubt}</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-rose-200 text-xs sm:text-sm text-stone-800 leading-relaxed shadow-2xs">
                  <strong className="text-emerald-700 block mb-1 font-bold">البيان والتفنيد العلمي المحكم:</strong>
                  {d.clarification}
                </div>

                <div className="text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <strong className="font-bold">القاعدة المنهجية لرد الشبهة: </strong>
                  <span>{d.scholarlyRule}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Practical Applications */}
      {(activeTab === 'all' || activeTab === 'applications') && lesson.practicalApplications.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-amiri font-bold text-xl text-stone-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-700" />
            <span>التطبيقات الحياتية والمسائل المعاصرة</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lesson.practicalApplications.map((app, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-700 flex items-start gap-3 shadow-2xs hover:border-amber-300 transition-colors">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{app}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Golden Summary Box (الخلاصة الذهبية) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-amber-50 border border-amber-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-amiri font-bold text-xl sm:text-2xl text-amber-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-700" />
            <span>الخلاصة الذهبية والفوائد الجامعة للدرس</span>
          </h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            للحفظ والتدبر
          </span>
        </div>

        <ul className="space-y-3">
          {lesson.goldenSummary.map((sum, i) => (
            <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-stone-900 leading-relaxed bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 mt-2 shrink-0"></span>
              <span className="font-tajawal">{sum}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bottom Action / Gate Check */}
      <footer className="pt-6 border-t border-stone-100 flex items-center justify-center">
        {/* Gated Quiz CTA */}
        <button
          onClick={onOpenQuiz}
          className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer ${
            isCompleted
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-700'
              : 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-600'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>مُتقن ({quizScore?.score}/{quizScore?.total}) - إعادة اختبار الإتقان</span>
            </>
          ) : (
            <>
              <HelpCircle className="w-5 h-5 text-white" />
              <span>خوض اختبار الإتقان لفتح الدرس التالي</span>
              <ArrowLeft className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </footer>

    </article>
  );
};
