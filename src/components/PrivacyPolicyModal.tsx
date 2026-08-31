import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [tab, setTab] = React.useState<'terms' | 'privacy'>(initialTab);

  React.useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-cairo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="سياسة الخصوصية وشروط الخدمة"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-stone-200 bg-gradient-to-l from-amber-50 via-white to-emerald-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                    الخصوصية وشروط الخدمة
                  </h2>
                  <p className="text-[11px] sm:text-xs text-stone-500">
                    التزامنا بحماية بياناتك واحترام خصوصيتك
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-5 sm:px-6 pt-4">
              <button
                onClick={() => setTab('privacy')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  tab === 'privacy'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                سياسة الخصوصية
              </button>
              <button
                onClick={() => setTab('terms')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  tab === 'terms'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                شروط الخدمة
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 text-sm leading-relaxed text-stone-700 space-y-4">
              {tab === 'privacy' ? (
                <>
                  <p className="text-stone-600">
                    نلتزم في <strong className="text-stone-900">منهاج المتفقّه</strong> بأعلى معايير حماية
                    الخصوصية. تشرح هذه السياسة كيفية جمع بياناتك واستخدامها وحفظها بأمان.
                  </p>
                  <Section title="١. البيانات التي نجمعها">
                    نجمع الحد الأدنى الضروري فقط: اسمك وبريدك الإلكتروني عند إنشاء الحساب، بالإضافة إلى
                    بيانات تقدّمك التعليمي (الدروس المكتملة والنتائج). لا نطلب أي بيانات حساسة غير لازمة.
                  </Section>
                  <Section title="٢. حماية كلمة المرور">
                    لا نحفظ كلمة مرورك أبداً كنص صريح. تُشفَّر كلمة المرور محلياً باستخدام خوارزمية
                    <span dir="ltr" className="mx-1 font-mono text-xs">PBKDF2-SHA256</span>
                    مع مِلح عشوائي فريد (salt) لكل مستخدم قبل حفظها، بحيث يستحيل استرجاعها.
                  </Section>
                  <Section title="٣. استخدام البيانات">
                    تُستخدم بياناتك حصراً لتشغيل حسابك، وحفظ تقدّمك، وتخصيص تجربتك التعليمية. لا نبيع بياناتك
                    ولا نشاركها مع أي طرف ثالث لأغراض تسويقية.
                  </Section>
                  <Section title="٤. مكان الحفظ">
                    تُحفظ بيانات حسابك حالياً على جهازك ضمن تخزين المتصفح الآمن، وتبقى تحت سيطرتك الكاملة.
                    يمكنك حذف حسابك وبياناتك في أي وقت.
                  </Section>
                  <Section title="٥. حقوقك">
                    لك الحق الكامل في الوصول إلى بياناتك وتعديلها وحذفها. باستخدامك للتطبيق فإنك توافق على
                    بنود هذه السياسة.
                  </Section>
                </>
              ) : (
                <>
                  <p className="text-stone-600">
                    باستخدامك <strong className="text-stone-900">منهاج المتفقّه</strong> فإنك توافق على
                    الشروط التالية التي تنظّم استخدامك للخدمة.
                  </p>
                  <Section title="١. طبيعة الخدمة">
                    يقدّم التطبيق محتوى تعليمياً شرعياً لأغراض التعلّم والتثقيف. نبذل جهدنا لضمان دقة المحتوى،
                    ويبقى الرجوع إلى أهل العلم المعتبرين هو الأصل عند التفصيل والفتوى.
                  </Section>
                  <Section title="٢. مسؤولية الحساب">
                    أنت مسؤول عن الحفاظ على سرية بيانات دخولك، وعن جميع الأنشطة التي تتم عبر حسابك. يُرجى
                    اختيار كلمة مرور قوية وعدم مشاركتها مع أحد.
                  </Section>
                  <Section title="٣. الاستخدام المقبول">
                    تلتزم باستخدام الخدمة لأغراض مشروعة فقط، وبعدم محاولة الإضرار بها أو إساءة استخدام محتواها
                    أو انتهاك حقوق الآخرين.
                  </Section>
                  <Section title="٤. الملكية الفكرية">
                    جميع المحتويات والتصاميم مملوكة للتطبيق أو مرخّصة له، ولا يجوز إعادة نشرها تجارياً دون إذن.
                  </Section>
                  <Section title="٥. تعديل الشروط">
                    قد نُحدّث هذه الشروط من حين لآخر، ويُعدّ استمرارك في استخدام الخدمة موافقةً على النسخة
                    المحدّثة.
                  </Section>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                فهمت وأوافق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-1.5">
    <h3 className="font-bold text-stone-900 text-sm">{title}</h3>
    <p className="text-stone-600 text-[13px] leading-7">{children}</p>
  </div>
);
