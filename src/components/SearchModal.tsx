import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Compass, 
  Quote, 
  ShieldAlert, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { CURRICULUM_DOORS } from '../data/curriculumData';

interface SearchResultItem {
  doorId: string;
  doorTitle: string;
  lessonId: string;
  lessonTitle: string;
  type: 'title' | 'rule' | 'quran' | 'hadith' | 'doubt' | 'summary';
  snippet: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (doorId: string, lessonId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLesson,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results: SearchResultItem[] = [];
  const q = query.trim().toLowerCase();

  if (q.length >= 2) {
    CURRICULUM_DOORS.forEach(door => {
      door.lessons.forEach(lesson => {
        // Match title or subtitle
        if (lesson.title.toLowerCase().includes(q) || lesson.subtitle.toLowerCase().includes(q)) {
          results.push({
            doorId: door.id,
            doorTitle: door.shortTitle,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: 'title',
            snippet: lesson.subtitle,
          });
        }

        // Match central rule
        if (lesson.centralRule.toLowerCase().includes(q)) {
          results.push({
            doorId: door.id,
            doorTitle: door.shortTitle,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: 'rule',
            snippet: `الضابط: ${lesson.centralRule}`,
          });
        }

        // Match Quran evidences
        lesson.quranEvidences.forEach(ev => {
          if (ev.arabicText.toLowerCase().includes(q) || ev.explanation.toLowerCase().includes(q)) {
            results.push({
              doorId: door.id,
              doorTitle: door.shortTitle,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              type: 'quran',
              snippet: `آية سورة ${ev.surah}: ﴿${ev.arabicText}﴾`,
            });
          }
        });

        // Match Hadith evidences
        lesson.hadithEvidences.forEach(h => {
          if (h.hadithText.toLowerCase().includes(q) || h.explanation.toLowerCase().includes(q)) {
            results.push({
              doorId: door.id,
              doorTitle: door.shortTitle,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              type: 'hadith',
              snippet: `حديث: ${h.hadithText} (${h.source})`,
            });
          }
        });

        // Match Principles
        lesson.principles.forEach(p => {
          if (p.rule.toLowerCase().includes(q) || p.explanation.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)) {
            results.push({
              doorId: door.id,
              doorTitle: door.shortTitle,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              type: 'rule',
              snippet: `قاعدة: ${p.title} - ${p.rule}`,
            });
          }
        });

        // Match Doubts
        lesson.contemporaryDoubtsAndClarifications?.forEach(d => {
          if (d.doubt.toLowerCase().includes(q) || d.clarification.toLowerCase().includes(q)) {
            results.push({
              doorId: door.id,
              doorTitle: door.shortTitle,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              type: 'doubt',
              snippet: `شبهة وتفنيد: ${d.doubt}`,
            });
          }
        });
      });
    });
  }

  const getTypeBadge = (t: string) => {
    switch (t) {
      case 'quran': return { label: 'آية قرآنية', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' };
      case 'hadith': return { label: 'حديث نبوي', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' };
      case 'rule': return { label: 'ضابط / قاعدة', color: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold' };
      case 'doubt': return { label: 'تفنيد شبهة', color: 'bg-rose-100 text-rose-900 border-rose-300 font-bold' };
      default: return { label: 'عنوان درس', color: 'bg-stone-100 text-stone-700 border-stone-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-700 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مسألة، ضابط، آية، حديث، أو شبهة معاصرة (مثلاً: ربا، وضوء، طهارة، قدر)..."
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-500 hover:text-stone-800 text-xs px-2 py-1 cursor-pointer"
            >
              مسح
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {q.length < 2 ? (
            <div className="text-center py-10 space-y-2 text-stone-500 text-xs sm:text-sm">
              <Compass className="w-8 h-8 mx-auto text-stone-400" />
              <p>اكتب كلمتين أو أكثر للبحث الشامل في المنهاج الشرعي</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-stone-600 text-xs sm:text-sm">
              <p>لم نجد نتائج مطابقة لـ «{query}».</p>
              <p className="text-xs text-stone-400">جرب البحث بكلمات أخرى أو تصفح الأبواب مباشرة.</p>
            </div>
          ) : (
            results.map((res, i) => {
              const badge = getTypeBadge(res.type);
              return (
                <button
                  key={i}
                  onClick={() => {
                    onSelectLesson(res.doorId, res.lessonId);
                    onClose();
                  }}
                  className="w-full text-right p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-stone-200 hover:border-amber-400 transition-all flex flex-col gap-1.5 group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-amber-900 group-hover:text-amber-800">
                      {res.doorTitle} • {res.lessonTitle}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 line-clamp-2 leading-relaxed font-sans">
                    {res.snippet}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
            <span>تم العثور على {results.length} نتيجة</span>
            <span className="text-[11px] text-stone-400">انقر للانتقال المباشر للدرس</span>
          </div>
        )}

      </div>
    </div>
  );
};
