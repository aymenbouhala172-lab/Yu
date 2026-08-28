import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { Door, UserProgress } from '../types';

interface CertificateModalProps {
  door: Door;
  progress: UserProgress;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  door,
  progress,
  onClose,
}) => {
  const [studentName, setStudentName] = useState('طالب العلم المبارك');
  const [isEditingName, setIsEditingName] = useState(false);

  const issueDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certId = `CERT-${door.id.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Top Controls */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-700" />
            <h3 className="font-amiri font-bold text-lg text-stone-900">
              شهادة إتقان وتأصيل منهجي
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="طباعة أو حفظ كملف PDF"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>طباعة الشهادة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-stone-50">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-4 border-amber-500/50 shadow-md relative text-center space-y-6">
            
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 right-3 text-amber-700/60 text-sm font-serif font-black">❖</div>
            <div className="absolute top-3 left-3 text-amber-700/60 text-sm font-serif font-black">❖</div>
            <div className="absolute bottom-3 right-3 text-amber-700/60 text-sm font-serif font-black">❖</div>
            <div className="absolute bottom-3 left-3 text-amber-700/60 text-sm font-serif font-black">❖</div>

            {/* Header / Bismillah */}
            <div className="space-y-1">
              <p className="font-quran text-lg sm:text-2xl text-amber-950 tracking-widest">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="font-cairo text-xs text-stone-500 tracking-wider">
                مِنهَاجُ المُتَفَقِّه • الأَكَادِيمِيَّةُ الشَّرْعِيَّةُ التَّدَرُّجِيَّة
              </p>
            </div>

            {/* Title */}
            <div className="py-2 border-y-2 border-amber-300">
              <h2 className="font-amiri font-bold text-2xl sm:text-3xl text-stone-900">
                شَهَادَةُ إِتْقَانٍ وَتَأْصِيلٍ شَرْعِيّ
              </h2>
            </div>

            {/* Recipient Text */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-stone-600 font-sans">
                تَشْهَدُ إِدَارَةُ المَنْهَجِ بِأَنَّ الطَّالِبَ المُجِدّ:
              </p>

              {/* Student Name (Editable) */}
              <div className="flex items-center justify-center gap-2">
                {isEditingName ? (
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    autoFocus
                    className="p-1 px-3 rounded-xl bg-amber-50 border border-amber-500 text-center font-amiri font-bold text-xl text-amber-950 focus:outline-none"
                  />
                ) : (
                  <h3
                    onClick={() => setIsEditingName(true)}
                    className="font-amiri font-bold text-2xl sm:text-3xl text-amber-900 cursor-pointer hover:underline underline-offset-4 decoration-amber-600"
                    title="انقر لتعديل الاسم"
                  >
                    {studentName} ✎
                  </h3>
                )}
              </div>

              <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed max-w-lg mx-auto">
                قَدْ أَتَمَّ دِرَاسَةَ وَاسْتِيعَابَ جَمِيعِ مَسَائِلِ وَضَوَابِطِ:
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 max-w-md mx-auto shadow-2xs">
                <p className="font-amiri font-bold text-xl sm:text-2xl text-amber-950">
                  {door.title}
                </p>
              </div>

              <p className="text-xs text-stone-500 font-sans max-w-md mx-auto">
                وَاجْتَازَ جَمِيعَ اخْتِبَارَاتِ الإِتْقَانِ وَالتَّحَقُّقِ المَنْهَجِيِّ بِعِنَايَةٍ وَتَوْفِيقٍ مِنَ اللَّهِ تَعَالَى.
              </p>
            </div>

            {/* Seal & Signatures */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div className="text-right space-y-0.5">
                <span className="block text-[11px] text-stone-400">تاريخ الإنجاز:</span>
                <span className="font-mono text-stone-700 font-semibold">{issueDate}</span>
                <span className="block text-[10px] text-stone-400 font-mono">{certId}</span>
              </div>

              {/* Gold Seal Graphic */}
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-100 flex flex-col items-center justify-center text-amber-900 shadow-xs p-1">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
                <span className="text-[8px] font-bold font-cairo">مُعْتَمَد</span>
              </div>

              <div className="text-left space-y-0.5">
                <span className="block text-[11px] text-stone-400">التوقيع والاعتماد:</span>
                <span className="font-amiri text-sm font-bold text-amber-900">مُعلِّم المنهاج الشرعي</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
