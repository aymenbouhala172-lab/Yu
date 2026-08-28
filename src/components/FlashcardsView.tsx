import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  RotateCw, 
  Check, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  BookOpen,
  Compass
} from 'lucide-react';
import { CURRICULUM_DOORS } from '../data/curriculumData';

interface FlashcardItem {
  id: string;
  doorTitle: string;
  doorCategory: string;
  title: string;
  rule: string;
  explanation: string;
  example: string;
}

interface FlashcardsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  // Aggregate all principles from curriculum doors
  const allCards: FlashcardItem[] = [];
  CURRICULUM_DOORS.forEach(door => {
    door.lessons.forEach(lesson => {
      // Add central rule as a card
      allCards.push({
        id: `card-cr-${lesson.id}`,
        doorTitle: door.shortTitle,
        doorCategory: door.category,
        title: `الضابط المركزي: ${lesson.title}`,
        rule: lesson.centralRule,
        explanation: lesson.goldenSummary[0] || lesson.introduction,
        example: lesson.practicalApplications[0] || 'تطبيق شرعي معتمد.',
      });

      // Add detailed principles
      lesson.principles.forEach((p, idx) => {
        allCards.push({
          id: `card-${lesson.id}-${idx}`,
          doorTitle: door.shortTitle,
          doorCategory: door.category,
          title: p.title,
          rule: p.rule,
          explanation: p.explanation,
          example: p.example,
        });
      });
    });
  });

  const [selectedDoorFilter, setSelectedDoorFilter] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  const filteredCards = selectedDoorFilter === 'all'
    ? allCards
    : allCards.filter(c => c.doorCategory === selectedDoorFilter);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleMarkMastered = (cardId: string, isMastered: boolean) => {
    setMasteredCards(prev => ({
      ...prev,
      [cardId]: isMastered,
    }));
    handleNext();
  };

  const masteredCount = Object.values(masteredCards).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri font-bold text-lg text-stone-900">
                بطاقات استحضار وحفظ الضوابط والمتون
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                المراجعة التكرارية للضوابط الفقهية والأصولية والعقدية ({masteredCount} متقن)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => { setSelectedDoorFilter('all'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              selectedDoorFilter === 'all' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
            }`}
          >
            جميع الضوابط ({allCards.length})
          </button>
          <button
            onClick={() => { setSelectedDoorFilter('aqeedah'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              selectedDoorFilter === 'aqeedah' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
            }`}
          >
            العقيدة
          </button>
          <button
            onClick={() => { setSelectedDoorFilter('fiqh'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              selectedDoorFilter === 'fiqh' ? 'bg-amber-700 text-white font-bold shadow-xs' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
            }`}
          >
            الفقه والأصول
          </button>
          <button
            onClick={() => { setSelectedDoorFilter('tazkiyah'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              selectedDoorFilter === 'tazkiyah' ? 'bg-rose-700 text-white font-bold shadow-xs' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
            }`}
          >
            التزكية
          </button>
          <button
            onClick={() => { setSelectedDoorFilter('uloom'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              selectedDoorFilter === 'uloom' ? 'bg-indigo-700 text-white font-bold shadow-xs' : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
            }`}
          >
            علوم الوحي
          </button>
        </div>

        {/* Card Arena */}
        <div className="p-6 flex-1 flex flex-col justify-center items-center overflow-y-auto bg-stone-50">
          {currentCard ? (
            <div className="w-full max-w-lg space-y-4">
              
              {/* Counter and Door Tag */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-stone-200 font-semibold text-amber-900 shadow-2xs">
                  {currentCard.doorTitle}
                </span>
                <span>
                  بطاقة {currentIndex + 1} من {filteredCards.length}
                </span>
              </div>

              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[260px] p-6 rounded-3xl bg-white border-2 border-amber-300 shadow-lg flex flex-col justify-between cursor-pointer transition-all hover:border-amber-500 group relative"
              >
                <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
                  <span className="font-bold text-amber-900">{currentCard.title}</span>
                  <span className="flex items-center gap-1 text-[11px] text-stone-500 group-hover:text-amber-800 transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                    انقر للقلب والبيان
                  </span>
                </div>

                {/* Card Front vs Back Content */}
                {!isFlipped ? (
                  <div className="my-auto py-4 text-center space-y-3">
                    <span className="text-xs text-stone-500 uppercase tracking-widest block">نص الضابط / القاعدة الشرعية:</span>
                    <p className="font-amiri font-bold text-xl sm:text-2xl text-stone-900 leading-relaxed">
                      « {currentCard.rule} »
                    </p>
                  </div>
                ) : (
                  <div className="my-auto py-2 space-y-3 text-right animate-fadeIn">
                    <div>
                      <span className="text-xs text-emerald-800 font-bold block mb-1">البيان والشرح التأصيلي:</span>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                        {currentCard.explanation}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-xs text-amber-900 font-bold block mb-1">مثال تطبيقي:</span>
                      <p className="text-xs text-stone-600 font-sans">
                        {currentCard.example}
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-center text-[10px] text-stone-400 pt-2 border-t border-stone-100">
                  {isFlipped ? 'وجه البطاقة (البيان والتطبيق)' : 'ظهر البطاقة (الضابط والقاعدة)'}
                </div>
              </div>

              {/* Action Rating Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handlePrev()}
                  className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors shadow-2xs cursor-pointer"
                  title="البطاقة السابقة"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleMarkMastered(currentCard.id, false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>يحتاج مراجعة</span>
                  </button>

                  <button
                    onClick={() => handleMarkMastered(currentCard.id, true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>متقن ومحفوظ</span>
                  </button>
                </div>

                <button
                  onClick={() => handleNext()}
                  className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors shadow-2xs cursor-pointer"
                  title="البطاقة التالية"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center text-stone-500 py-10">
              لا توجد بطاقات في هذا التصنيف.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
