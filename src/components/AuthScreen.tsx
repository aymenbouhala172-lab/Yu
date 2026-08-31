import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  registerUser,
  loginUser,
  startSession,
  setRememberedEmail,
  getRememberedEmail,
  isValidEmail,
  evaluatePasswordStrength,
  SessionUser,
} from '../utils/auth';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface AuthScreenProps {
  onAuthenticated: (user: SessionUser) => void;
}

type Mode = 'register' | 'login';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<Mode>('register');

  const [name, setName] = useState('');
  const [email, setEmail] = useState(getRememberedEmail());
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!getRememberedEmail());

  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<'terms' | 'privacy'>('privacy');

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  // التحقق الذكي من الإيميل
  const emailError =
    emailTouched && email.length > 0 && !isValidEmail(email)
      ? email.includes('@')
        ? 'يبدو أن امتداد البريد غير صحيح (مثال: name@example.com)'
        : 'البريد الإلكتروني ناقص علامة @'
      : null;

  // تطابق كلمة المرور مع التأكيد
  const confirmError =
    mode === 'register' && confirmTouched && confirm.length > 0 && confirm !== password
      ? 'كلمتا المرور غير متطابقتين'
      : null;

  const openPolicy = (tab: 'terms' | 'privacy') => {
    setPolicyTab(tab);
    setPolicyOpen(true);
  };

  const resetFields = () => {
    setFormError(null);
    setPassword('');
    setConfirm('');
    setConfirmTouched(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValidEmail(email)) {
      setEmailTouched(true);
      setFormError('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setFormError('يرجى إدخال اسمك الكريم.');
        return;
      }
      if (password.length < 8) {
        setFormError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
        return;
      }
      if (password !== confirm) {
        setConfirmTouched(true);
        setFormError('كلمتا المرور غير متطابقتين.');
        return;
      }
    }

    setSubmitting(true);
    try {
      let user: SessionUser;
      if (mode === 'register') {
        user = await registerUser({ name, email, password });
      } else {
        user = await loginUser({ email, password });
      }

      // تذكّرني
      setRememberedEmail(rememberMe ? email : null);

      startSession(user);
      onAuthenticated(user);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-islamic-pattern font-cairo text-stone-900 flex items-center justify-center p-4 selection:bg-amber-500/20">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg gold-glow mb-3">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gold-gradient">منهاج المتفقّه</h1>
          <p className="text-sm text-stone-500 mt-1">
            {mode === 'register' ? 'أنشئ حسابك لتبدأ رحلة التحصيل' : 'مرحباً بعودتك، أكمل مسيرتك العلمية'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/95 backdrop-blur border border-stone-200 shadow-xl p-6 sm:p-7">
          {/* Mode Switch */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-stone-100 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                resetFields();
              }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              إنشاء حساب
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetFields();
              }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name (register only) */}
            <AnimatePresence mode="popLayout">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Field label="الاسم الكريم">
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="اكتب اسمك"
                        autoComplete="name"
                        className="w-full pr-10 pl-3 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                      />
                    </div>
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <Field label="البريد الإلكتروني">
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full pr-10 pl-3 py-3 rounded-xl bg-stone-50 border outline-none text-sm text-right transition-all focus:ring-2 ${
                    emailError
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </Field>

            {/* Password */}
            <Field label="كلمة المرور">
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="w-full pr-10 pl-11 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* مقياس القوة (register only) */}
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((seg) => {
                      const active =
                        (strength.score >= 1 && seg === 1) ||
                        (strength.score >= 2 && seg === 2) ||
                        (strength.score >= 4 && seg === 3);
                      return (
                        <div
                          key={seg}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            active ? strength.color : 'bg-stone-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className={`mt-1 text-[11px] font-bold ${strength.textColor}`}>
                    قوة كلمة المرور: {strength.label}
                  </p>
                </div>
              )}
            </Field>

            {/* Confirm password (register only) */}
            <AnimatePresence mode="popLayout">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Field label="تأكيد كلمة المرور">
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        onBlur={() => setConfirmTouched(true)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`w-full pr-10 pl-11 py-3 rounded-xl bg-stone-50 border outline-none text-sm transition-all focus:ring-2 ${
                          confirmError
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : confirm.length > 0 && confirm === password
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                            : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                        aria-label={showConfirm ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {confirmError ? (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {confirmError}
                        </motion.p>
                      ) : confirm.length > 0 && confirm === password ? (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          كلمتا المرور متطابقتان
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <span className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="w-5 h-5 rounded-md border-2 border-stone-300 bg-white peer-checked:bg-amber-600 peer-checked:border-amber-600 transition-all flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </span>
              </span>
              <span className="text-sm text-stone-600 group-hover:text-stone-800 transition-colors">
                تذكّرني لتسهيل الدخول لاحقاً
              </span>
            </label>

            {/* Form error */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm shadow-md gold-glow transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ المعالجة...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'register' ? 'إنشاء الحساب والبدء' : 'الدخول إلى المنهاج'}
                </>
              )}
            </button>
          </form>

          {/* Privacy & Terms note */}
          <p className="mt-5 text-center text-[11px] leading-6 text-stone-400">
            بالتسجيل، أنت توافق على{' '}
            <button
              type="button"
              onClick={() => openPolicy('terms')}
              className="text-amber-600 hover:text-amber-700 font-semibold underline underline-offset-2 cursor-pointer"
            >
              شروط الخدمة
            </button>{' '}
            و
            <button
              type="button"
              onClick={() => openPolicy('privacy')}
              className="text-amber-600 hover:text-amber-700 font-semibold underline underline-offset-2 cursor-pointer"
            >
              سياسة الخصوصية
            </button>{' '}
            الخاصة بنا.
          </p>
        </div>

        <p className="text-center text-[11px] text-stone-400 mt-5">
          تم إنشاؤه بواسطة أيمن بوحالة — بارك الله في جهوده
        </p>
      </div>

      <PrivacyPolicyModal isOpen={policyOpen} onClose={() => setPolicyOpen(false)} initialTab={policyTab} />
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-stone-600 mb-1.5">{label}</label>
    {children}
  </div>
);
